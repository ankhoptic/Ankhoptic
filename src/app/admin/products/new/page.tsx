"use client";
import React, { useState, useEffect } from "react";
import toast from "react-hot-toast";
import { useRouter, useSearchParams } from "next/navigation";
import dynamic from "next/dynamic";
import {
  Box,
  Flex,
  Grid,
  GridItem,
  Text,
  VStack,
  Textarea,
  Switch,
} from "@chakra-ui/react";
import NextLink from "next/link";
import {
  T,
  SectionCard,
  FormField,
  AdminButton,
  InputField,
  SelectField,
  AdminLoader,
  FieldError,
  ProductImages,
} from "@/components/admin/ui";
import { z } from "zod";

const productSchema = z.object({
  title: z.string().min(1, "Product title is required"),
  price: z
    .string()
    .min(1, "Price is required")
    .refine(
      (v) => !isNaN(Number(v)) && Number(v) > 0,
      "Must be a valid positive price",
    ),
  comparePrice: z
    .string()
    .optional()
    .refine(
      (v) => !v || (!isNaN(Number(v)) && Number(v) > 0),
      "Must be a valid price",
    ),
  stockCount: z
    .string()
    .refine((v) => !isNaN(Number(v)) && Number(v) >= 0, "Must be 0 or more"),
  slug: z.string().optional(),
  categoryId: z.string().min(1, "Category is required"),
  brandId: z.string().min(1, "Brand is required"),
  // Lens-specific — validated at runtime based on productType
  color: z.string().optional(),
  disposability: z.string().optional(),
});
type ProductErrors = Partial<
  Record<keyof z.infer<typeof productSchema>, string>
> & {
  images?: string;
};

