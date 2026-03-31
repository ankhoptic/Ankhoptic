import Link from "next/link";
import { prisma } from "@/lib/db";
import Image from "next/image";

export default async function Testimonial() {
  const testimonials = await prisma.review.findMany({
    where: { isFeatured: true, approved: true },
    orderBy: { createdAt: "desc" },
    include: { product: true }
  });

  if (testimonials.length === 0) {
    return null; // Or show placeholders if preferred
  }

  return (
    <section className="flat-spacing-5">
      <div className="container">
        {testimonials.length <= 2 && (
          <style
            dangerouslySetInnerHTML={{
              __html: `
              @media (min-width: 768px) {
                .center-slider-2 .swiper-wrapper {
                  justify-content: center;
                }
              }
              .center-slider-1 .swiper-wrapper {
                justify-content: center;
              }
            `,
            }}
          />
        )}
        <div className="flat-title wow fadeInUp" data-wow-delay="0s">
          <span className="title">Testimonials</span>
          <p className="sub-title">
            What our customers are saying about Ankhoptics
          </p>
        </div>
        <div
          className={`wrap-carousel ${
            testimonials.length === 1
              ? "center-slider-1"
              : testimonials.length === 2
                ? "center-slider-2"
                : ""
          }`}
        >
          <div
            dir="ltr"
            className="swiper tf-sw-testimonial"
            data-preview={3}
            data-tablet={2}
            data-mobile={1}
            data-space-lg={30}
            data-space-md={15}
          >
            <div className="swiper-wrapper">
              {testimonials.map((item, idx) => {
                let pImage = "/store/images/shop/products/img-p2.png";
                if (item.product?.images) {
                  try {
                    const strImages = String(item.product.images);
                    const parsed = JSON.parse(strImages);
                    if (Array.isArray(parsed) && parsed.length > 0) {
                      pImage = parsed[0];
                    }
                  } catch {
                    // ignore
                  }
                }

                return (
                  <div className="swiper-slide" key={item.id}>
                    <div
                      className="testimonial-item style-column wow fadeInUp"
                      data-wow-delay={`${idx * 0.1}s`}
                    >
                      <div className="rating">
                        {[...Array(5)].map((_, i) => (
                          <i
                            key={i}
                            className="icon-star"
                            style={{
                              color: i < item.rating ? "#f59e0b" : "#e2e8f0",
                            }}
                          />
                        ))}
                      </div>
                      <div
                        className="heading"
                        style={{
                          fontSize: "1.1rem",
                          fontWeight: 600,
                          color: "#111827",
                          marginTop: "15px",
                          marginBottom: "10px",
                        }}
                      >
                        {item.heading}
                      </div>
                      <div
                        className="text"
                        style={{
                          fontSize: "1rem",
                          color: "#4b5563",
                          fontStyle: "italic",
                          lineHeight: 1.6,
                          marginBottom: "20px",
                        }}
                      >
                        &ldquo; {item.text} &rdquo;
                      </div>
                      <div className="author" style={{ marginTop: "auto" }}>
                        <div
                          className="name"
                          style={{
                            fontSize: "0.95rem",
                            fontWeight: 700,
                            color: "#1f2937",
                            textTransform: "uppercase",
                            letterSpacing: "0.5px",
                          }}
                        >
                          {item.name}
                        </div>
                        <div
                          className="metas"
                          style={{
                            fontSize: "0.85rem",
                            color: "#6b7280",
                            marginTop: "2px",
                          }}
                        >
                          {item.customerMeta || "Customer"}
                        </div>
                      </div>

                      {item.product && (
                        <div className="product">
                          <div className="image">
                            <Link href={`/product/${item.product.slug}`}>
                              <Image
                                src={item.image || pImage}
                                alt={item.product.title}
                                width={400}
                                height={400}
                                style={{
                                  width: "100%",
                                  height: "100%",
                                  objectFit: "cover",
                                }}
                              />
                            </Link>
                          </div>
                          <div className="content-wrap">
                            <div className="product-title">
                              <Link href={`/product/${item.product.slug}`}>
                                {item.product.title}
                              </Link>
                            </div>
                            {/* Price is optional, maybe remove it for now as it's not in our model */}
                          </div>
                          <Link href={`/product/${item.product.slug}`} className="">
                            <i className="icon-arrow1-top-left" />
                          </Link>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
          <div className="sw-dots style-2 sw-pagination-testimonial justify-content-center" />
        </div>
      </div>
    </section>
  );
}
