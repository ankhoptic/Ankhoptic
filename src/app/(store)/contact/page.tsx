import React from "react";
import { prisma } from "@/lib/db";

export const metadata = {
  title: "Contact Us | Ankhoptics",
};

export default async function ContactPage() {
  const keys = ["store_address", "store_phone", "store_email"];
  const rows = await prisma.storeSetting.findMany({ where: { key: { in: keys } } });
  const settings: Record<string, string> = {
    store_address: "Karachi, Pakistan",
    store_phone: "+92 300 0000000",
    store_email: "support@ankhoptics.com",
  };

  rows.forEach((r) => {
    try {
      settings[r.key] = JSON.parse(r.value) || settings[r.key];
    } catch {
      settings[r.key] = r.value || settings[r.key];
    }
  });

  return (
    <>
      {/* page-title */}
      <div className="tf-page-title style-2">
        <div className="container-full">
          <div className="heading text-center">Contact Us</div>
        </div>
      </div>
      {/* /page-title */}

      {/* map */}
      <section className="flat-spacing-9">
        <div className="container">
          <div className="tf-grid-layout gap-0 lg-col-2">
            <div className="w-100 h-full">
              <iframe
                title="Store Location"
                src="https://www.google.com/maps/embed?origin=mfe&pb=!1m2!2m1!1sAnkh+Optics,+Karachi"
                width="100%"
                height="100%"
                style={{ border: 0, minHeight: "100%", display: "block" }}
                allowFullScreen={false}
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              ></iframe>
            </div>
            <div className="tf-content-left has-mt">
              <div className="sticky-top">
                <h5 className="mb_20">Visit Our Store</h5>
                <div className="mb_20">
                  <p className="mb_15">
                    <strong>Address</strong>
                  </p>
                  <p>{settings.store_address}</p>
                </div>
                <div className="mb_20">
                  <p className="mb_15">
                    <strong>Phone / WhatsApp</strong>
                  </p>
                  <p>{settings.store_phone}</p>
                </div>
                <div className="mb_20">
                  <p className="mb_15">
                    <strong>Email</strong>
                  </p>
                  <p>{settings.store_email}</p>
                </div>
                <div className="mb_36">
                  <p className="mb_15">
                    <strong>Open Time</strong>
                  </p>
                  <div className="d-flex flex-column gap-1">
                    <div className="d-flex justify-content-between"><span>Monday</span><span>11:30 AM–11 PM</span></div>
                    <div className="d-flex justify-content-between"><span>Tuesday</span><span>11:30 AM–11 PM</span></div>
                    <div className="d-flex justify-content-between"><span>Wednesday</span><span>11:30 AM–11 PM</span></div>
                    <div className="d-flex justify-content-between"><span>Thursday</span><span>11:30 AM–11 PM</span></div>
                    <div className="d-flex justify-content-between"><span>Friday</span><span>4:00 PM–11 PM</span></div>
                    <div className="d-flex justify-content-between"><span>Saturday</span><span>11:30 AM–11 PM</span></div>
                    <div className="d-flex justify-content-between"><span>Sunday</span><span>Closed</span></div>
                  </div>
                </div>
                <div>
                  <ul className="tf-social-icon d-flex gap-20 style-default">
                    <li>
                      <a
                        href="#"
                        className="box-icon link round social-facebook border-line-black"
                      >
                        <i className="icon fs-14 icon-fb"></i>
                      </a>
                    </li>
                    <li>
                      <a
                        href="#"
                        className="box-icon link round social-twiter border-line-black"
                      >
                        <i className="icon fs-12 icon-Icon-x"></i>
                      </a>
                    </li>
                    <li>
                      <a
                        href="#"
                        className="box-icon link round social-instagram border-line-black"
                      >
                        <i className="icon fs-14 icon-instagram"></i>
                      </a>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
      {/* /map */}

      {/* form */}
      <section className="bg_grey-7 flat-spacing-9">
        <div className="container">
          <div className="flat-title">
            <span className="title">Get in Touch</span>
            <p className="sub-title text_black-2">
              Have questions or need assistance? Drop us a line.
            </p>
          </div>
          <div>
            <form
              className="mw-705 mx-auto text-center form-contact"
              action="#"
            >
              <div className="d-flex gap-15 mb_15">
                <fieldset className="w-100">
                  <input
                    type="text"
                    name="name"
                    id="name"
                    required
                    placeholder="Name *"
                  />
                </fieldset>
                <fieldset className="w-100">
                  <input
                    type="email"
                    name="email"
                    id="email"
                    required
                    placeholder="Email *"
                  />
                </fieldset>
              </div>
              <div className="mb_15">
                <textarea
                  placeholder="Message"
                  name="message"
                  id="message"
                  required
                  cols={30}
                  rows={10}
                ></textarea>
              </div>
              <div className="send-wrap">
                <button
                  type="submit"
                  className="tf-btn radius-3 btn-fill animate-hover-btn justify-content-center"
                >
                  Send
                </button>
              </div>
            </form>
          </div>
        </div>
      </section>
      {/* /form */}
    </>
  );
}
