"use client";
import { useEffect, useState, useCallback, useRef } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { useQuickView } from "@/context/QuickViewContext";

// ── Types ─────────────────────────────────────────────────────────────────────
type ProductItem = {
  id: string;
  title: string;
  slug: string;
  price: number;
  comparePrice: number | null;
  discountTitle?: string;
  images: string[];
  color: string | null;
  disposability: string | null;
  description: string | null;
  featured: boolean;
  brand: { name: string; slug: string } | null;
  category: { name: string; slug: string } | null;
  productType: "LENS" | "GLASSES" | "ACCESSORY";
  _count: { reviews: number };
};

type BrandCategory = { id: string; name: string; slug: string };
type Brand = {
  id: string;
  name: string;
  slug: string;
  logo: string | null;
  categories: BrandCategory[];
};

// ── Color helper (for sidebar swatches) ──────────────────────────────────────
const colorHex = (c: string): string => {
  const map: Record<string, string> = {
    blue: "#4A90D9",
    brown: "#8B6347",
    golden: "#DAA520",
    gray: "#9E9E9E",
    grey: "#9E9E9E",
    green: "#4CAF50",
    hazel: "#C9A66B",
    purple: "#9C27B0",
    yellow: "#FFC107",
    black: "#222222",
    white: "#F5F5F5",
    other: "#ccc",
  };
  return map[c.toLowerCase()] ?? "#ccc";
};

