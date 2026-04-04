import Link from "next/link";
import Image from "next/image";
import { prisma } from "@/lib/db";
import CarouselTrigger from "./CarouselTrigger";

export default async function CategorySlider() {
  type CategoryWithBrand = {
    id: string;
    name: string;
    slug: string;
    image: string | null;
    brand: { name: string; slug: string } | null;
  };

  let categories: CategoryWithBrand[] = [];
  try {
    categories = await prisma.category.findMany({
      select: {
        id: true,
        name: true,
        slug: true,
        image: true,
        brand: {
          select: { name: true, slug: true },
        },
      },
      orderBy: { position: "asc" },
    });
  } catch (error) {
    console.error("Database connection failed in CategorySlider:", error);
  }

  if (categories.length === 0) return null;

  return (
    <section className="flat-spacing-5">
      <style>{`
        .category-card {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          min-height: 200px;
          gap: 8px;
          text-decoration: none;
          background: linear-gradient(135deg, #f0f4ff 0%, #e8eeff 100%);
          padding: 20px 12px;
        }
        @media (max-width: 767px) {
          .category-card { min-height: 130px; gap: 6px; padding: 14px 12px; }
        }
        .nav-next-collection,
        .nav-prev-collection {
          top: 50% !important;
          transform: translateY(-50%) !important;
        }
      `}</style>
      <div className="container-full">
        <div
          className="flat-title wow fadeInUp align-items-start"
          data-wow-delay="0s"
        >
          <span className="title fw-6">Shop by categories</span>
        </div>
        <div className="hover-sw-nav">
          <div
            dir="ltr"
            className="swiper tf-sw-collection"
            data-preview={6}
            data-tablet={4}
            data-mobile={2}
            data-space-lg={30}
            data-space-md={30}
            data-space={15}
            data-loop="true"
            data-auto-play="true"
          >
            <div className="swiper-wrapper">
              {categories.map((cat) => (
                <div className="swiper-slide" key={cat.id}>
                  <div className="collection-item style-2 hover-img">
                    <div className="collection-inner">
                      <Link
                        href={`/shop?category=${cat.slug}`}
                        className="collection-image img-style radius-20"
                        style={{
                          display: "flex",
                          flexDirection: "column",
                          alignItems: "center",
                          justifyContent: "center",
                          minHeight: 130,
                          gap: 6,
                          textDecoration: "none",
                          background: cat.image
                            ? "none"
                            : "linear-gradient(135deg, #f0f4ff 0%, #e8eeff 100%)",
                          padding: cat.image ? "0" : "14px 12px",
                          position: "relative",
                          overflow: "hidden",
                        }}
                      >
                        {cat.image ? (
                          <>
                            <Image
                              src={cat.image}
                              alt={cat.name}
                              fill
                              style={{ objectFit: "cover" }}
                              sizes="(max-width: 768px) 50vw, 25vw"
                            />
                            <div
                              style={{
                                position: "absolute",
                                inset: 0,
                                background: "rgba(0,0,0,0.3)",
                                zIndex: 1,
                              }}
                            />
                            <div
                              style={{
                                position: "relative",
                                zIndex: 2,
                                display: "flex",
                                flexDirection: "column",
                                alignItems: "center",
                                gap: "4px",
                              }}
                            >
                              {cat.brand && (
                                <span
                                  style={{
                                    fontSize: 11,
                                    fontWeight: 600,
                                    color: "#e5e7eb",
                                    textTransform: "uppercase",
                                    letterSpacing: 1.5,
                                  }}
                                >
                                  {cat.brand.name}
                                </span>
                              )}
                              <span
                                style={{
                                  fontSize: 16,
                                  fontWeight: 700,
                                  textAlign: "center",
                                  color: "#fff",
                                  lineHeight: 1.3,
                                  textShadow: "0px 2px 4px rgba(0,0,0,0.5)",
                                }}
                              >
                                {cat.name}
                              </span>
                            </div>
                          </>
                        ) : (
                          <>
                            {cat.brand && (
                              <span
                                style={{
                                  fontSize: 11,
                                  fontWeight: 600,
                                  color: "#6b7280",
                                  textTransform: "uppercase",
                                  letterSpacing: 1.5,
                                }}
                              >
                                {cat.brand.name}
                              </span>
                            )}
                            <span
                              style={{
                                fontSize: 15,
                                fontWeight: 700,
                                textAlign: "center",
                                color: "#1e2d5a",
                                lineHeight: 1.3,
                              }}
                            >
                              {cat.name}
                            </span>
                          </>
                        )}
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="nav-sw nav-next-slider nav-next-collection box-icon w_46 round">
            <span className="icon icon-arrow-left" />
          </div>
          <div className="nav-sw nav-prev-slider nav-prev-collection box-icon w_46 round">
            <span className="icon icon-arrow-right" />
          </div>
          <div className="sw-dots style-2 sw-pagination-collection justify-content-center" />
        </div>
      </div>
      <CarouselTrigger />
    </section>
  );
}
