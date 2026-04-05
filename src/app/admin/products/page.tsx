"use client";
import React, { useState, useEffect, Suspense } from "react";
import Image from "next/image";
import { Box, Text, Grid, Checkbox, Flex } from "@chakra-ui/react";
import NextLink from "next/link";
import {
  T,
  PageHeader,
  StatCard,
  TabBar,
  FilterBar,
  BulkBar,
  TableShell,
  THead,
  TR,
  TD,
  EmptyRow,
  StatusBadge,
  AdminButton,
  AdminLoader,
  ConfirmDialog,
} from "@/components/admin/ui";

type Product = {
  id: string;
  title: string;
  slug: string;
  status: string;
  stockCount: number;
  price: number;
  comparePrice: number | null;
  brand: { name: string } | null;
  category: { name: string } | null;
  modality: string;
  images: string[];
};

function ProductsPageContent() {
  const [tab, setTab] = useState("All");
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<string[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [refresh, setRefresh] = useState(0);
  const [confirmOpen, setConfirmOpen] = useState(false);

  useEffect(() => {
    let cancelled = false;
    const params = new URLSearchParams();
    if (search) params.set("search", search);
    if (tab !== "All") params.set("status", tab.toUpperCase());
    fetch(`/api/products?${params}`)
      .then((r) => r.json())
      .then((d) => {
        if (!cancelled) {
          setProducts(d.products ?? []);
          setTotal(d.total ?? 0);
          setLoading(false);
        }
      })
      .catch(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [tab, search, refresh]);

  const toggle = (id: string) =>
    setSelected((s) =>
      s.includes(id) ? s.filter((x) => x !== id) : [...s, id],
    );

  const reload = () => {
    setRefresh((r) => r + 1);
    setSelected([]);
  };

  const bulkSetStatus = async (status: "ACTIVE" | "DRAFT") => {
    await Promise.all(
      selected.map((id) =>
        fetch(`/api/products/${id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ status }),
        }),
      ),
    );
    reload();
  };

  const bulkDelete = async () => {
    setConfirmOpen(true);
  };

  const doDelete = async () => {
    setConfirmOpen(false);
    await Promise.all(
      selected.map((id) => fetch(`/api/products/${id}`, { method: "DELETE" })),
    );
    reload();
  };

  const modLabel: Record<string, string> = {
    ONE_DAY: "One Day",
    MONTHLY: "Monthly",
    QUARTERLY: "Quarterly",
    YEARLY: "Yearly",
  };

  if (loading) return <AdminLoader message="Loading products..." />;

  return (
    <Box bg={T.bg} minH="100%" p={{ base: 4, md: 6 }}>
      <PageHeader title="Products" subtitle={`${total} products total`}>
        <AdminButton variant="secondary">Export</AdminButton>
        <NextLink href="/admin/products/new">
          <AdminButton variant="primary">Add product</AdminButton>
        </NextLink>
      </PageHeader>

      <Grid
        templateColumns={{ base: "repeat(2,1fr)", md: "repeat(4,1fr)" }}
        gap={4}
        mb={5}
      >
        <StatCard label="Total Products" value={total} />
        <StatCard
          label="Active"
          value={products.filter((p) => p.status === "ACTIVE").length}
          color={T.green}
        />
        <StatCard
          label="Low stock"
          value={
            products.filter((p) => p.stockCount > 0 && p.stockCount < 10).length
          }
          color={T.warn}
        />
        <StatCard
          label="Out of stock"
          value={products.filter((p) => p.stockCount === 0).length}
          color={T.red}
        />
      </Grid>

      <TableShell
        footerText={`Showing ${products.length} of ${total} products`}
        header={
          <>
            <TabBar
              tabs={["All", "Active", "Draft", "Archived"]}
              active={tab}
              onChange={setTab}
            />
            <FilterBar
              search={search}
              onSearch={setSearch}
              placeholder="Search products..."
              filters={["Brand", "Category", "Status"]}
            />
            <BulkBar
              count={selected.length}
              onClear={() => setSelected([])}
              actions={[
                {
                  label: "Set as active",
                  icon: "active",
                  onClick: () => bulkSetStatus("ACTIVE"),
                },
                {
                  label: "Set as draft",
                  icon: "draft",
                  onClick: () => bulkSetStatus("DRAFT"),
                },
                {
                  label: "Delete",
                  icon: "delete",
                  danger: true,
                  onClick: bulkDelete,
                },
              ]}
            />
          </>
        }
      >
        <THead
          checkboxCol
          columns={[
            "Product",
            "Status",
            "Inventory",
            "Price",
            "Category",
            "Brand",
            "Disposability",
            "",
          ]}
        />
        <tbody>
          {products.length === 0 ? (
            <EmptyRow cols={8} message="No products found." />
          ) : (
            products.map((p, i) => (
              <TR key={p.id} index={i}>
                <TD>
                  <Checkbox.Root
                    checked={selected.includes(p.id)}
                    onCheckedChange={() => toggle(p.id)}
                    size="sm"
                  >
                    <Checkbox.HiddenInput />
                    <Checkbox.Control />
                  </Checkbox.Root>
                </TD>
                {/* Thumbnail + title + slug */}
                <TD>
                  <Flex align="center" gap={3}>
                    <Box
                      w="40px"
                      h="40px"
                      borderRadius="8px"
                      overflow="hidden"
                      flexShrink={0}
                      bg={T.bg}
                      border={`1px solid ${T.border}`}
                      position="relative"
                    >
                      {p.images?.[0] ? (
                        <Image
                          src={p.images[0]}
                          alt={p.title}
                          fill
                          style={{ objectFit: "cover" }}
                          sizes="40px"
                        />
                      ) : (
                        <Flex w="full" h="full" align="center" justify="center">
                          <Text fontSize="16px">👁</Text>
                        </Flex>
                      )}
                    </Box>
                    <Box>
                      <Text
                        fontSize="13.5px"
                        fontWeight={600}
                        color={T.text}
                        lineHeight={1.3}
                      >
                        {p.title}
                      </Text>
                      <Text fontSize="11.5px" color={T.sub} mt="1px">
                        {p.slug}
                      </Text>
                    </Box>
                  </Flex>
                </TD>
                {/* Status */}
                <TD>
                  <StatusBadge status={p.status}>
                    {p.status.charAt(0) + p.status.slice(1).toLowerCase()}
                  </StatusBadge>
                </TD>
                {/* Inventory */}
                <TD>
                  <Text
                    fontSize="13px"
                    fontWeight={p.stockCount < 10 ? 600 : 400}
                    color={
                      p.stockCount === 0
                        ? T.red
                        : p.stockCount < 10
                          ? T.warn
                          : T.muted
                    }
                  >
                    {p.stockCount === 0
                      ? "Out of stock"
                      : `${p.stockCount} in stock`}
                  </Text>
                </TD>
                {/* Price */}
                <TD>
                  <Box>
                    <Text fontSize="13.5px" fontWeight={600} color={T.text}>
                      Rs {p.price.toLocaleString()}
                    </Text>
                    {p.comparePrice && p.comparePrice > p.price && (
                      <Text
                        fontSize="11.5px"
                        color={T.sub}
                        textDecoration="line-through"
                        mt="1px"
                      >
                        Rs {p.comparePrice.toLocaleString()}
                      </Text>
                    )}
                  </Box>
                </TD>
                {/* Category */}
                <TD>
                  <Text fontSize="13px" color={T.muted}>
                    {p.category?.name ?? "—"}
                  </Text>
                </TD>
                {/* Brand */}
                <TD>
                  <Text fontSize="13px" color={T.muted}>
                    {p.brand?.name ?? "—"}
                  </Text>
                </TD>
                {/* Disposability */}
                <TD>
                  <StatusBadge variant="gray">
                    {modLabel[p.modality] ?? p.modality}
                  </StatusBadge>
                </TD>
                {/* Edit */}
                <TD>
                  <NextLink href={`/admin/products/new?id=${p.id}`}>
                    <AdminButton variant="secondary" size="xs">
                      Edit
                    </AdminButton>
                  </NextLink>
                </TD>
              </TR>
            ))
          )}
        </tbody>
      </TableShell>

      <ConfirmDialog
        open={confirmOpen}
        title={`Delete ${selected.length} product${selected.length > 1 ? "s" : ""}?`}
        message="All selected products and their images will be permanently removed. This cannot be undone."
        confirmLabel="Delete"
        danger
        onConfirm={doDelete}
        onCancel={() => setConfirmOpen(false)}
      />
    </Box>
  );
}

export default function ProductsPage() {
  return (
    <Suspense fallback={<AdminLoader message="Loading products..." />}>
      <ProductsPageContent />
    </Suspense>
  );
}
