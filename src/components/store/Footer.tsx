/* eslint-disable @next/next/no-img-element */
"use client";
import Link from "next/link";
import { useState, useEffect } from "react";

const DEFAULT_LOGO = "/store/images/logo/logo.jpg";

export default function Footer() {
  const [settings, setSettings] = useState<{
    store_logo: string;
    store_address: string;
    store_email: string;
    store_phone: string;
  }>({
    store_logo: DEFAULT_LOGO,
    store_address: "Ankhoptics Store, Karachi, Pakistan",
    store_email: "support@ankhoptics.com",
    store_phone: "+92 300 0000000",
  });

  const [brands, setBrands] = useState<
    { id: string; name: string; slug: string }[]
  >([]);
  const [colors, setColors] = useState<string[]>([]);
  const [modalities, setModalities] = useState<
    { label: string; value: string }[]
  >([]);

  useEffect(() => {
    fetch("/api/settings/store")
      .then((r) => r.json())
      .then((d) => {
        setSettings((prev) => ({
          ...prev,
          store_logo: d.store_logo || prev.store_logo,
          store_address: d.store_address || prev.store_address,
          store_email: d.store_email || prev.store_email,
          store_phone: d.store_phone || prev.store_phone,
        }));
      })
      .catch(() => {});

    fetch("/api/store/brands")
      .then((r) => r.json())
      .then(setBrands)
      .catch(() => {});

    fetch("/api/store/colors-modalities")
      .then((r) => r.json())
      .then((d) => {
        if (d.colors) setColors(d.colors);
        if (d.disposabilities) setModalities(d.disposabilities);
      })
      .catch(() => {});
  }, []);

  return (
    <footer id="footer" className="footer md-pb-70">
      <div className="footer-wrap">
        <div className="footer-body">
          <div className="container">
            <div className="row">
              <div className="col-xl-3 col-md-6 col-12">
                <div className="footer-infor">
                  <div className="footer-logo">
                    <Link href="/">
                      <img
                        src={settings.store_logo}
                        alt="Ankhoptics Logo"
                        style={{ height: "45px", width: "auto" }}
                      />
                    </Link>
                  </div>
                  <ul>
                    <li>
                      <p>Address: {settings.store_address}</p>
                    </li>
                    <li>
                      <p>
                        Email:{" "}
                        <Link href={`mailto:${settings.store_email}`}>
                          {settings.store_email}
                        </Link>
                      </p>
                    </li>
                    <li>
                      <p>
                        Phone:{" "}
                        <Link
                          href={`tel:${settings.store_phone.replace(/\s+/g, "")}`}
                        >
                          {settings.store_phone}
                        </Link>
                      </p>
                    </li>
                  </ul>
                  <Link href="/contact" className="tf-btn btn-line">
                    Get direction
                    <i className="icon icon-arrow1-top-left" />
                  </Link>
                  <ul className="tf-social-icon d-flex gap-10">
                    <li>
                      <Link
                        href="https://www.facebook.com/share/18Zzcu3XBA/"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="box-icon w_34 round social-facebook social-line"
                      >
                        <i className="icon fs-14 icon-fb" />
                      </Link>
                    </li>
                    <li>
                      <Link
                        href="https://www.instagram.com/ankhoptics?igsh=djF6NzZubTdnd3Y5"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="box-icon w_34 round social-instagram social-line"
                      >
                        <i className="icon fs-14 icon-instagram" />
                      </Link>
                    </li>
                    <li>
                      <Link
                        href="https://www.tiktok.com/@ankhoptic?_r=1&_t=ZS-959V5eSAfcD"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="box-icon w_34 round social-tiktok social-line"
                      >
                        <i className="icon fs-14 icon-tiktok" />
                      </Link>
                    </li>
                  </ul>
                </div>
              </div>
              <div className="col-xl-3 col-md-4 col-12 footer-col-block">
                <div className="footer-heading footer-heading-desktop">
                  <h6>Shop by Brand</h6>
                </div>
                <div className="footer-heading footer-heading-moblie">
                  <h6>Shop by Brand</h6>
                </div>
                <ul className="footer-menu-list tf-collapse-content">
                  {brands.slice(0, 6).map((brand) => (
                    <li key={brand.id}>
                      <Link
                        href={`/shop?brand=${brand.slug}`}
                        className="footer-menu_item"
                      >
                        {brand.name}
                      </Link>
                    </li>
                  ))}
                  {brands.length > 6 && (
                    <li>
                      <Link
                        href="/shop"
                        className="footer-menu_item"
                        style={{ fontWeight: 600 }}
                      >
                        View All Brands →
                      </Link>
                    </li>
                  )}
                  {brands.length === 0 && (
                    <li className="footer-menu_item" style={{ color: "#aaa" }}>
                      Loading...
                    </li>
                  )}
                </ul>
              </div>

              <div className="col-xl-3 col-md-4 col-12 footer-col-block">
                <div className="footer-heading footer-heading-desktop">
                  <h6>Shop by Color</h6>
                </div>
                <div className="footer-heading footer-heading-moblie">
                  <h6>Shop by Color</h6>
                </div>
                <ul className="footer-menu-list tf-collapse-content">
                  {colors.slice(0, 6).map((color) => (
                    <li key={color}>
                      <Link
                        href={`/shop?color=${color}`}
                        className="footer-menu_item"
                        style={{ textTransform: "capitalize" }}
                      >
                        {color}
                      </Link>
                    </li>
                  ))}
                  {colors.length === 0 && (
                    <li className="footer-menu_item" style={{ color: "#aaa" }}>
                      Loading...
                    </li>
                  )}
                </ul>
              </div>

              <div className="col-xl-3 col-md-4 col-12 footer-col-block">
                <div className="footer-heading footer-heading-desktop">
                  <h6>Disposability</h6>
                </div>
                <div className="footer-heading footer-heading-moblie">
                  <h6>Disposability</h6>
                </div>
                <ul className="footer-menu-list tf-collapse-content">
                  {modalities.map((modality) => (
                    <li key={modality.value}>
                      <Link
                        href={`/shop?disposability=${modality.value}`}
                        className="footer-menu_item"
                      >
                        {modality.label}
                      </Link>
                    </li>
                  ))}
                  {modalities.length === 0 && (
                    <li className="footer-menu_item" style={{ color: "#aaa" }}>
                      Loading...
                    </li>
                  )}
                </ul>
              </div>
            </div>
          </div>
        </div>
        <div className="footer-bottom">
          <div className="container">
            <div className="row">
              <div className="col-12">
                <div className="footer-bottom-wrap d-flex gap-20 flex-wrap justify-content-between align-items-center">
                  <div className="footer-menu_item d-flex gap-20 flex-wrap">
                    <span>© 2025 Ankhoptics. All Rights Reserved.</span>
                    <Link href="/privacy-policy">Privacy Policy</Link>
                    <Link href="/refund-policy">Refund Policy</Link>
                    <Link href="/terms-conditions">Terms & Conditions</Link>
                  </div>
                  <div className="tf-payment d-flex gap-10 align-items-center">
                    <img
                      src="/store/images/cod.png"
                      alt="Cash on Delivery"
                      style={{
                        height: "50px",
                        width: "auto",
                        borderRadius: "4px",
                        border: "1px solid #e5e7eb",
                      }}
                    />
                    <img
                      src="/store/images/Easypaisa_whitebg.svg"
                      alt="EasyPaisa"
                      style={{
                        height: "50px",
                        width: "auto",
                        borderRadius: "4px",
                        border: "1px solid #e5e7eb",
                      }}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
