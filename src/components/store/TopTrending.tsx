"use client";
import Link from "next/link";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { useQuickView } from "@/context/QuickViewContext";

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
};

const PLACEHOLDER = "/store/images/products/vegetable1.jpg";

const DISPOSABILITY_LABELS: Record<string, string> = {
  ONE_DAY: "Daily",
  TWO_WEEK: "2-Week",
  MONTHLY: "Monthly",
  QUARTERLY: "Quarterly",
  YEARLY: "Yearly",
  "1_YEAR": "Yearly",
  "6_MONTH": "6-Month",
};

function ProductCard({ p }: { p: Product }) {
  const { setProduct } = useQuickView();
  const onSale = p.comparePrice && p.comparePrice > p.price;
  return (
    <div className="card-product style-9">
      {/* Ribbon discount badge */}
      {p.discountTitle && <div className="box-badge">{p.discountTitle}</div>}
      <div className="card-product-wrapper">
        <Link href={`/products/${p.slug}`} className="product-img">
          <Image
            className="img-product"
            src={p.images[0] ?? PLACEHOLDER}
            alt={p.title}
            width={600}
            height={600}
            style={{ objectFit: "cover" }}
          />
        </Link>
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
          <Link href={`/products/${p.slug}`} className="title link fw-6">
            {p.title}
          </Link>
          {p.disposability && (
            <span
              title="How long you can use this lens before replacing it"
              style={{
                fontSize: 12,
                color: "#444",
                fontWeight: 600,
                display: "block",
                marginBottom: 2,
                cursor: "help",
              }}
            >
              Disposability:{" "}
              {DISPOSABILITY_LABELS[p.disposability] ?? p.disposability}
            </span>
          )}
          {/* Price row — strikethrough compare + sale price */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 6,
              flexWrap: "wrap",
              marginTop: 4,
            }}
          >
            {onSale && p.comparePrice && (
              <span
                style={{
                  fontSize: 12,
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
              style={{ color: onSale ? "#e53e3e" : "#020042" }}
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
            <span className="tooltip">Add to Cart</span>
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function TopTrending() {
  const [products, setProducts] = useState<Product[]>([]);
  const [hasMore, setHasMore] = useState(false);
  const [activeTab, setActiveTab] = useState("LENS");
  const [visible, setVisible] = useState(false);
  const [loading, setLoading] = useState(true);
  const sectionRef = useRef<HTMLElement>(null);

  // Lazy load: fetch only when section scrolls into view
  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { rootMargin: "200px" },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  // Fetch products once section is visible (or tab changes)
  useEffect(() => {
    if (!visible) return;
    let ignore = false;
    fetch(`/api/store/products?limit=13&productType=${activeTab}`)
      .then((r) => r.json())
      .then((data) => {
        if (ignore) return;
        const list = Array.isArray(data.products) ? data.products : [];
        if (list.length > 12) {
          setHasMore(true);
          setProducts(list.slice(0, 12));
        } else {
          setHasMore(false);
          setProducts(list);
        }
      })
      .catch(console.error)
      .finally(() => {
        if (!ignore) setLoading(false);
      });
    return () => {
      ignore = true;
    };
  }, [activeTab, visible]);

  // Don't hide if switching tabs — empty state shown inline below

  return (
    <section className="flat-spacing-5" ref={sectionRef}>
      <div className="container">
        <div className="flat-animate-tab">
          <div
            className="flat-title wow fadeInUp"
            data-wow-delay="0s"
            style={{ marginBottom: "15px" }}
          >
            <span className="title fw-6">Top Trending</span>
            <p className="sub-title">
              Discover our best-selling items, trusted for their comfort, style,
              and superior quality!
            </p>
          </div>
          <div
            className="widget-tabs style-has-border widget-menu-tab mb-5"
            style={{
              display: "flex",
              justifyContent: "center",
              gap: "20px",
              listStyle: "none",
              paddingBottom: "20px",
            }}
          >
            {(["LENS", "GLASSES"] as const).map((tab) => (
              <div
                key={tab}
                className={`item-title ${activeTab === tab ? "active" : ""}`}
                style={{
                  cursor: "pointer",
                  padding: "10px 20px",
                  fontWeight: 600,
                  borderBottom:
                    activeTab === tab
                      ? "2px solid #000"
                      : "2px solid transparent",
                }}
                onClick={() => {
                  setActiveTab(tab);
                  if (tab !== activeTab) setLoading(true);
                }}
              >
                <span className="inner">
                  {tab === "LENS" ? "Lenses" : "Glasses"}
                </span>
              </div>
            ))}
          </div>

          <div className="tab-content" style={{ minHeight: "300px" }}>
            {loading ? (
              <div className="tab-pane active show" role="tabpanel">
                <div className="products-skeleton">
                  {Array.from({ length: 4 }).map((_, i) => (
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
              </div>
            ) : products.length === 0 ? (
              <div
                style={{
                  textAlign: "center",
                  padding: "60px 20px",
                  color: "#888",
                }}
              >
                <div style={{ fontSize: 40, marginBottom: 12 }}>🕶️</div>
                <div
                  style={{
                    fontSize: 16,
                    fontWeight: 600,
                    color: "#444",
                    marginBottom: 6,
                  }}
                >
                  {activeTab === "LENS"
                    ? "No Lenses Available"
                    : "No Glasses Available"}
                </div>
                <div style={{ fontSize: 13, color: "#aaa" }}>
                  Check back soon — new products are coming!
                </div>
              </div>
            ) : (
              <div
                className="tab-pane active show"
                id="trending"
                role="tabpanel"
              >
                <div className="tf-grid-layout tf-col-2 md-col-3 lg-col-4 xl-col-4">
                  {products.map((p) => (
                    <ProductCard key={p.id} p={p} />
                  ))}
                </div>
              </div>
            )}
          </div>
          {hasMore && !loading && (
            <div className="tf-pagination-wrap view-more-button text-center mt-5">
              <Link
                href="/shop"
                className="tf-btn-loading style-2 btn-loadmore fw-6 block"
                style={{
                  padding: "14px 34px",
                  borderRadius: "4px",
                  backgroundColor: "#020042",
                  color: "#fff",
                  display: "inline-block",
                  letterSpacing: "1px",
                  textTransform: "uppercase",
                }}
              >
                <span className="text">View All Products</span>
              </Link>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