function toSlug(t: string) {
  return t
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

function ProductForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const editId = searchParams.get("id"); // present = edit mode
  const isEdit = !!editId;

  const [formLoading, setFormLoading] = useState(isEdit); // fetch existing product
  const [form, setForm] = useState({
    title: "",
    slug: "",
    description: "",
    productType: "LENS", // "LENS" | "GLASSES"
    color: "",
    disposability: "ONE_DAY",

    price: "4000",
    comparePrice: "",
    stockCount: "0",
    status: "ACTIVE",
    featured: false,
    inStock: true,
    brandId: "",
    categoryId: "",
  });

  const [lensConfig, setLensConfig] = useState<{
    lens_colors: string[];
    modality_options: { label: string; value: string }[];
    power_options: string[];
  } | null>(null);
  const [brands, setBrands] = useState<{ id: string; name: string }[]>([]);
  const [dbCategories, setDbCategories] = useState<
    {
      id: string;
      name: string;
      parentId: string | null;
      brandId: string | null;
    }[]
  >([]);
  const [selectedPowers, setSelectedPowers] = useState<string[]>([]);
  const [supportsEyesight, setSupportsEyesight] = useState(true);
  const [images, setImages] = useState<string[]>([]); // uploaded Cloudinary URLs
  const [pendingImages, setPendingImages] = useState<File[]>([]); // local files not yet uploaded
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState<ProductErrors>({});

  const set = (k: keyof typeof form, v: string | boolean) =>
    setForm((f) => ({ ...f, [k]: v }));

  const setTitle = (v: string) =>
    setForm((f) => ({ ...f, title: v, slug: toSlug(v) }));

  // Fetch brands + categories + lens config
  useEffect(() => {
    Promise.all([
      fetch("/api/brands").then((r) => r.json()),
      fetch("/api/categories?flat=1").then((r) => r.json()),
      fetch("/api/settings/lens-config").then((r) => r.json()),
    ])
      .then(([brandsData, catsData, configData]) => {
        setBrands(Array.isArray(brandsData) ? brandsData : []);
        setDbCategories(catsData.categories || []);
        setLensConfig(configData);
      })
      .catch(console.error);
  }, []);

  // Fetch existing product if in edit mode
  useEffect(() => {
    if (!editId) return;
    setFormLoading(true);
    fetch(`/api/products/${editId}`)
      .then((r) => r.json())
      .then((p) => {
        setForm({
          title: p.title ?? "",
          slug: p.slug ?? "",
          description: p.description ?? "",
          productType: p.productType ?? "LENS",
          color: p.color ?? "",
          disposability: p.disposability ?? "ONE_DAY",
          price: p.price?.toString() ?? "",
          comparePrice: p.comparePrice?.toString() ?? "",
          stockCount: p.stockCount?.toString() ?? "0",
          status: p.status ?? "DRAFT",
          featured: p.featured ?? false,
          inStock: p.inStock ?? true,
          brandId: p.brandId ?? "",
          categoryId: p.categoryId ?? "",
        });
        if (Array.isArray(p.images)) setImages(p.images);
        // load existing powers
        if (p.powerOptions?.length) {
          setSelectedPowers(
            p.powerOptions.map((po: { value: string }) => po.value),
          );
        }
      })
      .catch(() => setError("Failed to load product data"))
      .finally(() => setFormLoading(false));
  }, [editId]);

  const togglePower = (v: string) =>
    setSelectedPowers((p) =>
      p.includes(v) ? p.filter((x) => x !== v) : [...p, v],
    );

  const handleSave = async (asDraft = false) => {
    setSaving(true);
    setError("");
    setFieldErrors({});

    // Validate — collect all errors before returning
    const errs: ProductErrors = {};
    const parsed = productSchema.safeParse(form);
    if (!parsed.success) {
      for (const issue of parsed.error.issues) {
        const key = issue.path[0] as keyof ProductErrors;
        if (!errs[key]) errs[key] = issue.message;
      }
    }
    // Lens-specific required fields
    if (form.productType === "LENS") {
      if (!form.color) errs.color = "Color is required for lenses";
      if (!form.disposability)
        errs.disposability = "Disposability is required for lenses";
    }
    // At least one image required
    if (images.length === 0 && pendingImages.length === 0) {
      errs.images = "At least one product image is required";
    }
    if (Object.keys(errs).length > 0) {
      setFieldErrors(errs);
      setSaving(false);
      setError("Please fix the errors below.");
      return;
    }

    try {
      // Upload pending images to Cloudinary first
      let uploadedUrls: string[] = [];
      if (pendingImages.length > 0) {
        const results = await Promise.allSettled(
          pendingImages.map(async (file) => {
            const fd = new FormData();
            fd.append("file", file);
            const res = await fetch("/api/upload", {
              method: "POST",
              body: fd,
            });
            if (!res.ok) throw new Error(`Upload failed for ${file.name}`);
            const { url } = await res.json();
            return url as string;
          }),
        );
        uploadedUrls = results
          .filter(
            (r): r is PromiseFulfilledResult<string> =>
              r.status === "fulfilled",
          )
          .map((r) => r.value);
        const failed = results.filter((r) => r.status === "rejected").length;
        if (failed > 0) toast.error(`${failed} image(s) failed to upload`);
      }
      const finalImages = [...images, ...uploadedUrls];

      const isLens = form.productType === "LENS";
      const payload: any = {
        title: form.title,
        slug: form.slug || toSlug(form.title),
        description: form.description || null,
        productType: form.productType,
        price: parseFloat(form.price),
        comparePrice: form.comparePrice ? parseFloat(form.comparePrice) : null,
        color: isLens && form.color ? form.color.toUpperCase() : null,
        images: finalImages,
        inStock: form.inStock,
        stockCount: parseInt(form.stockCount || "0"),
        status: asDraft ? "DRAFT" : form.status,
        featured: form.featured,
        brandId: form.brandId || null,
        categoryId: form.categoryId || null,
      };

      if (isLens && form.disposability) {
        payload.disposability = form.disposability;
      }

      let productId = editId;

      if (isEdit) {
        // PATCH existing product
        const res = await fetch(`/api/products/${editId}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        if (!res.ok)
          throw new Error((await res.json()).error ?? "Update failed");
      } else {
        // POST new product
        const res = await fetch("/api/products", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error ?? "Failed to create product");
        productId = data.id;
      }

      // Sync power options
      if (supportsEyesight && selectedPowers.length > 0 && productId) {
        if (isEdit) {
          // Delete old powers then re-create
          await fetch(`/api/products/${productId}/powers`, {
            method: "DELETE",
          });
        }
        await Promise.all(
          selectedPowers.map((value, idx) =>
            fetch(`/api/products/${productId}/powers`, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ value, label: value, position: idx }),
            }),
          ),
        );
      }

      router.push("/admin/products");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong");
    } finally {
      setSaving(false);
    }
  };

  if (formLoading) return <AdminLoader message="Loading product..." />;

  return (
    <Box bg={T.bg} minH="100%" p={6}>
      {/* Breadcrumb */}
      <Flex align="center" gap={1.5} mb={5}>
        <NextLink href="/admin/products">
          <Text
            fontSize="13px"
            color={T.sub}
            cursor="pointer"
            _hover={{ color: T.text }}
          >
            Products
          </Text>
        </NextLink>
        <Text fontSize="13px" color={T.placeholder}>
          /
        </Text>
        <Text fontSize="13px" fontWeight={600} color={T.text}>
          {isEdit ? "Edit product" : "Add product"}
        </Text>
      </Flex>

      <Box
        position="sticky"
        top={0}
        zIndex={50}
        bg="rgba(248,250,252,0.92)"
        backdropFilter="blur(8px)"
        borderBottom={`1px solid ${T.border}`}
        mx={-6}
        px={6}
        pt={3}
        pb={error ? 3 : 3}
        mb={6}
      >
        <Flex justify="space-between" align="center">
          <Text fontSize="20px" fontWeight={700} color={T.text}>
            {isEdit ? "Edit product" : "Add product"}
          </Text>
          <Flex gap={2}>
            <AdminButton
              variant="secondary"
              onClick={() => handleSave(true)}
              disabled={saving}
            >
              Save as draft
            </AdminButton>
            <AdminButton
              variant="primary"
              px={6}
              onClick={() => handleSave(false)}
              disabled={saving}
            >
              {saving ? "Saving…" : isEdit ? "Update product" : "Save product"}
            </AdminButton>
          </Flex>
        </Flex>
        {error && (
          <Box
            bg={T.redBg}
            border={`1px solid ${T.border}`}
            borderRadius="8px"
            px={3}
            py={2}
            mt={2}
          >
            <Text fontSize="12.5px" color={T.red}>
              {error}
            </Text>
          </Box>
        )}
      </Box>

      <Grid templateColumns={{ base: "1fr", lg: "1fr 300px" }} gap={5}>
        {/* ── LEFT ── */}
        <GridItem>
          <VStack gap={4} align="stretch">
            <SectionCard title="Product information">
              <FormField label="Title" required>
                <InputField
                  iconName="tag"
                  placeholder="e.g. Almond Brown One Day Collection – Bella"
                  value={form.title}
                  onChange={(e) => setTitle(e.target.value)}
                  isInvalid={!!fieldErrors.title}
                />
                <FieldError msg={fieldErrors.title} />
              </FormField>
              <FormField
                label="Slug"
                hint="Auto-generated from title; edit if needed"
              >
                <InputField
                  iconName="hash"
                  placeholder="almond-brown-one-day"
                  value={form.slug}
                  onChange={(e) => set("slug", e.target.value)}
                />
              </FormField>
              <FormField label="Description" mb={0}>
                <Textarea
                  size="md"
                  borderRadius="8px"
                  borderColor={T.border}
                  rows={4}
                  fontSize="13.5px"
                  px="12px"
                  py="10px"
                  bg="white"
                  placeholder="Describe this product for customers..."
                  value={form.description}
                  onChange={(e) => set("description", e.target.value)}
                  _focus={{
                    borderColor: T.green,
                    boxShadow: "0 0 0 2px rgba(16,185,129,0.12)",
                  }}
                  _placeholder={{ color: T.placeholder }}
                />
              </FormField>
            </SectionCard>

            <SectionCard
              title="Product type & details"
              subtitle="Select type — lens-specific fields appear for Lenses only"
            >
              {/* ── Type toggle ── */}
              <Flex gap={2} mb={5}>
                {(["LENS", "GLASSES"] as const).map((type) => {
                  const active = form.productType === type;
                  return (
                    <Box
                      key={type}
                      as="button"
                      px={5}
                      py={2}
                      borderRadius="20px"
                      fontSize="13px"
                      fontWeight={600}
                      cursor="pointer"
                      transition="all 0.15s"
                      bg={active ? T.green : "white"}
                      color={active ? "white" : T.sub}
                      border={`1.5px solid ${active ? T.green : T.border}`}
                      _hover={{
                        borderColor: T.green,
                        color: active ? "white" : T.green,
                      }}
                      onClick={() => set("productType", type)}
                    >
                      {type === "LENS" ? "🔍 Lenses" : "👓 Glasses"}
                    </Box>
                  );
                })}
              </Flex>

              <Grid templateColumns="1fr 1fr" gap={4}>
                <FormField label="Brand" required>
                  <SelectField
                    placeholder={
                      brands.length === 0 ? "No brands yet" : "Select brand"
                    }
                    value={form.brandId}
                    onChange={(e) => set("brandId", e.target.value)}
                    options={brands.map((b) => ({
                      value: b.id,
                      label: b.name,
                    }))}
                    isInvalid={!!fieldErrors.brandId}
                    disabled={brands.length === 0}
                  />
                  {brands.length === 0 ? (
                    <Text fontSize="11.5px" color={T.sub} mt={1}>
                      No brands found —{" "}
                      <NextLink
                        href="/admin/brands"
                        style={{ color: T.green, fontWeight: 600 }}
                      >
                        add a brand first
                      </NextLink>
                    </Text>
                  ) : (
                    <FieldError msg={fieldErrors.brandId} />
                  )}
                </FormField>
                <FormField label="Category" required>
                  <SelectField
                    placeholder={
                      dbCategories.length === 0
                        ? "No categories yet"
                        : "Select category"
                    }
                    value={form.categoryId}
                    onChange={(e) => set("categoryId", e.target.value)}
                    options={dbCategories
                      .filter((c) =>
                        form.brandId ? c.brandId === form.brandId : !c.brandId,
                      )
                      .map((c) => ({
                        value: c.id,
                        label: c.parentId ? `↳ ${c.name}` : c.name,
                      }))}
                    isInvalid={!!fieldErrors.categoryId}
                    disabled={dbCategories.length === 0}
                  />
                  {dbCategories.length === 0 ? (
                    <Text fontSize="11.5px" color={T.sub} mt={1}>
                      No categories found —{" "}
                      <NextLink
                        href="/admin/categories"
                        style={{ color: T.green, fontWeight: 600 }}
                      >
                        add a category first
                      </NextLink>
                    </Text>
                  ) : (
                    <FieldError msg={fieldErrors.categoryId} />
                  )}
                </FormField>

                {/* Lens-only fields */}
                {form.productType === "LENS" && (
                  <>
                    <FormField label="Color" required>
                      <SelectField
                        placeholder={
                          !lensConfig || lensConfig.lens_colors.length === 0
                            ? "No colors configured"
                            : "Select color"
                        }
                        value={form.color}
                        onChange={(e) => set("color", e.target.value)}
                        options={lensConfig?.lens_colors ?? []}
                        isInvalid={!!fieldErrors.color}
                        disabled={
                          !lensConfig || lensConfig.lens_colors.length === 0
                        }
                      />
                      {!lensConfig || lensConfig.lens_colors.length === 0 ? (
                        <Text fontSize="11.5px" color={T.sub} mt={1}>
                          Configure colors in{" "}
                          <NextLink
                            href="/admin/settings"
                            style={{ color: T.green, fontWeight: 600 }}
                          >
                            Lens Settings
                          </NextLink>
                        </Text>
                      ) : (
                        <FieldError msg={fieldErrors.color} />
                      )}
                    </FormField>
                    <FormField label="Disposability" required>
                      <SelectField
                        placeholder={
                          !lensConfig ||
                          lensConfig.modality_options.length === 0
                            ? "No modalities configured"
                            : "Select modality"
                        }
                        value={form.disposability}
                        onChange={(e) => set("disposability", e.target.value)}
                        options={lensConfig?.modality_options ?? []}
                        isInvalid={!!fieldErrors.disposability}
                        disabled={
                          !lensConfig ||
                          lensConfig.modality_options.length === 0
                        }
                      />
                      {!lensConfig ||
                      lensConfig.modality_options.length === 0 ? (
                        <Text fontSize="11.5px" color={T.sub} mt={1}>
                          Configure modalities in{" "}
                          <NextLink
                            href="/admin/settings"
                            style={{ color: T.green, fontWeight: 600 }}
                          >
                            Lens Settings
                          </NextLink>
                        </Text>
                      ) : (
                        <FieldError msg={fieldErrors.disposability} />
                      )}
                    </FormField>
                  </>
                )}
              </Grid>
            </SectionCard>

            <SectionCard
              title="Power options"
              subtitle="Optional — for prescription lenses or glasses"
            >
              <Flex align="center" gap={3} mb={4}>
                <Switch.Root
                  checked={supportsEyesight}
                  onCheckedChange={(e) => setSupportsEyesight(!!e.checked)}
                  colorPalette="green"
                >
                  <Switch.HiddenInput />
                  <Switch.Control>
                    <Switch.Thumb />
                  </Switch.Control>
                </Switch.Root>
                <Text fontSize="13px" color={T.text}>
                  {supportsEyesight
                    ? "Customers can choose Plain or with power"
                    : "Plain only — no power selection"}
                </Text>
              </Flex>

              {supportsEyesight && (
                <>
                  <Box h="1px" bg={T.bg} mb={4} />

                  {/* Quick-action buttons */}
                  <Flex gap={2} mb={4} flexWrap="wrap" align="center">
                    <Text fontSize="12px" fontWeight={600} color={T.sub} mr={1}>
                      Quick select:
                    </Text>
                    {[
                      {
                        label: `Select all (${lensConfig?.power_options.length ?? 0})`,
                        action: () =>
                          setSelectedPowers(lensConfig?.power_options ?? []),
                      },
                      {
                        label: "Clear all",
                        action: () => setSelectedPowers([]),
                      },
                      {
                        label: "Common range",
                        action: () => {
                          const common: string[] = [];
                          for (
                            let i = 0.25;
                            i <= 6 + 0.001;
                            i = Math.round((i + 0.25) * 100) / 100
                          ) {
                            common.push(`-${i.toFixed(2)}`);
                          }
                          setSelectedPowers(
                            common.filter((v) =>
                              (lensConfig?.power_options ?? []).includes(v),
                            ),
                          );
                        },
                      },
                    ].map(({ label, action }) => (
                      <button
                        key={label}
                        type="button"
                        onClick={action}
                        style={{
                          padding: "5px 12px",
                          borderRadius: "7px",
                          fontSize: "12px",
                          fontWeight: 500,
                          border: `1px solid ${T.border}`,
                          background: "white",
                          color: T.text,
                          cursor: "pointer",
                        }}
                      >
                        {label}
                      </button>
                    ))}
                  </Flex>

                  {/* Power chips grid */}
                  <Text fontSize="13px" fontWeight={600} color={T.text} mb={2}>
                    Available power values
                  </Text>
                  <Flex gap={2} flexWrap="wrap" mb={4}>
                    {(lensConfig?.power_options ?? []).map((p) => {
                      const active = selectedPowers.includes(p);
                      return (
                        <Box
                          key={p}
                          onClick={() => togglePower(p)}
                          px={3}
                          py={1.5}
                          borderRadius="8px"
                          cursor="pointer"
                          fontSize="13px"
                          fontWeight={active ? 700 : 400}
                          border="1px solid"
                          borderColor={active ? T.green : T.border}
                          bg={active ? T.greenLight : "white"}
                          color={active ? "#065f46" : T.gray}
                          transition="all 0.1s"
                          userSelect="none"
                        >
                          {p}
                        </Box>
                      );
                    })}
                  </Flex>

                  <Text fontSize="12px" color={T.sub} mt={3}>
                    {selectedPowers.length} power
                    {selectedPowers.length !== 1 ? "s" : ""} selected
                  </Text>
                </>
              )}
            </SectionCard>

            <SectionCard title="Product images">
              <ProductImages
                urls={images}
                pendingFiles={pendingImages}
                onChange={(newUrls, newFiles) => {
                  setImages(newUrls);
                  setPendingImages(newFiles);
                }}
              />
              <FieldError msg={fieldErrors.images} />
            </SectionCard>
          </VStack>
        </GridItem>

        {/* ── RIGHT ── */}
        <GridItem>
          <Box position="sticky" top="64px">
            <VStack gap={4} align="stretch">
              <SectionCard title="Status">
                <SelectField
                  value={form.status}
                  onChange={(e) => set("status", e.target.value)}
                  options={[
                    { value: "DRAFT", label: "Draft" },
                    { value: "ACTIVE", label: "Active" },
                    { value: "ARCHIVED", label: "Archived" },
                  ]}
                />
              </SectionCard>

              <SectionCard title="Pricing">
                <FormField label="Price (PKR)" required>
                  <InputField
                    prefix="PKR"
                    type="number"
                    placeholder="0"
                    value={form.price}
                    onChange={(e) => set("price", e.target.value)}
                    isInvalid={!!fieldErrors.price}
                  />
                  <FieldError msg={fieldErrors.price} />
                </FormField>
                <FormField label="Compare-at price" mb={0}>
                  <InputField
                    prefix="PKR"
                    type="number"
                    placeholder="0"
                    value={form.comparePrice}
                    onChange={(e) => set("comparePrice", e.target.value)}
                    isInvalid={!!fieldErrors.comparePrice}
                  />
                  <FieldError msg={fieldErrors.comparePrice} />
                </FormField>
                <Box bg="#f8fafc" borderRadius="8px" px={3} py={2.5} mt={3}>
                  <Text fontSize="12px" color={T.sub}>
                    Discount % auto-calculated from compare-at price
                  </Text>
                </Box>
              </SectionCard>

              <SectionCard title="Inventory">
                <FormField label="Stock quantity">
                  <InputField
                    iconName="package"
                    type="number"
                    placeholder="0"
                    value={form.stockCount}
                    onChange={(e) => set("stockCount", e.target.value)}
                    isInvalid={!!fieldErrors.stockCount}
                  />
                  <FieldError msg={fieldErrors.stockCount} />
                </FormField>
                <FormField label="SKU (optional)" mb={0}>
                  <InputField iconName="hash" placeholder="e.g. BELLA-ALM-OD" />
                </FormField>
                <Flex align="center" gap={2.5} mt={3}>
                  <Switch.Root
                    checked={form.inStock}
                    onCheckedChange={(e) => set("inStock", !!e.checked)}
                    colorPalette="green"
                  >
                    <Switch.HiddenInput />
                    <Switch.Control>
                      <Switch.Thumb />
                    </Switch.Control>
                  </Switch.Root>
                  <Text fontSize="13px" color={T.text}>
                    In stock
                  </Text>
                </Flex>
              </SectionCard>

              <SectionCard title="Visibility">
                <VStack gap={3} align="stretch">
                  <Flex align="center" justify="space-between">
                    <Text fontSize="13px" color={T.text}>
                      Featured product
                    </Text>
                    <Switch.Root
                      checked={form.featured}
                      onCheckedChange={(e) => set("featured", !!e.checked)}
                      colorPalette="green"
                    >
                      <Switch.HiddenInput />
                      <Switch.Control>
                        <Switch.Thumb />
                      </Switch.Control>
                    </Switch.Root>
                  </Flex>
                </VStack>
              </SectionCard>
            </VStack>
          </Box>
        </GridItem>
      </Grid>
    </Box>
  );
}

export default dynamic(() => Promise.resolve(ProductForm), {
  ssr: false,
  loading: () => <AdminLoader message="Loading product form..." />,
});
