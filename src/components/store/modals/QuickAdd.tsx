/* eslint-disable @next/next/no-img-element */
"use client";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { useQuickView } from "@/context/QuickViewContext";
import { useCartStore } from "@/store/cartStore";
import { usePrescriptionStore } from "@/store/prescriptionStore";

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

type PowerOption = { id: string; value: string; label: string };

export default function QuickAdd() {
  const { product } = useQuickView();
  const [qty, setQty] = useState(1);
  const [imgIdx, setImgIdx] = useState(0);

  const { addItem } = useCartStore();

  // Lens config state
  const [lensType, setLensType] = useState<"PLAIN" | "EYESIGHT">("PLAIN");
  const [leftEye, setLeftEye] = useState("0.00");
  const [rightEye, setRightEye] = useState("0.00");
  const [prescriptionFile, setPrescriptionFile] = useState<File | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setPrescriptionFile(file);
    setUploadProgress(0);
    setPreviewUrl(null);

    // If it's an image, create a preview
    if (file.type.startsWith("image/")) {
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
    }

    // Simulate upload progress
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

  // Power options fetched from full product API
  const [powerOptions, setPowerOptions] = useState<PowerOption[]>([]);
  const prevSlug = useRef<string | null>(null);

  // Fetch powerOptions whenever product changes
  useEffect(() => {
    if (!product?.slug || product.slug === prevSlug.current) return;
    prevSlug.current = product.slug;
    // eslint-disable-next-line
    setPowerOptions([]);
    setLensType("PLAIN");
    setLeftEye("0.00");
    setRightEye("0.00");
    setPrescriptionFile(null);
    setUploadProgress(0);
    setPreviewUrl(null);
    setImgIdx(0);
    setQty(1);

    fetch(`/api/store/products/${product.slug}`)
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data.powerOptions)) {
          setPowerOptions(data.powerOptions);
        }
      })
      .catch(console.error);
  }, [product?.slug]);

  const images =
    product && product.images.length > 0 ? product.images : [PLACEHOLDER];

  // ── Add to Cart handler ──────────────────────────────────
  const handleAddToCart = () => {
    if (!product) return;
    const power = lensType === "EYESIGHT" ? `L:${leftEye} R:${rightEye}` : null;

    // Add qty copies (addItem increments by 1 each call)
    for (let i = 0; i < qty; i++) {
      const itemToInsert = {
        slug: product.slug,
        title: product.title,
        image: product.images?.[0] ?? "",
        brand: product.brand?.name ?? "",
        color: "",
        lensType,
        power,
        prescriptionName: prescriptionFile?.name ?? null,
        addonName: "",
        addonPrice: 0,
        unitPrice: product.price,
      };

      addItem(itemToInsert);

      if (prescriptionFile && lensType === "EYESIGHT") {
        const id = `${itemToInsert.slug}-${itemToInsert.lensType}-${itemToInsert.power ?? "plain"}-${itemToInsert.addonName}`;
        usePrescriptionStore.getState().setFile(id, prescriptionFile);
      }
    }

    // Close QuickView modal
    const qvEl = document.getElementById("quick_view");
    if (qvEl) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (window as any).bootstrap?.Modal?.getInstance(qvEl)?.hide();
    }

    // Open Cart modal after Bootstrap finishes hiding
    setTimeout(() => {
      const cartEl = document.getElementById("shoppingCart");
      if (cartEl) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const m = new (window as any).bootstrap.Modal(cartEl);
        m.show();
      }
    }, 350);
  };
  // ─────────────────────────────────────────────────────────

  // Build the dropdown options:
  // Order: minus powers (most negative first) → 0.00 Plain → plus powers (ascending)
  const plainOption = {
    id: "plain",
    value: "0.00",
    label: "0.00 Plain (Normal Eye)",
  };
  const nonPlainOptions = powerOptions.filter((p) => p.value !== "0.00");
  const minusOptions = nonPlainOptions
    .filter((p) => parseFloat(p.value) < 0)
    .sort((a, b) => parseFloat(b.value) - parseFloat(a.value)); // most negative last (starts at -0.5)
  const plusOptions = nonPlainOptions
    .filter((p) => parseFloat(p.value) > 0)
    .sort((a, b) => parseFloat(a.value) - parseFloat(b.value)); // lowest positive first
  const powerDropdownOptions: PowerOption[] = [
    ...minusOptions,
    plainOption,
    ...plusOptions,
  ];

  return (
    <>
      <div className="modal fade modalDemo popup-quickview" id="quick_view">
        <div className="modal-dialog modal-dialog-centered">
          <div className="modal-content" style={{ height: "min(85vh, 750px)" }}>
            {/* Close */}
            <div className="header">
              <span
                className="icon-close icon-close-popup"
                data-bs-dismiss="modal"
              />
            </div>

            {/* Body */}
            <div className="wrap" style={{ flex: 1, minHeight: 0 }}>
              {/* Left — images */}
              <div
                className="tf-product-media-wrap"
                style={{ display: "flex", alignItems: "center" }}
              >
                <div
                  style={{
                    maxHeight: "min(68vh, 420px)",
                    overflow: "hidden",
                    position: "relative",
                    width: "100%",
                  }}
                >
                  <img
                    src={images[imgIdx]}
                    alt={product?.title ?? "Product"}
                    style={{
                      width: "100%",
                      height: "min(68vh, 420px)",
                      objectFit: "cover",
                    }}
                  />
                  {images.length > 1 && (
                    <>
                      <button
                        onClick={() =>
                          setImgIdx((i) =>
                            i === 0 ? images.length - 1 : i - 1,
                          )
                        }
                        style={{
                          position: "absolute",
                          left: 8,
                          top: "50%",
                          transform: "translateY(-50%)",
                          zIndex: 5,
                          cursor: "pointer",
                          border: "none",
                          background: "white",
                          borderRadius: "50%",
                          width: 32,
                          height: 32,
                          fontSize: 20,
                          lineHeight: 1,
                        }}
                      >
                        ‹
                      </button>
                      <button
                        onClick={() =>
                          setImgIdx((i) =>
                            i === images.length - 1 ? 0 : i + 1,
                          )
                        }
                        style={{
                          position: "absolute",
                          right: 8,
                          top: "50%",
                          transform: "translateY(-50%)",
                          zIndex: 5,
                          cursor: "pointer",
                          border: "none",
                          background: "white",
                          borderRadius: "50%",
                          width: 32,
                          height: 32,
                          fontSize: 20,
                          lineHeight: 1,
                        }}
                      >
                        ›
                      </button>
                    </>
                  )}
                </div>
              </div>

              {/* Right — product info */}
              <div className="tf-product-info-wrap position-relative">
                <div className="tf-product-info-list">
                  {/* Title */}
                  <div className="tf-product-info-title">
                    <h5>
                      <Link
                        className="link"
                        href={`/products/${product?.slug ?? "#"}`}
                        data-bs-dismiss="modal"
                      >
                        {product?.title ?? "—"}
                      </Link>
                    </h5>
                  </div>

                  {/* Brand + Disposability */}
                  {(product?.brand || product?.disposability) && (
                    <div
                      style={{
                        display: "flex",
                        gap: 8,
                        alignItems: "center",
                        marginBottom: 10,
                        flexWrap: "wrap",
                      }}
                    >
                      {product.brand && (
                        <span className="badges text-uppercase">
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

                  {/* Price */}
                  <div
                    className="tf-product-info-price"
                    style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16, flexWrap: "wrap" }}
                  >
                    {product?.comparePrice && product.comparePrice > product.price && (
                      <div
                        style={{
                          textDecoration: "line-through",
                          color: "#aaa",
                          fontSize: 14,
                        }}
                      >
                        Rs{Number(product.comparePrice).toLocaleString("en-PK")}
                      </div>
                    )}
                    <div className="price" style={{ color: product?.comparePrice && product.comparePrice > product.price ? "#e53e3e" : "inherit" }}>
                      Rs
                      {product
                        ? Number(product.price).toLocaleString("en-PK")
                        : "—"}
                    </div>
                    {product?.discountTitle && (
                      <span className="on-sale-item" style={{ fontSize: 12 }}>{product.discountTitle}</span>
                    )}
                  </div>

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
                            background: lensType === type ? "var(--primary, #0d1b4b)" : "#fff",
                            color: lensType === type ? "#fff" : "#555",
                            fontWeight: 600,
                            fontSize: 13,
                            cursor: "pointer",
                            transition: "background 0.25s ease, border-color 0.25s ease, color 0.25s ease, transform 0.15s ease",
                            transform: lensType === type ? "scale(1.02)" : "scale(1)",
                            boxShadow: lensType === type ? "0 2px 8px rgba(13,27,75,0.18)" : "none",
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
                      overflow: lensType === "EYESIGHT" ? "visible" : "hidden",
                      transition: "max-height 0.35s ease, opacity 0.3s ease",
                      marginBottom: lensType === "EYESIGHT" ? 16 : 0,
                    }}
                  >
                    <div style={{ paddingTop: 4 }}>
                      <div style={{ display: "flex", gap: 12 }}>
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
                          style={{ flex: 1, height: 1, background: "#e0e0e0" }}
                        />
                        <span style={{ fontWeight: 600 }}>— OR —</span>
                        <div
                          style={{ flex: 1, height: 1, background: "#e0e0e0" }}
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
                                <img
                                  src={previewUrl}
                                  alt="Preview"
                                  style={{
                                    width: 40,
                                    height: 40,
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

                  {/* Quantity */}
                  <div className="tf-product-info-quantity">
                    <div className="quantity-title fw-6">Quantity</div>
                    <div className="wg-quantity">
                      <span
                        className="btn-quantity minus-btn"
                        onClick={() => setQty((q) => Math.max(1, q - 1))}
                      >
                        -
                      </span>
                      <input type="text" name="number" value={qty} readOnly />
                      <span
                        className="btn-quantity plus-btn"
                        onClick={() => setQty((q) => q + 1)}
                      >
                        +
                      </span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="tf-product-info-buy-button">
                    <form>
                      <button
                        type="button"
                        onClick={handleAddToCart}
                        className="tf-btn btn-fill justify-content-center fw-6 fs-16 flex-grow-1 animate-hover-btn"
                      >
                        <span>Add to cart -&nbsp;</span>
                        <span className="tf-qty-price">
                          Rs
                          {product
                            ? Number(product.price * qty).toLocaleString(
                                "en-PK",
                              )
                            : "—"}
                        </span>
                      </button>
                      <a
                        href="#"
                        className="tf-product-btn-wishlist hover-tooltip box-icon bg_white wishlist btn-icon-action"
                      >
                        <span className="icon icon-heart" />
                        <span className="tooltip">Add to Wishlist</span>
                        <span className="icon icon-delete" />
                      </a>
                    </form>
                  </div>

                  {/* View full details */}
                  <div>
                    <Link
                      href={`/products/${product?.slug ?? "#"}`}
                      className="tf-btn fw-6 btn-line"
                      data-bs-dismiss="modal"
                    >
                      View full details
                      <i className="icon icon-arrow1-top-left" />
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
