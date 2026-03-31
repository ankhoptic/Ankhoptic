"use client";
import React, { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCartStore } from "@/store/cartStore";
import { usePrescriptionStore } from "@/store/prescriptionStore";

// Same types from QuickAdd
type PowerOption = { id: string; value: string; label: string };

type Product = {
  id: string;
  title: string;
  slug: string;
  price: number;
  comparePrice: number | null;
  discountTitle?: string;
  images: string[];
  disposability: string | null;
  description: string | null;
  brand: { name: string; slug: string } | null;
  category: { name: string; slug: string } | null;
  status: string;
  powerOptions: PowerOption[];
  reviews: unknown[];
  _count: { reviews: number };
};

const PLACEHOLDER = "/store/images/item/tets1.jpg";

const DISPOSABILITY_LABELS: Record<string, string> = {
  ONE_DAY: "Daily",
  TWO_WEEK: "2-Week",
  MONTHLY: "Monthly",
  QUARTERLY: "Quarterly",
  YEARLY: "Yearly",
  "1_YEAR": "Yearly",
  "6_MONTH": "6-Month",
};

export default function ProductPage({ slug }: { slug: string }) {
  const router = useRouter();
  const addItem = useCartStore((s) => s.addItem);

  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  // Cart / Config state
  const [qty, setQty] = useState(1);
  const [imgIdx, setImgIdx] = useState(0);
  const [lensType, setLensType] = useState<"PLAIN" | "EYESIGHT">("PLAIN");
  const [leftEye, setLeftEye] = useState("0.00");
  const [rightEye, setRightEye] = useState("0.00");
  const [prescriptionFile, setPrescriptionFile] = useState<File | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("Description");

  useEffect(() => {
    if (!slug) return;
    // Loading is initially true, we don't need to set it synchronously again here
    fetch(`/api/store/products/${slug}`)
      .then((res) => {
        if (!res.ok) throw new Error("Not found");
        return res.json();
      })
      .then((data) => {
        setProduct(data);
        setError(false);
      })
      .catch((err) => {
        console.error(err);
        setError(true);
      })
      .finally(() => setLoading(false));
  }, [slug]);

  if (loading) {
    return (
      <div
        style={{
          minHeight: "60vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <p>Loading product details...</p>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div
        style={{
          minHeight: "60vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexDirection: "column",
        }}
      >
        <h3>Product not found</h3>
        <Link href="/" className="tf-btn btn-fill mt-3">
          Back to Home
        </Link>
      </div>
    );
  }

  const images = product.images.length > 0 ? product.images : [PLACEHOLDER];

  // Options — Order: minus (most negative first) → 0.00 Plain → plus (ascending)
  const plainOption = {
    id: "plain",
    value: "0.00",
    label: "0.00 Plain (Normal Eye)",
  };
  const nonPlainOptions = (product.powerOptions || []).filter(
    (p) => p.value !== "0.00"
  );
  const minusOptions = nonPlainOptions
    .filter((p) => parseFloat(p.value) < 0)
    .sort((a, b) => parseFloat(a.value) - parseFloat(b.value));
  const plusOptions = nonPlainOptions
    .filter((p) => parseFloat(p.value) > 0)
    .sort((a, b) => parseFloat(a.value) - parseFloat(b.value));
  const powerDropdownOptions: PowerOption[] = [
    ...minusOptions,
    plainOption,
    ...plusOptions,
  ];

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setPrescriptionFile(file);
    setUploadProgress(0);
    setPreviewUrl(
      file.type.startsWith("image/") ? URL.createObjectURL(file) : null,
    );
    let progress = 0;
    const interval = setInterval(() => {
      progress += Math.floor(Math.random() * 20) + 10;
      if (progress >= 100) {
        progress = 100;
        clearInterval(interval);
      }
      setUploadProgress(progress);
    }, 150);
  };

  const handleAddToCart = () => {
    const power = lensType === "EYESIGHT" ? `L:${leftEye} R:${rightEye}` : null;
    for (let i = 0; i < qty; i++) {
      const itemToInsert = {
        slug: product.slug,
        title: product.title,
        image: images[0],
        brand: product.brand?.name ?? "",
        color: "",
        lensType,
        power,
        prescriptionName: prescriptionFile?.name ?? null,
        addonName: "",
        addonPrice: 0,
        unitPrice: product.price,
      };

      // Add to cart store
      addItem(itemToInsert);

      // Save file to prescription store if one was selected
      if (prescriptionFile && lensType === "EYESIGHT") {
        const id = `${itemToInsert.slug}-${itemToInsert.lensType}-${itemToInsert.power ?? "plain"}-${itemToInsert.addonName}`;
        usePrescriptionStore.getState().setFile(id, prescriptionFile);
      }
    }

    setTimeout(() => {
      const cartEl = document.getElementById("shoppingCart");
      if (
        cartEl &&
        typeof window !== "undefined" &&
        (window as unknown as Window & { bootstrap: unknown }).bootstrap
      ) {
        try {
          const m = new (
            window as unknown as Window & {
              bootstrap: {
                Modal: new (el: HTMLElement) => { show: () => void };
              };
            }
          ).bootstrap.Modal(cartEl);
          m.show();
        } catch (err) {
          console.log(err);
          router.push("/cart");
        }
      } else {
        router.push("/cart");
      }
    }, 350);
  };

  return (
    <>
      <div className="tf-breadcrumb">
        <div className="container">
          <div className="tf-breadcrumb-wrap d-flex justify-content-between flex-wrap align-items-center">
            <div className="tf-breadcrumb-list">
              <Link href="/" className="text">
                Home
              </Link>
              <i className="icon icon-arrow-right" />
              {product.category && (
                <>
                  <Link
                    href={`/shop?category=${product.category.slug}`}
                    className="text"
                  >
                    {product.category.name}
                  </Link>
                  <i className="icon icon-arrow-right" />
                </>
              )}
              <span className="text">{product.title}</span>
            </div>
          </div>
        </div>
      </div>

      <section className="flat-spacing-4 pt_0">
        <div className="tf-main-product section-image-zoom">
          <div className="container">
            <div className="row">
              {/* Left Column: Images */}
              <div className="col-md-5 col-lg-6">
                <div
                  className="tf-product-media-wrap sticky-top"
                  style={{ position: "relative" }}
                >
                  {/* Main Image View */}
                  <div
                    className="product-page-main-img"
                    style={{
                      width: "100%",
                      position: "relative",
                      overflow: "hidden",
                      borderRadius: 12,
                    }}
                  >
                    <Image
                      src={images[imgIdx]}
                      alt={product.title}
                      fill
                      style={{ objectFit: "cover" }}
                      className="w-full h-full object-cover"
                    />
                    {images.length > 1 && (
                      <>
                        <button
                          onClick={() =>
                            setImgIdx((i) =>
                              i === 0 ? images.length - 1 : i - 1,
                            )
                          }
                          style={navBtnStyle("left")}
                        >
                          ‹
                        </button>
                        <button
                          onClick={() =>
                            setImgIdx((i) =>
                              i === images.length - 1 ? 0 : i + 1,
                            )
                          }
                          style={navBtnStyle("right")}
                        >
                          ›
                        </button>
                      </>
                    )}
                  </div>
                  {/* Thumbnails */}
                  {images.length > 1 && (
                    <div
                      style={{
                        display: "flex",
                        gap: 10,
                        marginTop: 15,
                        overflowX: "auto",
                        paddingBottom: 10,
                      }}
                    >
                      {images.map((img, i) => (
                        <div
                          key={i}
                          onClick={() => setImgIdx(i)}
                          style={{
                            width: 80,
                            height: 80,
                            borderRadius: 8,
                            overflow: "hidden",
                            cursor: "pointer",
                            flexShrink: 0,
                            border:
                              imgIdx === i
                                ? "2px solid #000"
                                : "2px solid transparent",
                          }}
                        >
                          <Image
                            src={img}
                            alt="thumb"
                            width={80}
                            height={80}
                            style={{
                              objectFit: "cover",
                            }}
                          />
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Right Column: Info */}
              <div className="col-md-6 col-lg-6">
                <div className="tf-product-info-wrap position-relative">
                  <div
                    className="tf-product-info-list"
                    style={{ marginTop: 20 }}
                  >
                    <div className="tf-product-info-title">
                      <h2>{product.title}</h2>
                    </div>

                    {(product.brand || product.disposability) && (
                      <div
                        style={{
                          display: "flex",
                          gap: 8,
                          alignItems: "center",
                          marginBottom: 15,
                          flexWrap: "wrap",
                        }}
                      >
                        {product.brand && (
                          <span className="badges text-uppercase py-1 px-3 d-inline-block rounded">
                            {product.brand.name}
                          </span>
                        )}
                        {product.disposability && (
                          <span style={{ fontSize: 13, color: "#555" }}>
                            Disposability:{" "}
                            {DISPOSABILITY_LABELS[product.disposability] ??
                              product.disposability}
                          </span>
                        )}
                      </div>
                    )}

                    {product.discountTitle && (
                      <span
                        className="box-badge"
                        style={{ marginBottom: 8, display: "inline-block" }}
                      >
                        {product.discountTitle}
                      </span>
                    )}
                    <div
                      className="tf-product-info-price"
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 10,
                        flexWrap: "wrap",
                      }}
                    >
                      {product.comparePrice &&
                        product.comparePrice > product.price && (
                          <div
                            className="compare-at-price"
                            style={{
                              textDecoration: "line-through",
                              color: "#aaa",
                              fontSize: "18px",
                            }}
                          >
                            Rs
                            {Number(product.comparePrice).toLocaleString(
                              "en-PK",
                            )}
                          </div>
                        )}
                      <div
                        className="price"
                        style={{
                          fontSize: 24,
                          fontWeight: 700,
                          color:
                            product.comparePrice &&
                            product.comparePrice > product.price
                              ? "#e53e3e"
                              : "inherit",
                        }}
                      >
                        Rs{Number(product.price).toLocaleString("en-PK")}
                      </div>
                    </div>

                    <hr className="my-4" />

                    {/* ── Lens Type ── */}
                    <div style={{ marginBottom: 16 }}>
                      <div
                        style={{
                          fontSize: 13,
                          fontWeight: 600,
                          color: "#333",
                          marginBottom: 8,
                          textTransform: "uppercase",
                          letterSpacing: "0.05em",
                        }}
                      >
                        Lens Type
                      </div>
                      <div style={{ display: "flex", gap: 10 }}>
                        {(["PLAIN", "EYESIGHT"] as const).map((type) => (
                          <button
                            key={type}
                            onClick={() => setLensType(type)}
                            style={{
                              flex: 1,
                              padding: "9px 0",
                              border: `2px solid ${lensType === type ? "var(--primary, #0d1b4b)" : "#ddd"}`,
                              borderRadius: 6,
                              background:
                                lensType === type
                                  ? "var(--primary, #0d1b4b)"
                                  : "#fff",
                              color: lensType === type ? "#fff" : "#555",
                              fontWeight: 600,
                              fontSize: 13,
                              cursor: "pointer",
                              transition:
                                "background 0.25s ease, border-color 0.25s ease, color 0.25s ease, transform 0.15s ease",
                              transform:
                                lensType === type ? "scale(1.02)" : "scale(1)",
                              boxShadow:
                                lensType === type
                                  ? "0 2px 8px rgba(13,27,75,0.18)"
                                  : "none",
                            }}
                          >
                            {type === "PLAIN" ? "Plan (No Power)" : "Eyesight"}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* ── Eye Power Dropdowns — animated panel ── */}
                    <div
                      style={{
                        maxHeight: lensType === "EYESIGHT" ? 500 : 0,
                        opacity: lensType === "EYESIGHT" ? 1 : 0,
                        overflow:
                          lensType === "EYESIGHT" ? "visible" : "hidden",
                        transition: "max-height 0.35s ease, opacity 0.3s ease",
                        marginBottom: lensType === "EYESIGHT" ? 16 : 0,
                      }}
                    >
                      <div style={{ paddingTop: 4 }}>
                        <div
                          className="product-page-eye-pickers"
                          style={{ display: "flex", gap: 12 }}
                        >
                          {/* Left Eye */}
                          <div style={{ flex: 1 }}>
                            <div
                              className="variant-picker-label"
                              style={{ marginBottom: 5 }}
                            >
                              For Left Eye:{" "}
                              <span className="fw-6 variant-picker-label-value">
                                {powerDropdownOptions.find(
                                  (opt) => opt.value === leftEye,
                                )?.label || "0.00 Plain (Normal Eye)"}
                              </span>
                            </div>
                            <div
                              className="tf-dropdown-sort full position-relative"
                              data-bs-toggle="dropdown"
                              style={{
                                border: "1px solid #ddd",
                                borderRadius: 6,
                              }}
                            >
                              <div className="btn-select">
                                <span
                                  className="text-sort-value"
                                  style={{
                                    flex: 1,
                                    textAlign: "left",
                                    overflow: "hidden",
                                    textOverflow: "ellipsis",
                                    whiteSpace: "nowrap",
                                  }}
                                >
                                  {powerDropdownOptions.find(
                                    (opt) => opt.value === leftEye,
                                  )?.label || "0.00 Plain (Normal Eye)"}
                                </span>
                                <span className="icon icon-arrow-down"></span>
                              </div>
                              <div
                                className="dropdown-menu"
                                style={{
                                  maxHeight: 200,
                                  overflowY: "auto",
                                  width: "100%",
                                  padding: "4px 0",
                                }}
                              >
                                {powerDropdownOptions.map((opt) => (
                                  <div
                                    key={opt.id}
                                    className={`select-item ${leftEye === opt.value ? "active" : ""}`}
                                    onClick={() => setLeftEye(opt.value)}
                                    style={{
                                      padding: "6px 16px",
                                      cursor: "pointer",
                                      fontSize: 13,
                                    }}
                                  >
                                    <span
                                      className="text-value-item"
                                      style={{
                                        whiteSpace: "normal",
                                        display: "block",
                                      }}
                                    >
                                      {opt.label}
                                    </span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          </div>

                          {/* Right Eye */}
                          <div style={{ flex: 1 }}>
                            <div
                              className="variant-picker-label"
                              style={{ marginBottom: 5 }}
                            >
                              For Right Eye:{" "}
                              <span className="fw-6 variant-picker-label-value">
                                {powerDropdownOptions.find(
                                  (opt) => opt.value === rightEye,
                                )?.label || "0.00 Plain (Normal Eye)"}
                              </span>
                            </div>
                            <div
                              className="tf-dropdown-sort full position-relative"
                              data-bs-toggle="dropdown"
                              style={{
                                border: "1px solid #ddd",
                                borderRadius: 6,
                              }}
                            >
                              <div className="btn-select">
                                <span
                                  className="text-sort-value"
                                  style={{
                                    flex: 1,
                                    textAlign: "left",
                                    overflow: "hidden",
                                    textOverflow: "ellipsis",
                                    whiteSpace: "nowrap",
                                  }}
                                >
                                  {powerDropdownOptions.find(
                                    (opt) => opt.value === rightEye,
                                  )?.label || "0.00 Plain (Normal Eye)"}
                                </span>
                                <span className="icon icon-arrow-down"></span>
                              </div>
                              <div
                                className="dropdown-menu"
                                style={{
                                  maxHeight: 200,
                                  overflowY: "auto",
                                  width: "100%",
                                  padding: "4px 0",
                                }}
                              >
                                {powerDropdownOptions.map((opt) => (
                                  <div
                                    key={opt.id}
                                    className={`select-item ${rightEye === opt.value ? "active" : ""}`}
                                    onClick={() => setRightEye(opt.value)}
                                    style={{
                                      padding: "6px 16px",
                                      cursor: "pointer",
                                      fontSize: 13,
                                    }}
                                  >
                                    <span
                                      className="text-value-item"
                                      style={{
                                        whiteSpace: "normal",
                                        display: "block",
                                      }}
                                    >
                                      {opt.label}
                                    </span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* OR divider */}
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: 12,
                            margin: "14px 0",
                            color: "#aaa",
                            fontSize: 13,
                          }}
                        >
                          <div
                            style={{
                              flex: 1,
                              height: 1,
                              background: "#e0e0e0",
                            }}
                          />
                          <span style={{ fontWeight: 600 }}>— OR —</span>
                          <div
                            style={{
                              flex: 1,
                              height: 1,
                              background: "#e0e0e0",
                            }}
                          />
                        </div>

                        {/* Upload Prescription */}
                        <div>
                          <label
                            style={{
                              display: "block",
                              fontSize: 12,
                              fontWeight: 600,
                              color: "#444",
                              marginBottom: 6,
                            }}
                          >
                            Upload Your Prescription
                          </label>
                          {/* File Upload UI */}
                          {prescriptionFile ? (
                            uploadProgress < 100 ? (
                              // Uploading state
                              <div
                                style={{
                                  padding: "12px 16px",
                                  border: "1px solid #e0e0e0",
                                  borderRadius: 6,
                                  background: "#fdfdfd",
                                }}
                              >
                                <div
                                  style={{
                                    display: "flex",
                                    justifyContent: "space-between",
                                    fontSize: 13,
                                    marginBottom: 6,
                                    color: "#555",
                                  }}
                                >
                                  <span>
                                    Uploading {prescriptionFile.name}...
                                  </span>
                                  <span>{uploadProgress}%</span>
                                </div>
                                <div
                                  style={{
                                    height: 4,
                                    background: "#f0f0f0",
                                    borderRadius: 2,
                                    overflow: "hidden",
                                  }}
                                >
                                  <div
                                    style={{
                                      height: "100%",
                                      background: "#000",
                                      width: `${uploadProgress}%`,
                                      transition: "width 0.2s",
                                    }}
                                  />
                                </div>
                              </div>
                            ) : (
                              // Complete state (Preview)
                              <div
                                style={{
                                  padding: "12px",
                                  border: "1px solid #e0e0e0",
                                  borderRadius: 6,
                                  background: "#fdfdfd",
                                  display: "flex",
                                  alignItems: "center",
                                  gap: 12,
                                  position: "relative",
                                }}
                              >
                                {previewUrl ? (
                                  <Image
                                    src={previewUrl}
                                    alt="Preview"
                                    width={100}
                                    height={100}
                                    style={{
                                      objectFit: "cover",
                                      borderRadius: 4,
                                      border: "1px solid #eee",
                                    }}
                                  />
                                ) : (
                                  <div
                                    style={{
                                      width: 40,
                                      height: 40,
                                      background: "#f0f0f0",
                                      borderRadius: 4,
                                      display: "flex",
                                      alignItems: "center",
                                      justifyContent: "center",
                                    }}
                                  >
                                    <span
                                      className="icon icon-file"
                                      style={{ fontSize: 20, color: "#999" }}
                                    />
                                  </div>
                                )}
                                <div style={{ flex: 1, overflow: "hidden" }}>
                                  <div
                                    style={{
                                      fontWeight: 500,
                                      color: "#333",
                                      fontSize: 13,
                                      whiteSpace: "nowrap",
                                      overflow: "hidden",
                                      textOverflow: "ellipsis",
                                    }}
                                  >
                                    {prescriptionFile.name}
                                  </div>
                                  <div
                                    style={{
                                      fontSize: 11,
                                      color: "#888",
                                      marginTop: 2,
                                    }}
                                  >
                                    {(
                                      prescriptionFile.size /
                                      1024 /
                                      1024
                                    ).toFixed(2)}{" "}
                                    MB • Uploaded
                                  </div>
                                </div>
                                <button
                                  type="button"
                                  onClick={() => {
                                    setPrescriptionFile(null);
                                    setPreviewUrl(null);
                                    setUploadProgress(0);
                                  }}
                                  style={{
                                    background: "none",
                                    border: "none",
                                    cursor: "pointer",
                                    padding: 4,
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    color: "#999",
                                  }}
                                >
                                  <span
                                    className="icon icon-close"
                                    style={{ fontSize: 12 }}
                                  />
                                </button>
                              </div>
                            )
                          ) : (
                            // Empty state
                            <label
                              style={{
                                display: "flex",
                                alignItems: "center",
                                padding: "12px 16px",
                                border: "1px dashed #ccc",
                                borderRadius: 6,
                                cursor: "pointer",
                                fontSize: 14,
                                color: "#555",
                                background: "#f9f9f9",
                                width: "100%",
                                margin: 0,
                              }}
                            >
                              <span style={{ fontWeight: 500, color: "#666" }}>
                                Choose image or PDF...
                              </span>
                              <input
                                type="file"
                                accept="image/*,.pdf"
                                style={{ display: "none" }}
                                onChange={handleFileSelect}
                              />
                            </label>
                          )}
                        </div>
                      </div>
                    </div>

                    <div
                      className="tf-product-info-quantity"
                      style={{ marginTop: 25, marginBottom: 25 }}
                    >
                      <div className="quantity-title fw-6 mb-2">Quantity</div>
                      <div className="wg-quantity" style={{ width: 140 }}>
                        <span
                          className="btn-quantity btn-decrease"
                          onClick={() => setQty((q) => Math.max(1, q - 1))}
                        >
                          -
                        </span>
                        <input
                          type="text"
                          className="quantity-product"
                          name="number"
                          value={qty}
                          readOnly
                          style={{ pointerEvents: "none" }}
                        />
                        <span
                          className="btn-quantity btn-increase"
                          onClick={() => setQty((q) => q + 1)}
                        >
                          +
                        </span>
                      </div>
                    </div>

                    <div className="tf-product-info-buy-button">
                      <button
                        onClick={handleAddToCart}
                        className="tf-btn btn-fill justify-content-center fw-6 fs-16 flex-grow-1 animate-hover-btn btn-add-to-cart"
                        style={{ width: "100%" }}
                      >
                        <span>Add to cart -&nbsp;</span>
                        <span className="tf-qty-price total-price">
                          Rs{(product.price * qty).toLocaleString("en-PK")}
                        </span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* TABS */}
      <section className="flat-spacing-17 pt_0">
        <div className="container">
          <div className="row">
            <div className="col-12">
              <div className="widget-tabs style-has-border">
                <ul className="widget-menu-tab">
                  <li
                    className={`item-title ${activeTab === "Description" ? "active" : ""}`}
                    onClick={() => setActiveTab("Description")}
                  >
                    <span className="inner">Description</span>
                  </li>
                  <li
                    className={`item-title ${activeTab === "Review" ? "active" : ""}`}
                    onClick={() => setActiveTab("Review")}
                  >
                    <span className="inner">Review</span>
                  </li>
                  <li
                    className={`item-title ${activeTab === "Shipping" ? "active" : ""}`}
                    onClick={() => setActiveTab("Shipping")}
                  >
                    <span className="inner">Shipping</span>
                  </li>
                  <li
                    className={`item-title ${activeTab === "Return Policies" ? "active" : ""}`}
                    onClick={() => setActiveTab("Return Policies")}
                  >
                    <span className="inner">Return Policies</span>
                  </li>
                </ul>
                <div className="widget-content-tab">
                  <div
                    className={`widget-content-inner ${activeTab === "Description" ? "active" : ""}`}
                  >
                    <div className="">
                      {product.description ? (
                        <div
                          dangerouslySetInnerHTML={{
                            __html: product.description,
                          }}
                        />
                      ) : (
                        <p>No description available.</p>
                      )}
                    </div>
                  </div>
                  <div
                    className={`widget-content-inner ${activeTab === "Review" ? "active" : ""}`}
                  >
                    <div className="tab-reviews write-cancel-review-wrap">
                      <div className="tab-reviews-heading">
                        <div className="top">
                          <div className="text-center">
                            <h1 className="number fw-6">4.8</h1>
                            <div className="list-star">
                              <i className="icon icon-star"></i>
                              <i className="icon icon-star"></i>
                              <i className="icon icon-star"></i>
                              <i className="icon icon-star"></i>
                              <i className="icon icon-star"></i>
                            </div>
                            <p>(168 Ratings)</p>
                          </div>
                          <div className="rating-score">
                            <div className="item">
                              <div className="number-1 text-caption-1">5</div>
                              <i className="icon icon-star"></i>
                              <div className="line-bg">
                                <div style={{ width: "94.67%" }}></div>
                              </div>
                              <div className="number-2 text-caption-1">59</div>
                            </div>
                            <div className="item">
                              <div className="number-1 text-caption-1">4</div>
                              <i className="icon icon-star"></i>
                              <div className="line-bg">
                                <div style={{ width: "60%" }}></div>
                              </div>
                              <div className="number-2 text-caption-1">46</div>
                            </div>
                          </div>
                        </div>
                        <div>
                          <div className="tf-btn btn-outline-dark fw-6 btn-comment-review btn-cancel-review">
                            Cancel Review
                          </div>
                          <div className="tf-btn btn-outline-dark fw-6 btn-comment-review btn-write-review">
                            Write a review
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div
                    className={`widget-content-inner ${activeTab === "Shipping" ? "active" : ""}`}
                  >
                    <div className="tf-page-privacy-policy">
                      <div className="title">Shipping Policy</div>
                      <p>
                        We deliver your order as soon as possible. Our standard
                        shipping normally takes 3-5 business days.
                      </p>
                    </div>
                  </div>
                  <div
                    className={`widget-content-inner ${activeTab === "Return Policies" ? "active" : ""}`}
                  >
                    <div className="tf-page-privacy-policy">
                      <div className="title">Return Policies</div>
                      <p>
                        We accept returns within 7 days of purchase. The item
                        must be unused and in original packaging.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}

const navBtnStyle = (side: "left" | "right"): React.CSSProperties => ({
  position: "absolute",
  [side]: 10,
  top: "50%",
  transform: "translateY(-50%)",
  zIndex: 5,
  cursor: "pointer",
  border: "none",
  background: "rgba(255,255,255,0.8)",
  borderRadius: "50%",
  width: 40,
  height: 40,
  fontSize: 24,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  boxShadow: "0 2px 6px rgba(0,0,0,0.15)",
});
