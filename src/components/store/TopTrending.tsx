"use client";
import Link from "next/link";
import Image from "next/image";
import { useEffect, useState } from "react";
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
      {p.discountTitle && (
        <div className="box-badge">{p.discountTitle}</div>
      )}
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
          <Image
            className="img-hover"
            src={p.images[1] ?? p.images[0] ?? PLACEHOLDER}
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
          <div style={{ display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap", marginTop: 4 }}>
            {onSale && p.comparePrice && (
              <span style={{ fontSize: 12, textDecoration: "line-through", color: "#aaa", fontWeight: 400 }}>
                Rs{Number(p.comparePrice).toLocaleString("en-PK")}
              </span>
            )}
            <span className="price fw-6" style={{ color: onSale ? "#e53e3e" : "#020042" }}>
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

  useEffect(() => {
    fetch("/api/store/products?limit=13")
      .then((r) => r.json())
      .then((data) => {
        const list = Array.isArray(data.products) ? data.products : [];
        if (list.length > 12) {
          setHasMore(true);
          setProducts(list.slice(0, 12));
        } else {
          setHasMore(false);
          setProducts(list);
        }
      })
      .catch(console.error);
  }, []);

  if (products.length === 0) return null;

  return (
    <section className="flat-spacing-5">
      <div className="container">
        <div className="flat-animate-tab">
          <div className="flat-title wow fadeInUp" data-wow-delay="0s">
            <span className="title fw-6">Top Trending</span>
            <p className="sub-title">
              Discover our best-selling lenses, trusted for their comfort,
              style, and superior quality!
            </p>
          </div>
          <div className="tab-content">
            <div className="tab-pane active show" id="trending" role="tabpanel">
              <div className="tf-grid-layout tf-col-2 md-col-3 lg-col-4 xl-col-4">
                {products.map((p) => (
                  <ProductCard key={p.id} p={p} />
                ))}
              </div>
            </div>
          </div>
          {hasMore && (
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
                  textTransform: "uppercase"
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
