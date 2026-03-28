/* eslint-disable @next/next/no-img-element */
"use client";
import { useState, useEffect } from "react";

export default function HeroSlider() {
  const [slides, setSlides] = useState<
    { url: string; alt?: string; link?: string }[]
  >([]);
  const [cfg, setCfg] = useState({
    preview: 1,
    tablet: 1,
    mobile: 1,
    centered: false,
    space: 0,
    loop: true,
    autoPlay: true,
    delay: 2000,
    speed: 1000,
  });
  const [ready, setReady] = useState(false);

  useEffect(() => {
    fetch("/api/settings/store")
      .then((r) => r.json())
      .then((d) => {
        if (Array.isArray(d.hero_slides) && d.hero_slides.length > 0) {
          setSlides(d.hero_slides);
        }
        if (d.slider_settings) {
          setCfg((prev) => ({
            ...prev,
            ...d.slider_settings,
            preview: Number(d.slider_settings.preview ?? 1),
            tablet: Number(d.slider_settings.tablet ?? 1),
            mobile: Number(d.slider_settings.mobile ?? 1),
            space: Number(d.slider_settings.space ?? 0),
            delay: Number(d.slider_settings.delay ?? 2000),
            speed: Number(d.slider_settings.speed ?? 1000),
          }));
        }
      })
      .catch((err) => console.error("Slider fetch error:", err))
      .finally(() => setReady(true));
  }, []);

  if (!ready || slides.length === 0) return null;

  return (
    <div className="tf-slideshow slider-radius slider-effect-fade position-relative">
      <div
        dir="ltr"
        className="swiper tf-sw-slideshow"
        data-preview={cfg.preview}
        data-tablet={cfg.tablet}
        data-mobile={cfg.mobile}
        data-centered={String(cfg.centered)}
        data-space={cfg.space}
        data-loop={String(cfg.loop)}
        data-auto-play={String(cfg.autoPlay)}
        data-delay={cfg.delay}
        data-speed={cfg.speed}
      >
        <div className="swiper-wrapper">
          {slides.map((slide, i) => (
            <div className="swiper-slide" key={i}>
              {slide.link ? (
                <a href={slide.link} className="wrap-slider">
                  <img
                    className={i !== 0 ? "lazyload" : ""}
                    {...(i !== 0 ? { "data-src": slide.url } : {})}
                    src={slide.url}
                    alt={slide.alt ?? `hp-slideshow-0${i + 1}`}
                  />
                </a>
              ) : (
                <div className="wrap-slider">
                  <img
                    className={i !== 0 ? "lazyload" : ""}
                    {...(i !== 0 ? { "data-src": slide.url } : {})}
                    src={slide.url}
                    alt={slide.alt ?? `hp-slideshow-0${i + 1}`}
                  />
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
      <div className="wrap-pagination">
        <div className="container">
          <div className="sw-dots line-white-pagination sw-pagination-slider justify-content-center"></div>
        </div>
      </div>
    </div>
  );
}
