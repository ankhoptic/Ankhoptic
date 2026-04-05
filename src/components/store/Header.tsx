/* eslint-disable @next/next/no-img-element */
"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import { useCartStore } from "@/store/cartStore";

const DEFAULT_LOGO = "/store/images/logo/logo.jpg";

type BrandCategory = { id: string; name: string; slug: string };
type Brand = {
  id: string;
  name: string;
  slug: string;
  logo: string | null;
  categories: BrandCategory[];
};

export default function Header() {
  const { data: session } = useSession();
  const router = useRouter();
  const [logo, setLogo] = useState(DEFAULT_LOGO);
  const [lensBrands, setLensBrands] = useState<Brand[]>([]);
  const [glassesBrands, setGlassesBrands] = useState<Brand[]>([]);
  const [activeBrand, setActiveBrand] = useState<string>("");
  const [activeGlassesBrand, setActiveGlassesBrand] = useState<string>("");
  const [showLensMenu, setShowLensMenu] = useState(false);
  const [showGlassesMenu, setShowGlassesMenu] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [colors, setColors] = useState<string[]>([]);
  const [modalities, setModalities] = useState<
    { label: string; value: string }[]
  >([]);

  const [isScrolled, setIsScrolled] = useState(false);
  const [isVisible, setIsVisible] = useState(true);
  const [lastScrollTop, setLastScrollTop] = useState(0);
  const [mounted, setMounted] = useState(false);

  const items = useCartStore((state) => state.items);
  const cartCount = items.reduce((sum, item) => sum + item.qty, 0);

  useEffect(() => {
    const handleScroll = () => {
      const st = window.pageYOffset || document.documentElement.scrollTop;
      const threshold = 0; // Lower threshold to hide on "one scroll"
      const delta = 5;

      if (st > threshold) {
        if (st > lastScrollTop + delta) {
          // Scrolling Down - hide immediately
          setIsVisible(false);
        } else if (st < lastScrollTop - delta) {
          // Scrolling Up - show with background
          setIsVisible(true);
          setIsScrolled(true);
        }
      } else {
        // At the very top
        setIsVisible(true);
        setIsScrolled(false);
      }

      setLastScrollTop(st <= 0 ? 0 : st);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [lastScrollTop]);

  useEffect(() => {
    const timer = setTimeout(() => setMounted(true), 0);
    return () => clearTimeout(timer);
  }, []);

  // Fetch brands + their categories from DB
  useEffect(() => {
    fetch("/api/store/brands?type=LENS")
      .then((r) => r.json())
      .then((data: Brand[]) => {
        setLensBrands(data);
        if (data.length > 0) {
          setActiveBrand(data[0].name);
        }
      })
      .catch(() => {});

    fetch("/api/store/brands?type=GLASSES")
      .then((r) => r.json())
      .then((data: Brand[]) => {
        setGlassesBrands(data);
        if (data.length > 0) {
          setActiveGlassesBrand(data[0].name);
        }
      })
      .catch(() => {});
  }, []);

  const activeBrandData =
    lensBrands.find((b) => b.name === activeBrand) ?? lensBrands[0];

  const activeGlassesBrandData =
    glassesBrands.find((b) => b.name === activeGlassesBrand) ?? glassesBrands[0];

  useEffect(() => {
    fetch("/api/settings/store")
      .then((r) => r.json())
      .then((d) => {
        if (d.store_logo) setLogo(d.store_logo);
      })
      .catch(() => {});

    // Fetch unique colors and modalities
    fetch("/api/store/colors-modalities")
      .then((r) => r.json())
      .then((d) => {
        if (d.colors) setColors(d.colors);
        if (d.disposabilities) setModalities(d.disposabilities);
      })
      .catch((err) => console.error("Error fetching filters:", err));
  }, []);

  return (
    <>
      <header
        id="header"
        className={`header-default ${isScrolled ? "header-bg" : ""}`}
        style={{
          position: "fixed",
          top: isVisible ? "0" : "-120px",
          transition: "all 0.3s ease-in-out",
          width: "100%",
          zIndex: 1000,
        }}
      >
        <div className="container-full px_15 lg-px_40">
          <div className="row wrapper-header align-items-center">
            <div className="col-md-4 col-3 tf-lg-hidden">
              <a
                href="#mobileMenu"
                data-bs-toggle="offcanvas"
                aria-controls="offcanvasLeft"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width={24}
                  height={16}
                  viewBox="0 0 24 16"
                  fill="none"
                >
                  <path
                    d="M2.00056 2.28571H16.8577C17.1608 2.28571 17.4515 2.16531 17.6658 1.95098C17.8802 1.73665 18.0006 1.44596 18.0006 1.14286C18.0006 0.839753 17.8802 0.549063 17.6658 0.334735C17.4515 0.120408 17.1608 0 16.8577 0H2.00056C1.69745 0 1.40676 0.120408 1.19244 0.334735C0.978109 0.549063 0.857702 0.839753 0.857702 1.14286C0.857702 1.44596 0.978109 1.73665 1.19244 1.95098C1.40676 2.16531 1.69745 2.28571 2.00056 2.28571ZM0.857702 8C0.857702 7.6969 0.978109 7.40621 1.19244 7.19188C1.40676 6.97755 1.69745 6.85714 2.00056 6.85714H22.572C22.8751 6.85714 23.1658 6.97755 23.3801 7.19188C23.5944 7.40621 23.7148 7.6969 23.7148 8C23.7148 8.30311 23.5944 8.59379 23.3801 8.80812C23.1658 9.02245 22.8751 9.14286 22.572 9.14286H2.00056C1.69745 9.14286 1.40676 9.02245 1.19244 8.80812C0.978109 8.59379 0.857702 8.30311 0.857702 8ZM0.857702 14.8571C0.857702 14.554 0.978109 14.2633 1.19244 14.049C1.40676 13.8347 1.69745 13.7143 2.00056 13.7143H12.2863C12.5894 13.7143 12.8801 13.8347 13.0944 14.049C13.3087 14.2633 13.4291 14.554 13.4291 14.8571C13.4291 15.1602 13.3087 15.4509 13.0944 15.6653C12.8801 15.8796 12.5894 16 12.2863 16H2.00056C1.69745 16 1.40676 15.8796 1.19244 15.6653C0.978109 15.4509 0.857702 15.1602 0.857702 14.8571Z"
                    fill="currentColor"
                  />
                </svg>
              </a>
            </div>
            <div className="col-xl-3 col-md-4 col-6">
              <Link href="/" className="logo-header">
                <img src={logo} alt="logo" className="logo" />
              </Link>
            </div>
            <div className="col-xl-6 tf-md-hidden">
              <nav className="box-navigation text-center">
                <ul className="box-nav-ul d-flex align-items-center justify-content-center gap-30">
                  {/* Home */}
                  <li className="menu-item">
                    <Link href="/" className="item-link">
                      Home
                    </Link>
                  </li>

                  {/* Lenses - Mega Menu */}
                  <li
                    style={{ position: "relative" }}
                    className="menu-item"
                    onMouseEnter={() => setShowLensMenu(true)}
                    onMouseLeave={() => setShowLensMenu(false)}
                  >
                    <Link href="/shop" className="item-link">
                      Lenses <i className="icon icon-arrow-down" />
                    </Link>
                    <div
                      className="sub-menu"
                      style={{
                        position: "absolute",
                        top: "100%",
                        left: "50%",
                        transform: "translateX(-50%)",
                        width: "600px",
                        background: "#fff",
                        boxShadow: "0 8px 40px rgba(0,0,0,0.13)",
                        borderRadius: "12px",
                        padding: "24px",
                        display: showLensMenu ? "flex" : "none",
                        gap: "0",
                        zIndex: 9999,
                      }}
                    >
                      {/* Column 1: Brand List */}
                      <div
                        style={{
                          width: "170px",
                          flexShrink: 0,
                          borderRight: "1px solid #f0f0f0",
                          paddingRight: "16px",
                        }}
                      >
                        <div
                          style={{
                            fontSize: "11px",
                            fontWeight: "700",
                            color: "#aaa",
                            letterSpacing: "1px",
                            marginBottom: "12px",
                            textTransform: "uppercase",
                          }}
                        >
                          Brands
                        </div>
                        <ul
                          style={{ listStyle: "none", margin: 0, padding: 0 }}
                        >
                          {lensBrands.map((brand) => (
                            <li
                              key={brand.id}
                              onMouseEnter={() => setActiveBrand(brand.name)}
                              style={{ marginBottom: "4px" }}
                            >
                              <Link
                                href={`/shop?brand=${brand.slug}`}
                                style={{
                                  display: "flex",
                                  justifyContent: "space-between",
                                  alignItems: "center",
                                  padding: "6px 10px",
                                  borderRadius: "6px",
                                  fontSize: "13px",
                                  fontWeight:
                                    activeBrand === brand.name ? "700" : "400",
                                  color:
                                    activeBrand === brand.name
                                      ? "#020042"
                                      : "#444",
                                  background:
                                    activeBrand === brand.name
                                      ? "#f5f5f5"
                                      : "transparent",
                                  textDecoration: "none",
                                  transition: "all 0.15s",
                                }}
                              >
                                {brand.name}
                                {activeBrand === brand.name && (
                                  <span style={{ fontSize: "10px" }}>›</span>
                                )}
                              </Link>
                            </li>
                          ))}
                          <li
                            style={{
                              marginTop: "10px",
                              borderTop: "1px solid #f0f0f0",
                              paddingTop: "10px",
                            }}
                          >
                            <Link
                              href="/shop"
                              style={{
                                fontSize: "12px",
                                fontWeight: "700",
                                color: "var(--primary, #000)",
                                textDecoration: "none",
                                letterSpacing: "0.5px",
                              }}
                            >
                              EXPLORE ALL →
                            </Link>
                          </li>
                        </ul>
                      </div>

                      {/* Column 2: Categories */}
                      <div
                        style={{
                          flex: 1,
                          paddingLeft: "20px",
                          paddingRight: "20px",
                          borderRight: "1px solid #f0f0f0",
                        }}
                      >
                        {activeBrandData && (
                          <div
                            style={{
                              fontSize: "11px",
                              fontWeight: "700",
                              color: "#aaa",
                              letterSpacing: "1px",
                              marginBottom: "12px",
                              textTransform: "uppercase",
                            }}
                          >
                            {activeBrandData.name}
                          </div>
                        )}
                        <ul
                          style={{
                            listStyle: "none",
                            margin: 0,
                            padding: 0,
                            columns:
                              activeBrandData &&
                              activeBrandData.categories.length > 6
                                ? 2
                                : 1,
                            columnGap: "16px",
                          }}
                        >
                          {activeBrandData?.categories.map((cat) => (
                            <li
                              key={cat.id}
                              style={{
                                marginBottom: "6px",
                                breakInside: "avoid",
                              }}
                            >
                              <Link
                                href={`/shop?brand=${activeBrandData.slug}&category=${cat.slug}`}
                                style={{
                                  fontSize: "13px",
                                  color: "#444",
                                  textDecoration: "none",
                                  display: "block",
                                  padding: "3px 0",
                                }}
                              >
                                {cat.name}
                              </Link>
                            </li>
                          ))}
                          {(!activeBrandData ||
                            activeBrandData.categories.length === 0) && (
                            <li style={{ color: "#bbb", fontSize: "13px" }}>
                              No collections yet
                            </li>
                          )}
                        </ul>
                      </div>

                      {/* Column 3: Brand Image / Logo */}
                      <div
                        style={{
                          width: "180px",
                          flexShrink: 0,
                          paddingLeft: "20px",
                          display: "flex",
                          flexDirection: "column",
                          alignItems: "center",
                          justifyContent: "center",
                        }}
                      >
                        {activeBrandData?.logo ? (
                          <img
                            src={activeBrandData.logo}
                            alt={activeBrandData.name}
                            style={{
                              width: "150px",
                              height: "150px",
                              objectFit: "contain",
                              borderRadius: "10px",
                              background: "#f8f8f8",
                              padding: "12px",
                            }}
                          />
                        ) : (
                          <div
                            style={{
                              width: "150px",
                              height: "150px",
                              background: "#f8f8f8",
                              borderRadius: "10px",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              textAlign: "center",
                              padding: "12px",
                            }}
                          >
                            <span
                              style={{
                                color: "#999",
                                fontSize: "13px",
                                fontWeight: "600",
                              }}
                            >
                              {activeBrandData?.name}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  </li>

                  {/* Glasses - Mega Menu */}
                  <li
                    style={{ position: "relative" }}
                    className="menu-item"
                    onMouseEnter={() => setShowGlassesMenu(true)}
                    onMouseLeave={() => setShowGlassesMenu(false)}
                  >
                    <Link href="/shop" className="item-link">
                      Glasses <i className="icon icon-arrow-down" />
                    </Link>
                    <div
                      className="sub-menu"
                      style={{
                        position: "absolute",
                        top: "100%",
                        left: "50%",
                        transform: "translateX(-50%)",
                        width: "600px",
                        background: "#fff",
                        boxShadow: "0 8px 40px rgba(0,0,0,0.13)",
                        borderRadius: "12px",
                        padding: "24px",
                        display: showGlassesMenu ? "flex" : "none",
                        gap: "0",
                        zIndex: 9999,
                      }}
                    >
                      {/* Column 1: Brand List */}
                      <div
                        style={{
                          width: "170px",
                          flexShrink: 0,
                          borderRight: "1px solid #f0f0f0",
                          paddingRight: "16px",
                        }}
                      >
                        <div
                          style={{
                            fontSize: "11px",
                            fontWeight: "700",
                            color: "#aaa",
                            letterSpacing: "1px",
                            marginBottom: "12px",
                            textTransform: "uppercase",
                          }}
                        >
                          Brands
                        </div>
                        <ul
                          style={{ listStyle: "none", margin: 0, padding: 0 }}
                        >
                          {glassesBrands.map((brand) => (
                            <li
                              key={brand.id}
                              onMouseEnter={() => setActiveGlassesBrand(brand.name)}
                              style={{ marginBottom: "4px" }}
                            >
                              <Link
                                href={`/shop?brand=${brand.slug}&productType=GLASSES`}
                                style={{
                                  display: "flex",
                                  justifyContent: "space-between",
                                  alignItems: "center",
                                  padding: "6px 10px",
                                  borderRadius: "6px",
                                  fontSize: "13px",
                                  fontWeight:
                                    activeGlassesBrand === brand.name ? "700" : "400",
                                  color:
                                    activeGlassesBrand === brand.name
                                      ? "#020042"
                                      : "#444",
                                  background:
                                    activeGlassesBrand === brand.name
                                      ? "#f5f5f5"
                                      : "transparent",
                                  textDecoration: "none",
                                  transition: "all 0.15s",
                                }}
                              >
                                {brand.name}
                                {activeGlassesBrand === brand.name && (
                                  <span style={{ fontSize: "10px" }}>›</span>
                                )}
                              </Link>
                            </li>
                          ))}
                          <li
                            style={{
                              marginTop: "10px",
                              borderTop: "1px solid #f0f0f0",
                              paddingTop: "10px",
                            }}
                          >
                            <Link
                              href="/shop?productType=GLASSES"
                              style={{
                                fontSize: "12px",
                                fontWeight: "700",
                                color: "var(--primary, #000)",
                                textDecoration: "none",
                                letterSpacing: "0.5px",
                              }}
                            >
                              EXPLORE ALL →
                            </Link>
                          </li>
                        </ul>
                      </div>

                      {/* Column 2: Categories */}
                      <div
                        style={{
                          flex: 1,
                          paddingLeft: "20px",
                          paddingRight: "20px",
                          borderRight: "1px solid #f0f0f0",
                        }}
                      >
                        {activeGlassesBrandData && (
                          <div
                            style={{
                              fontSize: "11px",
                              fontWeight: "700",
                              color: "#aaa",
                              letterSpacing: "1px",
                              marginBottom: "12px",
                              textTransform: "uppercase",
                            }}
                          >
                            {activeGlassesBrandData.name}
                          </div>
                        )}
                        <ul
                          style={{
                            listStyle: "none",
                            margin: 0,
                            padding: 0,
                            columns:
                              activeGlassesBrandData &&
                              activeGlassesBrandData.categories.length > 6
                                ? 2
                                : 1,
                            columnGap: "16px",
                          }}
                        >
                          {activeGlassesBrandData?.categories.map((cat) => (
                            <li
                              key={cat.id}
                              style={{
                                marginBottom: "6px",
                                breakInside: "avoid",
                              }}
                            >
                              <Link
                                href={`/shop?brand=${activeGlassesBrandData.slug}&category=${cat.slug}&productType=GLASSES`}
                                style={{
                                  fontSize: "13px",
                                  color: "#444",
                                  textDecoration: "none",
                                  display: "block",
                                  padding: "3px 0",
                                }}
                              >
                                {cat.name}
                              </Link>
                            </li>
                          ))}
                          {(!activeGlassesBrandData ||
                            activeGlassesBrandData.categories.length === 0) && (
                            <li style={{ color: "#bbb", fontSize: "13px" }}>
                              No collections yet
                            </li>
                          )}
                        </ul>
                      </div>

                      {/* Column 3: Brand Image / Logo */}
                      <div
                        style={{
                          width: "180px",
                          flexShrink: 0,
                          paddingLeft: "20px",
                          display: "flex",
                          flexDirection: "column",
                          alignItems: "center",
                          justifyContent: "center",
                        }}
                      >
                        {activeGlassesBrandData?.logo ? (
                          <img
                            src={activeGlassesBrandData.logo}
                            alt={activeGlassesBrandData.name}
                            style={{
                              width: "150px",
                              height: "150px",
                              objectFit: "contain",
                              borderRadius: "10px",
                              background: "#f8f8f8",
                              padding: "12px",
                            }}
                          />
                        ) : (
                          <div
                            style={{
                              width: "150px",
                              height: "150px",
                              background: "#f8f8f8",
                              borderRadius: "10px",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              textAlign: "center",
                              padding: "12px",
                            }}
                          >
                            <span
                              style={{
                                color: "#999",
                                fontSize: "13px",
                                fontWeight: "600",
                              }}
                            >
                              {activeGlassesBrandData?.name}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  </li>

                  {/* Shop By Color */}
                  <li className="menu-item position-relative">
                    <Link href="/shop" className="item-link">
                      Shop By Color <i className="icon icon-arrow-down" />
                    </Link>
                    <div
                      className="sub-menu submenu-default"
                      style={{
                        left: "50%",
                        transform: "translateX(-50%)",
                        minWidth: "150px",
                      }}
                    >
                      <ul className="menu-list">
                        {colors.length > 0 ? (
                          colors.map((color) => (
                            <li key={color}>
                              <Link
                                href={`/shop?color=${color}`}
                                className="menu-link-text link text_black-2"
                                style={{
                                  display: "flex",
                                  alignItems: "center",
                                  gap: "8px",
                                  textTransform: "capitalize",
                                }}
                              >
                                <span
                                  style={{
                                    display: "inline-block",
                                    width: "12px",
                                    height: "12px",
                                    borderRadius: "50%",
                                    backgroundColor:
                                      color.toLowerCase() === "golden"
                                        ? "goldenrod"
                                        : color.toLowerCase() === "hazel"
                                          ? "#C9A66B" // A standard hazel-ish color
                                          : color.toLowerCase(),
                                    border:
                                      color.toLowerCase() === "white"
                                        ? "1px solid #ddd"
                                        : "none",
                                    flexShrink: 0,
                                  }}
                                />
                                {color.toLowerCase()}
                              </Link>
                            </li>
                          ))
                        ) : (
                          <li>
                            <span
                              className="menu-link-text w-100 text-center"
                              style={{
                                display: "block",
                                padding: "10px 20px",
                                color: "#aaa",
                              }}
                            >
                              Loading...
                            </span>
                          </li>
                        )}
                      </ul>
                    </div>
                  </li>

                  {/* Shop by Disposability */}
                  <li className="menu-item position-relative">
                    <Link href="/shop" className="item-link">
                      Shop by Disposability{" "}
                      <i className="icon icon-arrow-down" />
                    </Link>
                    <div
                      className="sub-menu submenu-default"
                      style={{
                        left: "50%",
                        transform: "translateX(-50%)",
                        minWidth: "160px",
                      }}
                    >
                      <ul className="menu-list">
                        {modalities.length > 0 ? (
                          modalities.map((modality) => (
                            <li key={modality.value}>
                              <Link
                                href={`/shop?disposability=${modality.value}`}
                                className="menu-link-text link text_black-2"
                              >
                                {modality.label}
                              </Link>
                            </li>
                          ))
                        ) : (
                          <li>
                            <span
                              className="menu-link-text w-100 text-center"
                              style={{
                                display: "block",
                                padding: "10px 20px",
                                color: "#aaa",
                              }}
                            >
                              Loading...
                            </span>
                          </li>
                        )}
                      </ul>
                    </div>
                  </li>

                  {/* Deals */}
                  <li className="menu-item">
                    <Link
                      href="/shop?tag=deals"
                      className="item-link position-relative"
                    >
                      Deals
                      <div
                        className="demo-label"
                        style={{ top: "-8px", right: "-30px" }}
                      >
                        <span className="demo-new">NEW</span>
                      </div>
                    </Link>
                  </li>
                </ul>
              </nav>
            </div>
            <div className="col-xl-3 col-md-4 col-3">
              <ul className="nav-icon d-flex justify-content-end align-items-center gap-20">
                <li className="nav-search">
                  <a
                    href="#canvasSearch"
                    data-bs-toggle="offcanvas"
                    aria-controls="offcanvasLeft"
                    className="nav-icon-item"
                  >
                    <i className="icon icon-search" />
                  </a>
                </li>
                <li
                  className="nav-account"
                  style={{
                    position: "relative",
                    display: "flex",
                    alignItems: "center",
                  }}
                  onMouseEnter={() => setShowProfileMenu(true)}
                  onMouseLeave={() => setShowProfileMenu(false)}
                >
                  {session ? (
                    <>
                      {/* Avatar trigger */}
                      <span
                        className="nav-icon-item"
                        style={{
                          width: 32,
                          height: 32,
                          borderRadius: "50%",
                          background: "var(--theme-color, #020042)",
                          display: "inline-flex",
                          alignItems: "center",
                          justifyContent: "center",
                          fontSize: 12,
                          fontWeight: 700,
                          color: "#fff",
                          cursor: "pointer",
                          lineHeight: 1,
                          userSelect: "none",
                        }}
                      >
                        {session.user?.name
                          ? session.user.name
                              .split(" ")
                              .map((n: string) => n[0])
                              .join("")
                              .toUpperCase()
                              .slice(0, 2)
                          : (session.user?.email?.[0]?.toUpperCase() ?? "U")}
                      </span>

                      {/* Hover Dropdown Menu — centered below avatar */}
                      {showProfileMenu && (
                        <div
                          style={{
                            position: "absolute",
                            top: "100%",
                            left: "50%",
                            transform: "translateX(-50%)",
                            minWidth: "220px",
                            background: "#fff",
                            borderRadius: "8px",
                            boxShadow: "0 8px 32px rgba(0,0,0,0.13)",
                            overflow: "hidden",
                            zIndex: 9999,
                          }}
                        >
                          {/* User info header */}
                          <div
                            style={{
                              padding: "16px 20px",
                              backgroundColor: "#f9f9f9",
                              borderBottom: "1px solid #eee",
                            }}
                          >
                            <div
                              style={{
                                fontSize: 14,
                                fontWeight: 600,
                                color: "#111",
                              }}
                            >
                              {session.user?.name ?? "My Account"}
                            </div>
                            <div
                              style={{
                                fontSize: 12,
                                color: "#666",
                                marginTop: 4,
                                overflow: "hidden",
                                textOverflow: "ellipsis",
                                whiteSpace: "nowrap",
                              }}
                            >
                              {session.user?.email}
                            </div>
                          </div>

                          {/* Links */}
                          <ul
                            style={{
                              listStyle: "none",
                              margin: 0,
                              padding: "8px 0",
                              display: "block",
                            }}
                          >
                            <li style={{ display: "block" }}>
                              <Link
                                href="/account"
                                style={{
                                  display: "flex",
                                  alignItems: "center",
                                  gap: "8px",
                                  padding: "9px 20px",
                                  fontSize: 14,
                                  color: "#222",
                                  textDecoration: "none",
                                  textAlign: "left",
                                }}
                                onMouseEnter={(e) =>
                                  (e.currentTarget.style.background = "#f5f5f5")
                                }
                                onMouseLeave={(e) =>
                                  (e.currentTarget.style.background =
                                    "transparent")
                                }
                              >
                                <i
                                  className="icon icon-account"
                                  style={{ fontSize: "16px" }}
                                />{" "}
                                Dashboard
                              </Link>
                            </li>
                            <li style={{ display: "block" }}>
                              <Link
                                href="/account/orders"
                                style={{
                                  display: "flex",
                                  alignItems: "center",
                                  gap: "8px",
                                  padding: "9px 20px",
                                  fontSize: 14,
                                  color: "#222",
                                  textDecoration: "none",
                                  textAlign: "left",
                                }}
                                onMouseEnter={(e) =>
                                  (e.currentTarget.style.background = "#f5f5f5")
                                }
                                onMouseLeave={(e) =>
                                  (e.currentTarget.style.background =
                                    "transparent")
                                }
                              >
                                <i
                                  className="icon icon-bag"
                                  style={{ fontSize: "16px" }}
                                />{" "}
                                My Orders
                              </Link>
                            </li>
                            <li
                              style={{
                                borderTop: "1px solid #eee",
                                margin: "6px 0",
                                display: "block",
                              }}
                            />
                            <li style={{ display: "block" }}>
                              <button
                                onClick={async () => {
                                  await signOut({ redirect: false });
                                  router.push("/");
                                }}
                                style={{
                                  display: "flex",
                                  alignItems: "center",
                                  gap: "8px",
                                  width: "100%",
                                  textAlign: "left",
                                  padding: "9px 20px",
                                  fontSize: 14,
                                  fontWeight: 500,
                                  color: "#ef4444",
                                  background: "transparent",
                                  border: "none",
                                  cursor: "pointer",
                                  lineHeight: "normal",
                                }}
                                onMouseEnter={(e) =>
                                  (e.currentTarget.style.background = "#fff5f5")
                                }
                                onMouseLeave={(e) =>
                                  (e.currentTarget.style.background =
                                    "transparent")
                                }
                              >
                                <i
                                  className="icon icon-close"
                                  style={{ fontSize: "16px" }}
                                />{" "}
                                Logout
                              </button>
                            </li>
                          </ul>
                        </div>
                      )}
                    </>
                  ) : (
                    <a
                      href="#login"
                      data-bs-toggle="modal"
                      className="nav-icon-item"
                    >
                      <i className="icon icon-account" />
                    </a>
                  )}
                </li>

                <li className="nav-wishlist">
                  <a href="wishlist.html" className="nav-icon-item">
                    <i className="icon icon-heart" />
                    <span className="count-box">0</span>
                  </a>
                </li>
                <li className="nav-cart">
                  <a
                    href="#shoppingCart"
                    data-bs-toggle="modal"
                    className="nav-icon-item"
                  >
                    <i className="icon icon-bag" />
                    <span className="count-box">{mounted ? cartCount : 0}</span>
                  </a>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </header>

      {/* ── Mobile Offcanvas Menu ── */}
      <div className="offcanvas offcanvas-start canvas-mb" id="mobileMenu">
        <span
          className="icon-close icon-close-popup"
          data-bs-dismiss="offcanvas"
          aria-label="Close"
        />
        <div className="mb-canvas-content">
          <div className="mb-body">
            <ul className="nav-ul-mb" id="wrapper-menu-navigation">
              {/* Lenses */}
              <li className="nav-mb-item">
                <a
                  href="#mb-lenses"
                  className="collapsed mb-menu-link"
                  data-bs-toggle="collapse"
                  aria-expanded="false"
                  aria-controls="mb-lenses"
                >
                  <span>Lenses</span>
                  <span className="btn-open-sub" />
                </a>
                <div id="mb-lenses" className="collapse">
                  <ul className="sub-nav-menu" id="sub-menu-lenses">
                    {lensBrands.length > 0 ? (
                      lensBrands.map((brand) => (
                        <li key={brand.id}>
                          {brand.categories.length > 0 ? (
                            <>
                              <a
                                href={`#mb-brand-${brand.id}`}
                                className="sub-nav-link collapsed"
                                data-bs-toggle="collapse"
                                aria-expanded="false"
                                aria-controls={`mb-brand-${brand.id}`}
                                style={{
                                  display: "flex",
                                  alignItems: "center",
                                  gap: "10px",
                                }}
                              >
                                {brand.logo ? (
                                  <img
                                    src={brand.logo}
                                    alt={brand.name}
                                    style={{
                                      width: "32px",
                                      height: "32px",
                                      objectFit: "contain",
                                      borderRadius: "6px",
                                      background: "#f5f5f5",
                                      padding: "3px",
                                      flexShrink: 0,
                                    }}
                                  />
                                ) : (
                                  <span
                                    style={{
                                      width: "32px",
                                      height: "32px",
                                      background: "#eee",
                                      borderRadius: "6px",
                                      display: "flex",
                                      alignItems: "center",
                                      justifyContent: "center",
                                      fontSize: "11px",
                                      fontWeight: 700,
                                      color: "#888",
                                      flexShrink: 0,
                                    }}
                                  >
                                    {brand.name.charAt(0)}
                                  </span>
                                )}
                                <span>{brand.name}</span>
                                <span
                                  className="btn-open-sub"
                                  style={{ marginLeft: "auto" }}
                                />
                              </a>
                              <div
                                id={`mb-brand-${brand.id}`}
                                className="collapse"
                              >
                                <ul className="sub-nav-menu sub-menu-level-2">
                                  {brand.categories.map((cat) => (
                                    <li key={cat.id}>
                                      <Link
                                        href={`/shop?brand=${brand.slug}&category=${cat.slug}`}
                                        className="sub-nav-link"
                                      >
                                        {cat.name}
                                      </Link>
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            </>
                          ) : (
                            <Link
                              href={`/shop?brand=${brand.slug}`}
                              className="sub-nav-link"
                            >
                              {brand.name}
                            </Link>
                          )}
                        </li>
                      ))
                    ) : (
                      <li>
                        <span
                          className="sub-nav-link"
                          style={{ color: "#aaa" }}
                        >
                          Loading...
                        </span>
                      </li>
                    )}
                    <li>
                      <Link
                        href="/shop"
                        className="sub-nav-link"
                        style={{ fontWeight: 600 }}
                      >
                        Explore All →
                      </Link>
                    </li>
                  </ul>
                </div>
              </li>

              {/* Glasses */}
              <li className="nav-mb-item">
                <a
                  href="#mb-glasses"
                  className="collapsed mb-menu-link"
                  data-bs-toggle="collapse"
                  aria-expanded="false"
                  aria-controls="mb-glasses"
                >
                  <span>Glasses</span>
                  <span className="btn-open-sub" />
                </a>
                <div id="mb-glasses" className="collapse">
                  <ul className="sub-nav-menu" id="sub-menu-glasses">
                    {glassesBrands.length > 0 ? (
                      glassesBrands.map((brand) => (
                        <li key={brand.id}>
                          {brand.categories.length > 0 ? (
                            <>
                              <a
                                href={`#mb-glasses-brand-${brand.id}`}
                                className="sub-nav-link collapsed"
                                data-bs-toggle="collapse"
                                aria-expanded="false"
                                aria-controls={`mb-glasses-brand-${brand.id}`}
                                style={{
                                  display: "flex",
                                  alignItems: "center",
                                  gap: "10px",
                                }}
                              >
                                {brand.logo ? (
                                  <img
                                    src={brand.logo}
                                    alt={brand.name}
                                    style={{
                                      width: "32px",
                                      height: "32px",
                                      objectFit: "contain",
                                      borderRadius: "6px",
                                      background: "#f5f5f5",
                                      padding: "3px",
                                      flexShrink: 0,
                                    }}
                                  />
                                ) : (
                                  <span
                                    style={{
                                      width: "32px",
                                      height: "32px",
                                      background: "#eee",
                                      borderRadius: "6px",
                                      display: "flex",
                                      alignItems: "center",
                                      justifyContent: "center",
                                      fontSize: "11px",
                                      fontWeight: 700,
                                      color: "#888",
                                      flexShrink: 0,
                                    }}
                                  >
                                    {brand.name.charAt(0)}
                                  </span>
                                )}
                                <span>{brand.name}</span>
                                <span
                                  className="btn-open-sub"
                                  style={{ marginLeft: "auto" }}
                                />
                              </a>
                              <div
                                id={`mb-glasses-brand-${brand.id}`}
                                className="collapse"
                              >
                                <ul className="sub-nav-menu sub-menu-level-2">
                                  {brand.categories.map((cat) => (
                                    <li key={cat.id}>
                                      <Link
                                        href={`/shop?brand=${brand.slug}&category=${cat.slug}&productType=GLASSES`}
                                        className="sub-nav-link"
                                      >
                                        {cat.name}
                                      </Link>
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            </>
                          ) : (
                            <Link
                              href={`/shop?brand=${brand.slug}&productType=GLASSES`}
                              className="sub-nav-link"
                            >
                              {brand.name}
                            </Link>
                          )}
                        </li>
                      ))
                    ) : (
                      <li>
                        <span
                          className="sub-nav-link"
                          style={{ color: "#aaa" }}
                        >
                          Loading...
                        </span>
                      </li>
                    )}
                    <li>
                      <Link
                        href="/shop?productType=GLASSES"
                        className="sub-nav-link"
                        style={{ fontWeight: 600 }}
                      >
                        Explore All →
                      </Link>
                    </li>
                  </ul>
                </div>
              </li>

              {/* Shop by Color */}
              <li className="nav-mb-item">
                <a
                  href="#mb-color"
                  className="collapsed mb-menu-link"
                  data-bs-toggle="collapse"
                  aria-expanded="false"
                  aria-controls="mb-color"
                >
                  <span>Shop By Color</span>
                  <span className="btn-open-sub" />
                </a>
                <div id="mb-color" className="collapse">
                  <ul className="sub-nav-menu">
                    {[
                      "brown",
                      "grey",
                      "green",
                      "blue",
                      "hazel",
                      "black",
                      "violet",
                      "honey",
                    ].map((c) => (
                      <li key={c}>
                        <Link
                          href={`/shop?color=${c}`}
                          className="sub-nav-link"
                          style={{ textTransform: "capitalize" }}
                        >
                          {c}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              </li>

              {/* Shop by Disposability */}
              <li className="nav-mb-item">
                <a
                  href="#mb-disposability"
                  className="collapsed mb-menu-link"
                  data-bs-toggle="collapse"
                  aria-expanded="false"
                  aria-controls="mb-disposability"
                >
                  <span>Shop by Disposability</span>
                  <span className="btn-open-sub" />
                </a>
                <div id="mb-disposability" className="collapse">
                  <ul className="sub-nav-menu">
                    {["daily", "weekly", "monthly", "quarterly", "yearly"].map(
                      (d) => (
                        <li key={d}>
                          <Link
                            href={`/shop?disposability=${d}`}
                            className="sub-nav-link"
                            style={{ textTransform: "capitalize" }}
                          >
                            {d}
                          </Link>
                        </li>
                      ),
                    )}
                  </ul>
                </div>
              </li>

              {/* Deals */}
              <li className="nav-mb-item">
                <Link href="/shop?tag=deals" className="mb-menu-link">
                  Deals{" "}
                  <span
                    className="demo-new"
                    style={{
                      fontSize: "10px",
                      background: "#f33",
                      color: "#fff",
                      borderRadius: "4px",
                      padding: "1px 5px",
                      marginLeft: "6px",
                    }}
                  >
                    NEW
                  </span>
                </Link>
              </li>

              {/* About */}
              <li className="nav-mb-item">
                <Link href="/about" className="mb-menu-link">
                  About Us
                </Link>
              </li>

              {/* Contact */}
              <li className="nav-mb-item">
                <Link href="/contact" className="mb-menu-link">
                  Contact
                </Link>
              </li>
            </ul>

            <div className="mb-other-content">
              <div className="d-flex group-icon">
                <Link href="/wishlist" className="site-nav-icon">
                  <i className="icon icon-heart" /> Wishlist
                </Link>
                <a
                  href="#canvasSearch"
                  data-bs-toggle="offcanvas"
                  aria-controls="offcanvasLeft"
                  className="site-nav-icon"
                >
                  <i className="icon icon-search" /> Search
                </a>
              </div>
              <div className="mb-notice">
                <Link href="/contact" className="text-need">
                  Need help?
                </Link>
              </div>
            </div>
          </div>

          <div className="mb-bottom">
            {session ? (
              <div className="d-flex align-items-center gap-10 px-4 py-3 border-top">
                <div
                  className="d-flex align-items-center justify-content-center"
                  style={{
                    width: 40,
                    height: 40,
                    borderRadius: "50%",
                    background: "var(--theme-color, #020042)",
                    color: "#fff",
                    fontWeight: 600,
                    fontSize: "14px",
                  }}
                >
                  {session.user?.name?.charAt(0).toUpperCase() || "U"}
                </div>
                <div>
                  <div style={{ fontSize: "14px", fontWeight: 600 }}>
                    {session.user?.name}
                  </div>
                  <Link
                    href="/dashboard"
                    className="text-primary"
                    style={{ fontSize: "12px" }}
                  >
                    View Account
                  </Link>
                </div>
                <button
                  onClick={async () => {
                    await signOut({ redirect: false });
                    router.push("/");
                  }}
                  className="ms-auto btn-icon-action"
                  style={{ border: "none", background: "transparent" }}
                >
                  <i className="icon icon-close" />
                </button>
              </div>
            ) : (
              <a href="#login" data-bs-toggle="modal" className="site-nav-icon">
                <i className="icon icon-account" /> Login
              </a>
            )}
          </div>
        </div>
      </div>
      {/* /Mobile Offcanvas Menu */}
    </>
  );
}
