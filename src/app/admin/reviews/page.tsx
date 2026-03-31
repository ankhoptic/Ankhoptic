"use client";
import { useState, useEffect } from "react";
import {
  Box,
  Text,
  HStack,
  Grid,
  Image,
  Icon,
  Badge,
  VStack,
  IconButton,
} from "@chakra-ui/react";
import {
  T,
  PageHeader,
  StatCard,
  TableShell,
  THead,
  TR,
  TD,
  EmptyRow,
  AdminButton,
  FormField,
  InputField,
  AdminModal,
  AdminLoader,
  SelectField,
  ConfirmDialog,
} from "@/components/admin/ui";
import toast from "react-hot-toast";
import { ImageUpload } from "@/components/admin/ImageUpload";
import {
  Star,
  MessageSquare,
  User,
  Trash2,
  Edit,
} from "lucide-react";

interface Review {
  id: string;
  rating: number;
  heading: string | null;
  text: string | null;
  name: string;
  customerMeta: string | null;
  image: string | null;
  product: { title: string; slug: string } | null;
  productId: string;
  isFeatured: boolean;
  approved: boolean;
  createdAt: string;
}

export default function ReviewsPage() {
  const [data, setData] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [editingItem, setEditingItem] = useState<Review | null>(null);
  const [itemToDelete, setItemToDelete] = useState<string | null>(null);
  const [products, setProducts] = useState<{ id: string; title: string; slug: string }[]>([]);

  // Form State
  const [formData, setFormData] = useState({
    rating: 5,
    heading: "",
    text: "",
    name: "",
    customerMeta: "",
    productId: "",
    image: "", // Base64 or existing URL
    approved: true,
    isFeatured: false,
  });
  const [previewUrl, setPreviewUrl] = useState("");
  const [pendingFile, setPendingFile] = useState<File | null>(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/admin/reviews");
      const json = await res.json();
      setData(Array.isArray(json) ? json : []);

      const prodRes = await fetch("/api/products?limit=1000");
      const prodJson = await prodRes.json();
      setProducts(prodJson.products || []);
    } catch {
      toast.error("Failed to load reviews");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleOpenModal = (item?: Review) => {
    if (item) {
      setEditingItem(item);
      setFormData({
        rating: item.rating,
        heading: item.heading || "",
        text: item.text || "",
        name: item.name,
        customerMeta: item.customerMeta || "",
        productId: item.productId || "",
        image: item.image || "",
        approved: item.approved,
        isFeatured: item.isFeatured,
      });
      setPreviewUrl(item.image || "");
    } else {
      setEditingItem(null);
      setFormData({
        rating: 5,
        heading: "",
        text: "",
        name: "",
        customerMeta: "",
        productId: "",
        image: "",
        approved: true,
        isFeatured: false,
      });
      setPreviewUrl("");
    }
    setPendingFile(null);
    setIsModalOpen(true);
  };

  const convertToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = (error) => reject(error);
    });
  };

  const handleSubmit = async () => {
    if (!formData.name || !formData.text || !formData.productId) {
      toast.error("Name, Review Content, and Product are required");
      return;
    }

    setSubmitting(true);
    try {
      let finalImage = formData.image;

      if (pendingFile) {
        finalImage = await convertToBase64(pendingFile);
      }

      const payload = { ...formData, image: finalImage };
      const url = editingItem
        ? `/api/admin/reviews/${editingItem.id}`
        : "/api/admin/reviews";
      const method = editingItem ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error();

      toast.success(editingItem ? "Review updated" : "Review added");
      setIsModalOpen(false);
      fetchData();
    } catch {
      toast.error("Something went wrong");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!itemToDelete) return;
    try {
      const res = await fetch(`/api/admin/reviews/${itemToDelete}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error();
      toast.success("Deleted successfully");
      setIsDeleteModalOpen(false);
      fetchData();
    } catch {
      toast.error("Failed to delete");
    }
  };

  const toggleFeatured = async (item: Review) => {
    try {
      const res = await fetch(`/api/admin/reviews/${item.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isFeatured: !item.isFeatured }),
      });
      if (res.ok) {
        fetchData();
        toast.success(item.isFeatured ? "Removed from featured" : "Featured on homepage");
      }
    } catch {
      toast.error("Action failed");
    }
  };

  const toggleApproved = async (item: Review) => {
    try {
      const res = await fetch(`/api/admin/reviews/${item.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ approved: !item.approved }),
      });
      if (res.ok) {
        fetchData();
        toast.success(item.approved ? "Review hidden" : "Review approved");
      }
    } catch {
      toast.error("Action failed");
    }
  };

  if (loading && data.length === 0) return <AdminLoader />;

  return (
    <Box p={{ base: 4, md: 6 }} pb={20}>
      <PageHeader
        title="Product Reviews"
        subtitle="Manage reviews and feature them on the homepage testimonials slider"
      >
        <AdminButton onClick={() => handleOpenModal()}>
          <Icon as={MessageSquare} />
          Add Review
        </AdminButton>
      </PageHeader>

      <Grid
        templateColumns={{ base: "1fr", md: "repeat(4, 1fr)" }}
        gap={4}
        mb={8}
      >
        <StatCard label="Total Reviews" value={data.length} color={T.green} />
        <StatCard label="Approved" value={data.filter((t) => t.approved).length} color={T.green} />
        <StatCard label="Featured" value={data.filter((t) => t.isFeatured).length} color={T.green} />
        <StatCard
          label="Average Rating"
          value={(
            data.reduce((acc, curr) => acc + curr.rating, 0) /
            (data.length || 1)
          ).toFixed(1)}
          color={T.warn}
        />
      </Grid>

      <TableShell>
        <THead columns={["Customer", "Product", "Review", "Rating", "Featured", "Approved", "Actions"]} />
        <tbody>
          {data.length === 0 ? (
            <EmptyRow cols={7} message="No reviews yet." />
          ) : (
            data.map((item, index) => (
              <TR key={item.id} index={index}>
                <TD>
                  <HStack gap={3}>
                    <Box
                      w="40px"
                      h="40px"
                      borderRadius="full"
                      bg={T.bg}
                      overflow="hidden"
                      display="flex"
                      alignItems="center"
                      justifyContent="center"
                      border={`1px solid ${T.border}`}
                    >
                      {item.image ? (
                        <Image src={item.image} alt={item.name} objectFit="cover" w="full" h="full" />
                      ) : (
                        <Icon as={User} color={T.sub} />
                      )}
                    </Box>
                    <VStack align="start" gap={0}>
                      <Text fontWeight={700} fontSize="14px">
                        {item.name}
                      </Text>
                      <Text fontSize="12px" color={T.sub}>
                        {item.customerMeta || "Customer"}
                      </Text>
                    </VStack>
                  </HStack>
                </TD>
                <TD>
                  <Text fontSize="13px" fontWeight={600}>{item.product?.title || "Unknown Product"}</Text>
                </TD>
                <TD style={{ maxWidth: "250px" }}>
                  <Text fontWeight={600} fontSize="13px" lineClamp={1}>
                    {item.heading}
                  </Text>
                  <Text fontSize="12px" color={T.sub} lineClamp={2}>
                    {item.text}
                  </Text>
                </TD>
                <TD>
                  <HStack gap={1}>
                    <Text fontWeight={700} color={T.warn}>
                      {item.rating}
                    </Text>
                    <Icon as={Star} color={T.warn} fill={T.warn} boxSize={3} />
                  </HStack>
                </TD>
                <TD>
                  <Badge
                    colorScheme={item.isFeatured ? "purple" : "gray"}
                    variant="subtle"
                    borderRadius="full"
                    px={2}
                    cursor="pointer"
                    onClick={() => toggleFeatured(item)}
                  >
                    {item.isFeatured ? "Featured" : "Normal"}
                  </Badge>
                </TD>
                <TD>
                  <Badge
                    colorScheme={item.approved ? "green" : "red"}
                    variant="subtle"
                    borderRadius="full"
                    px={2}
                    cursor="pointer"
                    onClick={() => toggleApproved(item)}
                  >
                    {item.approved ? "Approved" : "Pending"}
                  </Badge>
                </TD>
                <TD style={{ textAlign: "right" }}>
                  <HStack gap={1} justify="end">
                    <IconButton
                      aria-label="Edit"
                      variant="ghost"
                      size="sm"
                      onClick={() => handleOpenModal(item)}
                    >
                      <Edit size={16} />
                    </IconButton>
                    <IconButton
                      aria-label="Delete"
                      variant="ghost"
                      size="sm"
                      colorScheme="red"
                      onClick={() => {
                        setItemToDelete(item.id);
                        setIsDeleteModalOpen(true);
                      }}
                    >
                      <Trash2 size={16} />
                    </IconButton>
                  </HStack>
                </TD>
              </TR>
            ))
          )}
        </tbody>
      </TableShell>

      {/* Add / Edit Modal */}
      <AdminModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingItem ? "Edit Review" : "Add New Review"}
      >
        <VStack gap={4} align="stretch">
          <Grid templateColumns={{ base: "1fr", md: "2fr 1fr" }} gap={4}>
            <FormField label="Customer Name" required>
              <InputField
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                placeholder="e.g. Syed Ali"
              />
            </FormField>
            <FormField label="Rating">
              <SelectField
                value={formData.rating.toString()}
                onChange={(e) =>
                  setFormData({ ...formData, rating: Number(e.target.value) })
                }
                options={[
                  { value: "5", label: "5 Stars" },
                  { value: "4", label: "4 Stars" },
                  { value: "3", label: "3 Stars" },
                  { value: "2", label: "2 Stars" },
                  { value: "1", label: "1 Star" },
                ]}
              />
            </FormField>
          </Grid>

          <FormField label="Customer Subtitle (Meta)">
            <InputField
              value={formData.customerMeta}
              onChange={(e) =>
                setFormData({ ...formData, customerMeta: e.target.value })
              }
              placeholder="e.g. Customer from Karachi"
            />
          </FormField>

          <FormField label="Select Product" required>
            <SelectField
              value={formData.productId}
              onChange={(e) => setFormData({ ...formData, productId: e.target.value })}
              options={[
                { value: "", label: "Select a Product..." },
                ...products.map((p) => ({
                  value: p.id,
                  label: p.title,
                })),
              ]}
            />
          </FormField>

          <FormField label="Review Heading">
            <InputField
              value={formData.heading}
              onChange={(e) =>
                setFormData({ ...formData, heading: e.target.value })
              }
              placeholder="e.g. Amazing Quality!"
            />
          </FormField>

          <FormField label="Review Content" required>
            <textarea
              style={{
                width: "100%",
                padding: "12px",
                minHeight: "100px",
                border: `1px solid ${T.border}`,
                borderRadius: "8px",
                fontSize: "14px",
                outline: "none",
                fontFamily: "inherit",
              }}
              value={formData.text}
              onChange={(e) =>
                setFormData({ ...formData, text: e.target.value })
              }
              placeholder="What did the customer say?"
            />
          </FormField>

          <HStack gap={4} pt={2}>
            <label style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer" }}>
              <input type="checkbox" checked={formData.approved} onChange={(e) => setFormData({...formData, approved: e.target.checked})} style={{ width: 18, height: 18 }} />
              <span style={{ fontWeight: 600, fontSize: 14 }}>Approved (Visible on Product Page)</span>
            </label>
            <label style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer" }}>
              <input type="checkbox" checked={formData.isFeatured} onChange={(e) => setFormData({...formData, isFeatured: e.target.checked})} style={{ width: 18, height: 18 }} />
              <span style={{ fontWeight: 600, fontSize: 14 }}>Featured (Visible on Homepage)</span>
            </label>
          </HStack>

          <FormField label="Customer Avatar / Image">
            <ImageUpload
              value={formData.image}
              previewUrl={previewUrl}
              onChange={(val) => setFormData({ ...formData, image: val })}
              onPreview={(url) => setPreviewUrl(url)}
              onFileSelect={(file) => setPendingFile(file)}
              label="Select avatar"
            />
          </FormField>

          <HStack gap={3} w="full" justify="end" pt={4}>
            <AdminButton variant="ghost" onClick={() => setIsModalOpen(false)}>
              Cancel
            </AdminButton>
            <AdminButton
              loading={submitting}
              onClick={handleSubmit}
              variant="primary"
            >
              {editingItem ? "Update Review" : "Save Review"}
            </AdminButton>
          </HStack>
        </VStack>
      </AdminModal>

      <ConfirmDialog
        open={isDeleteModalOpen}
        onCancel={() => setIsDeleteModalOpen(false)}
        onConfirm={handleDelete}
        title="Delete Review?"
        message="This action cannot be undone. This review will no longer appear on your store."
        danger
      />
    </Box>
  );
}