export default function Products() {
  const searchParams = useSearchParams();
  const router = useRouter();

  // ── Query params ────────────────────────────────────────────────────────────
  const brandParam = searchParams.get("brand") ?? "";
  const colorParam = searchParams.get("color") ?? "";
  const disposabilityParam = searchParams.get("disposability") ?? "";
  const categoryParam = searchParams.get("category") ?? "";
  const productTypeParam = searchParams.get("productType") ?? "";
  const tagParam = searchParams.get("tag") ?? "";
  const searchParam = searchParams.get("search") ?? "";

  // ── Filter state (local, applied via URL) ───────────────────────────────────
  const { setProduct } = useQuickView();
  const PLACEHOLDER = "/store/images/products/vegetable1.jpg";
  const DISPOSABILITY_LABELS: Record<string, string> = {
    ONE_DAY: "Daily",
    TWO_WEEK: "2-Week",
    MONTHLY: "Monthly",
    QUARTERLY: "Quarterly",
    YEARLY: "Yearly",
    "1_YEAR": "Yearly",
    "6_MONTH": "6-Month",
    YEARLY_DISPOSABLE: "Yearly",
    THREE_YEAR_DISPOSABLE: "3-Year",
  };

  const [brands, setBrands] = useState<Brand[]>([]);
  const [colors, setColors] = useState<string[]>([]);
  const [disposabilities, setDisposabilities] = useState<{label: string, value: string}[]>([]);
  const [localSearch, setLocalSearch] = useState(searchParam);
  const searchTimerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    setLocalSearch(searchParam);
  }, [searchParam]);

  // ── Products state ──────────────────────────────────────────────────────────
  const [products, setProducts] = useState<ProductItem[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [gridVisible, setGridVisible] = useState(true);
  const [page, setPage] = useState(1);
  const LIMIT = 12;

  // ── Sort state ──────────────────────────────────────────────────────────────
  const [sort, setSort] = useState("featured");
  const [showSortMenu, setShowSortMenu] = useState(false);

  // ── Mobile filter sidebar ───────────────────────────────────────────────────
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // ── Accordion: which brand's categories are expanded ────────────────────────
  const [expandedBrand, setExpandedBrand] = useState<string>(brandParam);

  // Sync expanded brand when URL param changes
  useEffect(() => {
    setExpandedBrand(brandParam);
  }, [brandParam]);

  // ── Fetch metadata ──────────────────────────────────────────────────────────
  useEffect(() => {
    fetch("/api/store/brands")
      .then((r) => r.json())
      .then(setBrands)
      .catch(() => {});
    fetch("/api/store/colors-modalities")
      .then((r) => r.json())
      .then((d) => {
        if (d.colors) setColors(d.colors);
        if (d.disposabilities) setDisposabilities(d.disposabilities);
        else if (d.modalities) setDisposabilities(d.modalities);
      })
      .catch(() => {});
  }, []);

  // ── Fetch products ──────────────────────────────────────────────────────────
  const fetchProducts = useCallback(
    async (pg: number) => {
      // Fade out grid first
      setGridVisible(false);
      await new Promise((r) => setTimeout(r, 180));
      setLoading(true);
      const params = new URLSearchParams();
      if (brandParam) params.set("brand", brandParam);
      if (colorParam) params.set("color", colorParam);
      if (disposabilityParam) params.set("disposability", disposabilityParam);
      if (categoryParam) params.set("category", categoryParam);
      if (productTypeParam) params.set("productType", productTypeParam);
      if (tagParam) params.set("tag", tagParam);
      if (searchParam) params.set("search", searchParam);
      params.set("page", String(pg));
      params.set("limit", String(LIMIT));

      try {
        const res = await fetch(`/api/store/products?${params}`);
        const data = await res.json();
        let prods: ProductItem[] = data.products ?? [];

        // Client-side sort
        if (sort === "a-z")
          prods = [...prods].sort((a, b) => a.title.localeCompare(b.title));
        else if (sort === "z-a")
          prods = [...prods].sort((a, b) => b.title.localeCompare(a.title));
        else if (sort === "price-low")
          prods = [...prods].sort((a, b) => a.price - b.price);
        else if (sort === "price-high")
          prods = [...prods].sort((a, b) => b.price - a.price);

        setProducts(prods);
        setTotal(data.total ?? 0);
      } catch {
        setProducts([]);
        setTotal(0);
      } finally {
        setLoading(false);
        // Small delay then fade in
        setTimeout(() => setGridVisible(true), 60);
      }
    },
    [
      brandParam,
      colorParam,
      disposabilityParam,
      categoryParam,
      productTypeParam,
      tagParam,
      searchParam,
      sort,
    ],
  );

  useEffect(() => {
    setPage(1);
    fetchProducts(1);
  }, [fetchProducts]);

  // ── Filter navigation helpers ───────────────────────────────────────────────
  const navigate = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value) params.set(key, value);
    else params.delete(key);
    params.delete("page");
    router.push(`/shop?${params}`);
    setSidebarOpen(false);
    // Smooth scroll to products section
    setTimeout(() => {
      const el = document.querySelector(".products-main");
      if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 80);
  };

  const clearAll = () => {
    router.push("/shop");
    setSidebarOpen(false);
  };

  // Active filter chips
  const activeFilters: { label: string; key: string }[] = [
    ...(brandParam ? [{ label: `Brand: ${brandParam}`, key: "brand" }] : []),
    ...(colorParam ? [{ label: `Color: ${colorParam}`, key: "color" }] : []),
    ...(disposabilityParam
      ? [{ label: disposabilities.find(d => d.value === disposabilityParam)?.label || disposabilityParam, key: "disposability" }]
      : []),
    ...(categoryParam
      ? [{ label: `Category: ${categoryParam}`, key: "category" }]
      : []),
    ...(tagParam ? [{ label: `Tag: ${tagParam}`, key: "tag" }] : []),
    ...(searchParam
      ? [{ label: `Search: "${searchParam}"`, key: "search" }]
      : []),
  ];

  // Page title
  let pageTitle = "All Lenses";
  if (brandParam)
    pageTitle = `${brands.find((b) => b.slug === brandParam)?.name ?? brandParam} Lenses`;
  else if (colorParam) pageTitle = `${colorParam} Colored Lenses`;
  else if (disposabilityParam) pageTitle = `${disposabilities.find(d => d.value === disposabilityParam)?.label || disposabilityParam} Lenses`;
  else if (tagParam === "deals") pageTitle = "Deals & Offers";
  else if (searchParam) pageTitle = `Search: "${searchParam}"`;

  const totalPages = Math.ceil(total / LIMIT);

  // Sort label
  const sortLabels: Record<string, string> = {
    featured: "Featured",
    "a-z": "A → Z",
    "z-a": "Z → A",
    "price-low": "Price: Low to High",
    "price-high": "Price: High to Low",
  };

  // ── Search Widget ───────────────────────────────────────────────────────────
  const SearchWidget = ({ isDesktop = true }) => (
    <div className={`sidebar-widget ${isDesktop ? 'desktop-search-only' : 'mobile-search-only'}`}>
      {isDesktop && <div className="sidebar-widget-title">Search</div>}
      <div style={{ position: "relative" }}>
        <input
          type="text"
          placeholder="Search products..."
          className="sidebar-search-input"
          value={localSearch}
          onChange={(e) => {
            const val = e.target.value;
            setLocalSearch(val);
            if (searchTimerRef.current) clearTimeout(searchTimerRef.current);
            searchTimerRef.current = setTimeout(() => {
              navigate("search", val);
            }, 400);
          }}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              if (searchTimerRef.current) clearTimeout(searchTimerRef.current);
              navigate("search", e.currentTarget.value);
            }
          }}
        />
        <button 
          type="button" 
          style={{ position: "absolute", right: "12px", top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", color: "#888" }}
          onClick={(e) => {
            const input = e.currentTarget.previousElementSibling as HTMLInputElement;
            navigate("search", input.value);
          }}
          aria-label="Search"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="8"></circle>
            <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
          </svg>
        </button>
      </div>
    </div>
  );

  // ── Sidebar ─────────────────────────────────────────────────────────────────
  const Sidebar = () => (
    <div className="products-sidebar">
      {/* Search */}
      {SearchWidget({ isDesktop: true })}


      {/* Clear all */}
      {activeFilters.length > 0 && (
        <button className="sidebar-clear-btn" style={{ marginBottom: "16px" }} onClick={clearAll}>
          Clear All Filters
        </button>
      )}

      {/* Brand filter */}
      {brands.length > 0 && (
        <div className="sidebar-widget">
          <div className="sidebar-widget-title">Brands</div>
          <ul className="sidebar-filter-list">
            <li>
              <button
                className={`sidebar-filter-btn ${!brandParam ? "active" : ""}`}
                onClick={() => navigate("brand", "")}
              >
                All Brands
              </button>
            </li>
            {brands.map((brand) => {
              const isExpanded = expandedBrand === brand.slug;
              const isActive = brandParam === brand.slug;
              return (
                <li key={brand.id}>
                  <button
                    className={`sidebar-filter-btn brand-toggle ${isActive ? "active" : ""}`}
                    onClick={() => {
                      // Navigate to brand filter
                      navigate("brand", brand.slug);
                      // Toggle accordion
                      setExpandedBrand((prev) =>
                        prev === brand.slug ? "" : brand.slug,
                      );
                    }}
                  >
                    {brand.logo && (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={brand.logo}
                        alt={brand.name}
                        className="sidebar-brand-logo"
                      />
                    )}
                    <span style={{ flex: 1 }}>{brand.name}</span>
                    {brand.categories.length > 0 && (
                      <span
                        className="brand-chevron"
                        style={{
                          transform: isExpanded
                            ? "rotate(180deg)"
                            : "rotate(0deg)",
                        }}
                      >
                        ▾
                      </span>
                    )}
                  </button>
                  {/* Smooth accordion for categories */}
                  <div
                    className="sidebar-sub-wrap"
                    style={{
                      maxHeight:
                        isExpanded && brand.categories.length > 0
                          ? `${brand.categories.length * 40}px`
                          : "0px",
                    }}
                  >
                    <ul className="sidebar-sub-list">
                      {brand.categories.map((cat) => (
                        <li key={cat.id}>
                          <button
                            className={`sidebar-filter-btn sub ${categoryParam === cat.slug ? "active" : ""}`}
                            onClick={() =>
                              navigate(
                                "category",
                                categoryParam === cat.slug ? "" : cat.slug,
                              )
                            }
                          >
                            {cat.name}
                          </button>
                        </li>
                      ))}
                    </ul>
                  </div>
                </li>
              );
            })}
          </ul>
        </div>
      )}

      {/* Color filter */}
      {colors.length > 0 && (
        <div className="sidebar-widget">
          <div className="sidebar-widget-title">Color</div>
          <div className="sidebar-color-grid">
            {colors.map((c) => (
              <button
                key={c}
                className={`sidebar-color-swatch ${colorParam.toLowerCase() === c.toLowerCase() ? "active" : ""}`}
                style={{ "--swatch-color": colorHex(c) } as React.CSSProperties}
                onClick={() =>
                  navigate(
                    "color",
                    colorParam.toLowerCase() === c.toLowerCase() ? "" : c,
                  )
                }
                title={c}
                aria-label={c}
              >
                <span className="swatch-dot" />
                <span className="swatch-label">{c}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Disposability filter */}
      {disposabilities.length > 0 && productTypeParam !== "GLASSES" && (
        <div className="sidebar-widget">
          <div className="sidebar-widget-title">Disposability</div>
          <ul className="sidebar-filter-list">
            <li>
              <button
                className={`sidebar-filter-btn ${!disposabilityParam ? "active" : ""}`}
                onClick={() => navigate("disposability", "")}
              >
                All Types
              </button>
            </li>
            {disposabilities.map((d) => (
              <li key={d.value}>
                <button
                  className={`sidebar-filter-btn ${disposabilityParam === d.value ? "active" : ""}`}
                  onClick={() =>
                    navigate("disposability", disposabilityParam === d.value ? "" : d.value)
                  }
                >
                  {d.label}
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}

    </div>
  );

  return (
    <>
      {/* ── Styles ────────────────────────────────────────────────────────────── */}
      <style>{`
        /* ── Page Title ── */
        .products-page-title {
          background: linear-gradient(135deg, #020042 0%, #0d006b 100%);
          padding: 36px 24px 30px;
          text-align: center;
          color: #fff;
        }
        .products-page-title h1 {
          font-size: clamp(1.4rem, 3vw, 2rem);
          font-weight: 700;
          margin: 0 0 6px;
          letter-spacing: -0.5px;
          color: #fff;
        }
        .products-page-title p {
          font-size: 0.9rem;
          opacity: 0.75;
          margin: 0;
        }

        /* ── Layout ── */
        .products-layout {
          display: flex;
          gap: 28px;
          padding: 32px 0;
          align-items: flex-start;
        }
        .products-main { flex: 1; min-width: 0; }

        /* ── Sidebar ── */
        .products-sidebar {
          width: 240px;
          flex-shrink: 0;
          position: sticky;
          top: 90px;
        }
        .sidebar-widget {
          border: 1px solid #eee;
          border-radius: 12px;
          padding: 18px;
          margin-bottom: 16px;
          background: #fff;
        }
        .sidebar-widget-title {
          font-size: 12px;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 1.2px;
          color: #020042;
          margin-bottom: 14px;
          padding-bottom: 10px;
          border-bottom: 2px solid #f0f0f0;
        }
        .sidebar-filter-list {
          list-style: none;
          margin: 0; padding: 0;
        }
        .sidebar-filter-list li { margin-bottom: 2px; }
        .sidebar-filter-btn {
          width: 100%;
          text-align: left;
          background: none;
          border: none;
          border-radius: 7px;
          padding: 8px 10px;
          font-size: 13px;
          color: #444;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 8px;
          transition: background 0.15s, color 0.15s;
        }
        .sidebar-filter-btn:hover { background: #f5f5f5; color: #020042; }
        .sidebar-filter-btn.active { background: #f0f0ff; color: #020042; font-weight: 600; }
        .sidebar-filter-btn.sub { font-size: 12px; padding: 6px 10px; margin-top: 2px; }
        .sidebar-brand-logo {
          width: 24px; height: 24px;
          object-fit: contain;
          border-radius: 4px;
          background: #f8f8f8;
          flex-shrink: 0;
        }
        /* Accordion wrapper — smooth height transition */
        .sidebar-sub-wrap {
          overflow: hidden;
          transition: max-height 0.3s ease;
        }
        .sidebar-sub-list {
          list-style: none;
          margin: 4px 0 6px 12px;
          padding: 0 0 0 10px;
          border-left: 2px solid #d0d0ee;
        }
        /* Chevron spin animation */
        .brand-chevron {
          display: inline-block;
          font-size: 13px;
          color: #888;
          transition: transform 0.25s ease;
          line-height: 1;
          flex-shrink: 0;
        }
        .sidebar-filter-btn.brand-toggle { flex-wrap: wrap; }
        /* Color swatches */
        .sidebar-color-grid {
          display: flex;
          flex-wrap: wrap;
          gap: 6px;
        }
        .sidebar-color-swatch {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 3px;
          border: none;
          background: none;
          cursor: pointer;
          padding: 4px;
          border-radius: 6px;
          transition: background 0.15s;
        }
        .sidebar-color-swatch:hover { background: #f5f5f5; }
        .sidebar-color-swatch.active { background: #f0f0ff; outline: 2px solid #020042; }
        .swatch-dot {
          width: 22px; height: 22px;
          border-radius: 50%;
          background: var(--swatch-color, #ccc);
          border: 2px solid rgba(0,0,0,0.08);
          display: block;
        }
        .swatch-label {
          font-size: 10px;
          color: #555;
          text-transform: capitalize;
          max-width: 44px;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
          line-height: 1.2;
        }
        .sidebar-clear-btn {
          width: 100%;
          padding: 10px;
          border: 2px solid #e53e3e;
          border-radius: 8px;
          background: none;
          color: #e53e3e;
          font-size: 13px;
          font-weight: 600;
          cursor: pointer;
          transition: background 0.15s, color 0.15s;
        }
        .sidebar-clear-btn:hover { background: #e53e3e; color: #fff; }

        .sidebar-search-input {
          width: 100%;
          padding: 10px 36px 10px 12px;
          border: 1px solid #ddd;
          border-radius: 8px;
          font-size: 13px;
          outline: none;
          transition: border-color 0.15s;
        }
        .sidebar-search-input:focus {
          border-color: #020042;
        }

        /* ── Controls bar ── */
        .products-controls {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 20px;
          gap: 12px;
          flex-wrap: wrap;
        }
        .products-count {
          font-size: 13px;
          color: #666;
        }
        .filter-chips {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
          flex: 1;
        }
        .filter-chip {
          display: inline-flex;
          align-items: center;
          gap: 5px;
          padding: 5px 10px;
          background: #f0f0ff;
          border-radius: 20px;
          font-size: 12px;
          color: #020042;
          font-weight: 500;
          border: none;
          cursor: pointer;
        }
        .filter-chip:hover { background: #e0e0f5; }
        .chip-x { font-size: 14px; line-height: 1; }
        .sort-wrapper { position: relative; }
        .sort-btn {
          display: flex;
          align-items: center;
          gap: 7px;
          padding: 8px 14px;
          border: 1px solid #ddd;
          border-radius: 8px;
          background: #fff;
          font-size: 13px;
          color: #333;
          cursor: pointer;
          transition: border-color 0.15s;
          white-space: nowrap;
        }
        .sort-btn:hover { border-color: #020042; }
        .sort-dropdown {
          position: absolute;
          right: 0;
          top: calc(100% + 6px);
          background: #fff;
          border-radius: 10px;
          box-shadow: 0 8px 30px rgba(0,0,0,0.12);
          min-width: 200px;
          z-index: 100;
          overflow: hidden;
        }
        .sort-item {
          display: block;
          width: 100%;
          text-align: left;
          padding: 10px 16px;
          background: none;
          border: none;
          font-size: 13px;
          color: #333;
          cursor: pointer;
          transition: background 0.1s;
        }
        .sort-item:hover { background: #f5f5f5; }
        .sort-item.active { color: #020042; font-weight: 600; background: #f0f0ff; }

        .mobile-filter-btn {
          display: none;
        }
        .desktop-search-only { display: block; }
        .mobile-search-only { display: none; }

        @media (max-width: 768px) {
          .desktop-sidebar-only { display: none; }
          .desktop-search-only { display: none; }
          .mobile-search-only { display: block; }
          .mobile-search-only.sidebar-widget {
             border: none;
             padding: 0;
             margin-bottom: 20px;
             background: transparent;
          }
          .mobile-filter-btn {
            display: flex;
            align-items: center;
            gap: 6px;
            padding: 8px 14px;
            border: 1px solid #ddd;
            border-radius: 8px;
            background: #fff;
            font-size: 13px;
            color: #333;
            cursor: pointer;
          }
        }
        /* Mobile sidebar overlay */
        .mobile-sidebar-overlay {
          display: none;
        }
        @media (max-width: 768px) {
          .mobile-sidebar-overlay {
            display: block;
            position: fixed;
            inset: 0;
            background: rgba(0,0,0,0);
            z-index: 999;
            pointer-events: none;
            transition: background 0.3s ease;
          }
          .mobile-sidebar-overlay.is-open {
            background: rgba(0,0,0,0.5);
            pointer-events: all;
          }
          .mobile-sidebar-panel {
            position: fixed;
            top: 0; left: 0;
            width: 280px;
            height: 100vh;
            background: #fff;
            overflow-y: auto;
            z-index: 1000;
            padding: 20px;
            box-shadow: 4px 0 30px rgba(0,0,0,0.15);
            transform: translateX(-100%);
            transition: transform 0.32s cubic-bezier(0.4, 0, 0.2, 1);
          }
          .mobile-sidebar-overlay.is-open .mobile-sidebar-panel {
            transform: translateX(0);
          }
          .mobile-sidebar-header {
            display: flex;
            align-items: center;
            justify-content: space-between;
            margin-bottom: 20px;
            padding-bottom: 14px;
            border-bottom: 1px solid #eee;
          }
          .mobile-sidebar-header h3 {
            font-size: 16px;
            font-weight: 700;
            margin: 0;
            color: #020042;
          }
          .mobile-close-btn {
            width: 32px; height: 32px;
            border: none;
            background: #f5f5f5;
            border-radius: 50%;
            cursor: pointer;
            font-size: 18px;
            display: flex;
            align-items: center;
            justify-content: center;
          }
          .products-layout {
            padding: 12px 0;
          }
          /* Remove Bootstrap container's own side padding on small screens */
          .container:has(.products-layout) {
            padding-left: 8px;
            padding-right: 8px;
          }
        }

        /* ── Product Grid ── */
        .products-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(190px, 1fr));
          gap: 20px;
        }
        @media (max-width: 480px) {
          .products-grid {
            grid-template-columns: repeat(2, 1fr);
            gap: 12px;
          }
        }

        /* ── style-9 card mobile fixes ── */
        @media (max-width: 768px) {
          /* Shrink the quickview button that floats on the image */
          .card-product.style-9 .card-product-wrapper .list-product-btn .box-icon {
            width: 32px;
            height: 32px;
          }
          /* Reduce font size inside cards on small screens */
          .card-product.style-9 .card-product-info .title {
            font-size: 13px;
          }
          .card-product.style-9 .card-product-info .price {
            font-size: 13px;
          }
        }

        /* ── Product Card ── */
        .product-card {
          border-radius: 14px;
          overflow: hidden;
          background: #fff;
          border: 1px solid #eee;
          transition: box-shadow 0.2s, transform 0.2s;
          display: flex;
          flex-direction: column;
        }
        .product-card:hover {
          box-shadow: 0 8px 30px rgba(2,0,66,0.1);
          transform: translateY(-3px);
        }
        .product-card-img-wrap {
          position: relative;
          aspect-ratio: 1;
          overflow: hidden;
          background: #f8f8f8;
        }
        .product-card-img-wrap img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          transition: transform 0.3s;
        }
        .product-card:hover .product-card-img-wrap img {
          transform: scale(1.04);
        }
        .product-badge {
          position: absolute;
          top: 10px; left: 10px;
          background: #020042;
          color: #fff;
          font-size: 10px;
          font-weight: 700;
          padding: 3px 7px;
          border-radius: 4px;
          letter-spacing: 0.5px;
        }
        .product-badge.sale { background: #e53e3e; }
        .product-card-body {
          padding: 12px 14px 14px;
          flex: 1;
          display: flex;
          flex-direction: column;
          gap: 6px;
        }
        .product-card-brand {
          font-size: 10px;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 1px;
          color: #020042;
          opacity: 0.6;
        }
        .product-card-title {
          font-size: 14px;
          font-weight: 600;
          color: #111;
          line-height: 1.35;
          text-decoration: none;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
        .product-card-title:hover { color: #020042; }
        .product-card-meta {
          display: flex;
          flex-wrap: wrap;
          gap: 4px;
          margin-top: 2px;
        }
        .meta-tag {
          font-size: 10px;
          padding: 2px 7px;
          border-radius: 20px;
          background: #f5f5f5;
          color: #555;
          border: 1px solid #ebebeb;
        }
        .meta-tag.color-tag {
          display: flex;
          align-items: center;
          gap: 4px;
        }
        .meta-color-dot {
          width: 9px; height: 9px;
          border-radius: 50%;
          border: 1px solid rgba(0,0,0,0.1);
          display: inline-block;
          flex-shrink: 0;
        }
        .product-card-price {
          display: flex;
          align-items: baseline;
          gap: 8px;
          margin-top: auto;
          padding-top: 8px;
        }
        .price-current {
          font-size: 15px;
          font-weight: 700;
          color: #020042;
        }
        .price-compare {
          font-size: 12px;
          color: #999;
          text-decoration: line-through;
        }
        .product-card-btn {
          display: block;
          width: 100%;
          padding: 9px;
          background: #020042;
          color: #fff;
          border: none;
          border-radius: 0 0 14px 14px;
          font-size: 12px;
          font-weight: 600;
          letter-spacing: 0.5px;
          cursor: pointer;
          text-align: center;
          text-decoration: none;
          transition: background 0.15s;
        }
        .product-card-btn:hover { background: #0d006b; color: #fff; }

        /* ── Empty state ── */
        .products-empty {
          text-align: center;
          padding: 80px 20px;
          color: #666;
        }
        .products-empty-icon {
          font-size: 48px;
          margin-bottom: 16px;
          opacity: 0.3;
        }
        .products-empty h3 { font-size: 18px; color: #333; margin: 0 0 8px; }
        .products-empty p { font-size: 14px; margin: 0 0 20px; }
        /* ── Pagination ── */
        .products-pagination {
          display: flex;
          justify-content: center;
          align-items: center;
          gap: 6px;
          margin-top: 40px;
          flex-wrap: wrap;
        }
        .page-btn {
          min-width: 36px;
          height: 36px;
          padding: 0 10px;
          border: 1px solid #ddd;
          border-radius: 8px;
          background: #fff;
          font-size: 13px;
          color: #333;
          cursor: pointer;
          transition: all 0.15s;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .page-btn:hover:not(:disabled) { border-color: #020042; color: #020042; }
        .page-btn.active { background: #020042; color: #fff; border-color: #020042; }
        .page-btn:disabled { opacity: 0.4; cursor: not-allowed; }
      `}</style>

      {/* ── Page Header ─────────────────────────────────────────────────────── */}
      <div className="products-page-title">
        <h1>{pageTitle}</h1>
        <p>
          {total > 0
            ? `${total} product${total !== 1 ? "s" : ""} found`
            : "Browse our collection"}
        </p>
      </div>

      {/* ── Page Layout ─────────────────────────────────────────────────────── */}
      <div className="container">
        <div className="products-layout">
          {/* Desktop Sidebar */}
          <div className="desktop-sidebar-only">
            {Sidebar()}
          </div>

          {/* Mobile Sidebar Overlay — always mounted, animated by is-open class */}
          <div
            className={`mobile-sidebar-overlay${sidebarOpen ? " is-open" : ""}`}
            onClick={() => setSidebarOpen(false)}
          >
            <div
              className="mobile-sidebar-panel"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="mobile-sidebar-header">
                <h3>Filters</h3>
                <button
                  className="mobile-close-btn"
                  onClick={() => setSidebarOpen(false)}
                >
                  ×
                </button>
              </div>
              {Sidebar()}
            </div>
          </div>

          {/* Main content */}
          <div className="products-main">
            {/* Mobile Search */}
            {SearchWidget({ isDesktop: false })}

            {/* Controls */}
            <div className="products-controls">
              {/* Mobile filter trigger */}
              <button
                className="mobile-filter-btn"
                onClick={() => setSidebarOpen(true)}
              >
                <i className="icon icon-filter" /> Filter
              </button>

              {/* Active filter chips */}
              {activeFilters.length > 0 && (
                <div className="filter-chips">
                  {activeFilters.map((f) => (
                    <button
                      key={f.key}
                      className="filter-chip"
                      onClick={() => navigate(f.key, "")}
                    >
                      {f.label} <span className="chip-x">×</span>
                    </button>
                  ))}
                </div>
              )}

              {/* Count (desktop) */}
              {activeFilters.length === 0 && (
                <span className="products-count">
                  {loading
                    ? "Loading…"
                    : `${total} item${total !== 1 ? "s" : ""}`}
                </span>
              )}

              {/* Sort */}
              <div className="sort-wrapper">
                <button
                  className="sort-btn"
                  onClick={() => setShowSortMenu((v) => !v)}
                >
                  {sortLabels[sort]}
                  <i className="icon icon-arrow-down" />
                </button>
                {showSortMenu && (
                  <div className="sort-dropdown">
                    {Object.entries(sortLabels).map(([val, label]) => (
                      <button
                        key={val}
                        className={`sort-item ${sort === val ? "active" : ""}`}
                        onClick={() => {
                          setSort(val);
                          setShowSortMenu(false);
                        }}
                      >
                        {label}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Products */}
            {loading ? (
              <div className="products-skeleton">
                {Array.from({ length: 8 }).map((_, i) => (
                  <div key={i} className="skeleton-card">
                    <div className="skeleton-img" />
                    <div className="skeleton-body">
                      <div className="skeleton-line" style={{ width: "40%" }} />
                      <div className="skeleton-line" style={{ width: "80%" }} />
                      <div className="skeleton-line" style={{ width: "60%" }} />
                      <div
                        className="skeleton-line"
                        style={{ width: "35%", marginTop: "12px" }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            ) : products.length === 0 ? (
              <div className="products-empty">
                <div className="products-empty-icon">🔍</div>
                <h3>No products found</h3>
                <p>Try adjusting your filters or browse all products.</p>
                <button
                  onClick={clearAll}
                  style={{
                    padding: "10px 24px",
                    background: "#020042",
                    color: "#fff",
                    border: "none",
                    borderRadius: "8px",
                    fontWeight: 600,
                    cursor: "pointer",
                  }}
                >
                  View All Products
                </button>
              </div>
            ) : (
              <div
                className="tf-grid-layout tf-col-2 md-col-3 lg-col-4 xl-col-4"
                style={{
                  opacity: gridVisible ? 1 : 0,
                  transition: "opacity 0.25s ease",
                }}
              >
                {products.map((p) => {
                  const onSale = p.comparePrice && p.comparePrice > p.price;
                  return (
                    <div key={p.id} className="card-product style-9">
                      {/* Ribbon discount badge — sits on card-product so it's not overflow-clipped */}
                      {p.discountTitle && (
                        <div className="box-badge">{p.discountTitle}</div>
                      )}
                      <div className="card-product-wrapper">
                        <Link
                          href={`/products/${p.slug}`}
                          className="product-img"
                        >
                          <Image
                            className="img-product"
                            src={p.images?.[0] ?? PLACEHOLDER}
                            alt={p.title}
                            width={600}
                            height={600}
                            style={{ objectFit: "cover" }}
                          />
                          <Image
                            className="img-hover"
                            src={p.images?.[1] ?? p.images?.[0] ?? PLACEHOLDER}
                            alt={p.title}
                            width={600}
                            height={600}
                            style={{ objectFit: "cover" }}
                          />
                        </Link>
                        {p.featured && !onSale && (
                          <div className="badges-on-sale">
                            <span className="badges new">New</span>
                          </div>
                        )}
                        <div className="list-product-btn">
                          <Link
                            href="#quick_view"
                            data-bs-toggle="modal"
                            className="box-icon bg_white quickview tf-btn-loading"
                            onClick={() => setProduct(p)}
                          >
                            <span className="icon icon-view" />
                            <span className="tooltip">Quick View</span>
                          </Link>
                        </div>
                      </div>
                      <div className="card-product-info">
                        <div className="inner-info">
                          {/* Brand label */}
                          {p.brand && (
                            <span
                              style={{
                                fontSize: 11,
                                fontWeight: 700,
                                textTransform: "uppercase",
                                letterSpacing: "0.8px",
                                color: "#888",
                                display: "block",
                                marginBottom: 3,
                              }}
                            >
                              {p.brand.name}
                            </span>
                          )}
                          {/* Title */}
                          <Link
                            href={`/products/${p.slug}`}
                            className="title link fw-6"
                          >
                            {p.title}
                          </Link>
                          {/* Compact info line: color · disposability */}
                          {(p.color || p.disposability) && (
                            <div
                              style={{
                                fontSize: 12,
                                color: "#777",
                                marginTop: 4,
                                display: "flex",
                                alignItems: "center",
                                gap: 4,
                                flexWrap: "wrap",
                              }}
                            >
                              {p.color && (
                                <span
                                  style={{
                                    display: "inline-flex",
                                    alignItems: "center",
                                    gap: 3,
                                  }}
                                >
                                  <span
                                    style={{
                                      width: 9,
                                      height: 9,
                                      borderRadius: "50%",
                                      background: colorHex(p.color),
                                      border: "1px solid rgba(0,0,0,0.12)",
                                      display: "inline-block",
                                      flexShrink: 0,
                                    }}
                                  />
                                  {p.color.charAt(0) +
                                    p.color.slice(1).toLowerCase()}
                                </span>
                              )}
                              {p.color && p.disposability && (
                                <span style={{ color: "#ccc" }}>·</span>
                              )}
                              {p.disposability && (
                                <span>
                                  {DISPOSABILITY_LABELS[p.disposability] ??
                                    p.disposability}
                                </span>
                              )}
                            </div>
                          )}
                          {/* Price row */}
                          <div
                            style={{
                              display: "flex",
                              alignItems: "center",
                              gap: 8,
                              marginTop: 8,
                              flexWrap: "wrap",
                            }}
                          >
                            {onSale && p.comparePrice && (
                              <span
                                style={{
                                  fontSize: 13,
                                  textDecoration: "line-through",
                                  color: "#aaa",
                                  fontWeight: 400,
                                }}
                              >
                                Rs{Number(p.comparePrice).toLocaleString("en-PK")}
                              </span>
                            )}
                            <span
                              className="price fw-6"
                              style={{
                                fontSize: 15,
                                color: onSale ? "#e53e3e" : "#020042",
                              }}
                            >
                              Rs{Number(p.price).toLocaleString("en-PK")}
                            </span>
                          </div>
                        </div>
                        <div className="list-product-btn">
                          <Link
                            href={`/products/${p.slug}`}
                            className="box-icon quick-add tf-btn-loading"
                          >
                            <span className="icon icon-bag" />
                            <span className="tooltip">View Product</span>
                          </Link>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="products-pagination">
                <button
                  className="page-btn"
                  onClick={() => {
                    setPage((p) => p - 1);
                    fetchProducts(page - 1);
                  }}
                  disabled={page === 1}
                >
                  ‹
                </button>
                {Array.from({ length: totalPages }, (_, i) => i + 1)
                  .filter(
                    (n) =>
                      n === 1 || n === totalPages || Math.abs(n - page) <= 1,
                  )
                  .reduce<(number | "…")[]>((acc, n, i, arr) => {
                    if (i > 0 && n - (arr[i - 1] as number) > 1) acc.push("…");
                    acc.push(n);
                    return acc;
                  }, [])
                  .map((n, i) =>
                    n === "…" ? (
                      <span
                        key={`ellipsis-${i}`}
                        style={{ padding: "0 4px", color: "#bbb" }}
                      >
                        …
                      </span>
                    ) : (
                      <button
                        key={n}
                        className={`page-btn ${page === n ? "active" : ""}`}
                        onClick={() => {
                          setPage(n as number);
                          fetchProducts(n as number);
                        }}
                      >
                        {n}
                      </button>
                    ),
                  )}
                <button
                  className="page-btn"
                  onClick={() => {
                    setPage((p) => p + 1);
                    fetchProducts(page + 1);
                  }}
                  disabled={page === totalPages}
                >
                  ›
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
