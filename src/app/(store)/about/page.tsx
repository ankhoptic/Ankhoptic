import React from "react";

export const metadata = {
  title: "About Us | Ankhoptics",
};

export default function AboutPage() {
  return (
    <>
      {/* page-title */}
      <div className="tf-page-title style-2">
        <div className="container-full">
          <div className="heading text-center">About Us</div>
        </div>
      </div>
      {/* /page-title */}

      {/* main-page */}
      <section className="flat-spacing-25">
        <div className="container">
          <div
            className="tf-main-area-page text-center mx-auto"
            style={{ maxWidth: "800px", margin: "0 auto" }}
          >
            <h4 className="mb-4">Welcome to Ankhoptics</h4>
            <div
              className="policy-content space-y-5 text-justify"
              style={{ color: "var(--text, #444)", lineHeight: 1.6 }}
            >
              <p className="mb-4">
                Ankhoptics is your premier source for high-quality eyewear. We
                believe that everyone deserves to see the world clearly and
                comfortably, while looking incredibly stylish.
              </p>
              <p className="mb-4">
                Our mission is to provide the best lenses, frames, and eye care
                products without breaking the bank. We carefully select and curate
                the finest optical items so our customers don&apos;t have to
                compromise on quality.
              </p>
              <p className="mb-4">
                With a focus on exceptional customer service, top-tier quality,
                and affordable prices, we aim to transform the way you think
                about optical products. Whether you are looking for daily wear
                disposable lenses or premium fashion glasses, rest assured, your
                eyes are safe with Ankhoptics.
              </p>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
