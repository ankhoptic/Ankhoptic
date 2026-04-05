"use client";
import React, { useState } from "react";
import Link from "next/link";
import { useCartStore } from "@/store/cartStore";
import { useStoreSettings } from "@/components/store/StoreProvider";
import { useSession } from "next-auth/react";


export default function Cart() {
  const { data: session } = useSession();
  const { items, removeItem, updateQty, subtotal } = useCartStore();
  const { free_shipping_threshold } = useStoreSettings();
  const [agreed, setAgreed] = useState(false);
  const [showAgreeError, setShowAgreeError] = useState(false);

  const FREE_SHIPPING_THRESHOLD = free_shipping_threshold;
  const sub = subtotal();
  const remaining =
    FREE_SHIPPING_THRESHOLD > 0
      ? Math.max(0, FREE_SHIPPING_THRESHOLD - sub)
      : 0;
  const progress =
    FREE_SHIPPING_THRESHOLD > 0
      ? Math.min(100, (sub / FREE_SHIPPING_THRESHOLD) * 100)
      : 0;

  return (
    <>
      {/* page-title */}
      <div className="tf-page-title">
        <div className="container-full">
          <div className="heading text-center">Shopping Cart</div>
        </div>
      </div>
      {/* /page-title */}

      {/* page-cart */}
      <section className="flat-spacing-11">
        <div className="container">
          {/* Empty Cart */}
          {items.length === 0 && (
            <div
              className="tf-page-cart text-center"
              style={{ marginTop: 80, marginBottom: 80 }}
            >
              <i
                className="icon icon-bag"
                style={{
                  fontSize: 60,
                  display: "block",
                  marginBottom: 16,
                  color: "#ccc",
                }}
              />
              <h5 className="mb_24">Your cart is empty</h5>
              <p className="mb_24">
                You may check out all the available products and buy some in the
                shop
              </p>
              <Link
                href="/"
                className="tf-btn btn-sm radius-3 btn-fill btn-icon animate-hover-btn"
              >
                Return to shop
                <i className="icon icon-arrow1-top-left" />
              </Link>
            </div>
          )}

          {/* Cart with Items */}
          {items.length > 0 && (
            <>
              {/* Free Shipping Progress */}
              {FREE_SHIPPING_THRESHOLD > 0 && (
                <div className="tf-cart-countdown">
                  <div className="title-left">
                    <svg
                      className="d-inline-block"
                      xmlns="http://www.w3.org/2000/svg"
                      width={16}
                      height={24}
                      viewBox="0 0 16 24"
                      fill="rgb(219 18 21)"
                    >
                      <path
                        fillRule="evenodd"
                        clipRule="evenodd"
                        d="M10.0899 24C11.3119 22.1928 11.4245 20.2409 10.4277 18.1443C10.1505 19.2691 9.64344 19.9518 8.90645 20.1924C9.59084 18.2379 9.01896 16.1263 7.19079 13.8576C7.15133 16.2007 6.58824 17.9076 5.50148 18.9782C4.00436 20.4517 4.02197 22.1146 5.55428 23.9669C-0.806588 20.5819 -1.70399 16.0418 2.86196 10.347C3.14516 11.7228 3.83141 12.5674 4.92082 12.8809C3.73335 7.84186 4.98274 3.54821 8.66895 0C8.6916 7.87426 11.1062 8.57414 14.1592 12.089C17.4554 16.3071 15.5184 21.1748 10.0899 24Z"
                      />
                    </svg>
                    <p suppressHydrationWarning>
                      {remaining > 0 ? (
                        <>
                          Buy <strong>Rs. {remaining.toLocaleString()}</strong>{" "}
                          more to enjoy <strong>Free Shipping</strong>
                        </>
                      ) : (
                        <span>🎉 You have free shipping!</span>
                      )}
                    </p>
                  </div>
                  <div
                    className="tf-progress-bar"
                    style={{ flex: 1, marginLeft: 16 }}
                  >
                    <span
                      style={{ width: `${progress}%` }}
                      suppressHydrationWarning
                    >
                      <div className="progress-car">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width={21}
                          height={14}
                          viewBox="0 0 21 14"
                          fill="currentColor"
                        >
                          <path
                            fillRule="evenodd"
                            clipRule="evenodd"
                            d="M0 0.875C0 0.391751 0.391751 0 0.875 0H13.5625C14.0457 0 14.4375 0.391751 14.4375 0.875V3.0625H17.3125C17.5867 3.0625 17.845 3.19101 18.0104 3.40969L20.8229 7.12844C20.9378 7.2804 21 7.46572 21 7.65625V11.375C21 11.8582 20.6082 12.25 20.125 12.25H17.7881C17.4278 13.2695 16.4554 14 15.3125 14C14.1696 14 13.1972 13.2695 12.8369 12.25H7.72563C7.36527 13.2695 6.39293 14 5.25 14C4.10706 14 3.13473 13.2695 2.77437 12.25H0.875C0.391751 12.25 0 11.8582 0 11.375V0.875ZM2.77437 10.5C3.13473 9.48047 4.10706 8.75 5.25 8.75C6.39293 8.75 7.36527 9.48046 7.72563 10.5H12.6875V1.75H1.75V10.5H2.77437ZM14.4375 8.89937V4.8125H16.8772L19.25 7.94987V10.5H17.7881C17.4278 9.48046 16.4554 8.75 15.3125 8.75C15.0057 8.75 14.7112 8.80264 14.4375 8.89937ZM5.25 10.5C4.76676 10.5 4.375 10.8918 4.375 11.375C4.375 11.8582 4.76676 12.25 5.25 12.25C5.73323 12.25 6.125 11.8582 6.125 11.375C6.125 10.8918 5.73323 10.5 5.25 10.5ZM15.3125 10.5C14.8293 10.5 14.4375 10.8918 14.4375 11.375C14.4375 11.8582 14.8293 12.25 15.3125 12.25C15.7957 12.25 16.1875 11.8582 16.1875 11.375C16.1875 10.8918 15.7957 10.5 15.3125 10.5Z"
                          />
                        </svg>
                      </div>
                    </span>
                  </div>
                </div>
              )}

              <div className="tf-page-cart-wrap">
                {/* Cart Items Table */}
                <div className="tf-page-cart-item">
                  <form>
                    <table className="tf-table-page-cart">
                      <thead>
                        <tr>
                          <th>Product</th>
                          <th>Price</th>
                          <th>Quantity</th>
                          <th>Total</th>
                        </tr>
                      </thead>
                      <tbody>
                        {items.map((item) => (
                          <tr
                            className="tf-cart-item file-delete"
                            key={item.id}
                          >
                            {/* Product Info */}
                            <td className="tf-cart-item_product">
                              <Link
                                href={`/products/${item.slug}`}
                                className="img-box"
                              >
                                {item.image ? (
                                  // eslint-disable-next-line @next/next/no-img-element
                                  <img
                                    src={item.image}
                                    alt={item.title}
                                    style={{
                                      width: 80,
                                      height: 80,
                                      objectFit: "cover",
                                      borderRadius: 8,
                                    }}
                                  />
                                ) : (
                                  <div
                                    style={{
                                      width: 80,
                                      height: 80,
                                      background: "#f5f5f5",
                                      borderRadius: 8,
                                      display: "flex",
                                      alignItems: "center",
                                      justifyContent: "center",
                                    }}
                                  >
                                    <i
                                      className="icon icon-eye"
                                      style={{ fontSize: 24, color: "#ccc" }}
                                    />
                                  </div>
                                )}
                              </Link>
                              <div className="cart-info">
                                <Link
                                  href={`/products/${item.slug}`}
                                  className="cart-title link"
                                >
                                  {item.title}
                                </Link>
                                <div className="cart-meta-variant" style={{ display: "flex", flexDirection: "column", gap: 2, marginTop: 4 }}>
                                  {/* Lens Type */}
                                  {item.lensType && (
                                    <span style={{ fontSize: 12, color: "#666" }}>
                                      <span style={{ fontWeight: 600, color: "#444" }}>Lens: </span>
                                      {item.lensType === "PLAIN" ? "Plan (No Power)" : "Eyesight"}
                                    </span>
                                  )}
                                  {/* Eye Power */}
                                  {item.lensType === "EYESIGHT" && item.power && (
                                    <span style={{ fontSize: 12, color: "#666" }}>
                                      <span style={{ fontWeight: 600, color: "#444" }}>Power: </span>
                                      {item.power.replace("L:", "Left: ").replace("R:", " | Right: ")}
                                    </span>
                                  )}
                                  {/* Addon */}
                                  {item.addonName && (
                                    <span style={{ fontSize: 12, color: "#666" }}>
                                      <span style={{ fontWeight: 600, color: "#444" }}>Aftercare: </span>
                                      {item.addonName}
                                    </span>
                                  )}
                                  {/* Prescription */}
                                  {item.prescriptionName && (
                                    <span style={{ fontSize: 11, color: "#888", marginTop: 2 }}>
                                      📎 {item.prescriptionName}
                                    </span>
                                  )}
                                </div>
                                <span
                                  className="remove-cart link remove"
                                  onClick={() => removeItem(item.id)}
                                  style={{ cursor: "pointer" }}
                                >
                                  Remove
                                </span>
                              </div>
                            </td>

                            {/* Price */}
                            <td
                              className="tf-cart-item_price tf-variant-item-price"
                              cart-data-title="Price"
                            >
                              <div className="cart-price price">
                                Rs.{" "}
                                {(
                                  item.unitPrice + item.addonPrice
                                ).toLocaleString()}
                              </div>
                            </td>

                            {/* Quantity */}
                            <td
                              className="tf-cart-item_quantity"
                              cart-data-title="Quantity"
                            >
                              <div className="cart-quantity">
                                <div className="wg-quantity">
                                  <span
                                    className="btn-quantity btndecrease"
                                    onClick={() =>
                                      updateQty(item.id, item.qty - 1)
                                    }
                                    style={{ cursor: "pointer" }}
                                  >
                                    <svg
                                      className="d-inline-block"
                                      width={9}
                                      height={1}
                                      viewBox="0 0 9 1"
                                      fill="currentColor"
                                    >
                                      <path d="M9 1H5.14286H3.85714H0V1.50201e-05H3.85714L5.14286 0L9 1.50201e-05V1Z" />
                                    </svg>
                                  </span>
                                  <input
                                    type="text"
                                    name="number"
                                    value={item.qty}
                                    readOnly
                                  />
                                  <span
                                    className="btn-quantity btnincrease"
                                    onClick={() =>
                                      updateQty(item.id, item.qty + 1)
                                    }
                                    style={{ cursor: "pointer" }}
                                  >
                                    <svg
                                      className="d-inline-block"
                                      width={9}
                                      height={9}
                                      viewBox="0 0 9 9"
                                      fill="currentColor"
                                    >
                                      <path d="M9 5.14286H5.14286V9H3.85714V5.14286H0V3.85714H3.85714V0H5.14286V3.85714H9V5.14286Z" />
                                    </svg>
                                  </span>
                                </div>
                              </div>
                            </td>

                            {/* Total */}
                            <td
                              className="tf-cart-item_total tf-variant-item-total"
                              cart-data-title="Total"
                            >
                              <div className="cart-total price">
                                Rs.{" "}
                                {(
                                  (item.unitPrice + item.addonPrice) *
                                  item.qty
                                ).toLocaleString()}
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>

                    {/* Order Note */}
                    <div className="tf-page-cart-note">
                      <label htmlFor="cart-note">Add Order Note</label>
                      <textarea
                        name="note"
                        id="cart-note"
                        placeholder="How can we help you?"
                        defaultValue={""}
                      />
                    </div>
                  </form>
                </div>

                {/* Cart Footer / Totals */}
                <div className="tf-page-cart-footer">
                  <div className="tf-cart-footer-inner">
                    {/* Free Shipping Bar */}
                    {FREE_SHIPPING_THRESHOLD > 0 && (
                      <div className="tf-free-shipping-bar">
                        <div className="tf-progress-bar">
                          <span
                            style={{ width: `${progress}%` }}
                            suppressHydrationWarning
                          >
                            <div className="progress-car">
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                width={21}
                                height={14}
                                viewBox="0 0 21 14"
                                fill="currentColor"
                              >
                                <path
                                  fillRule="evenodd"
                                  clipRule="evenodd"
                                  d="M0 0.875C0 0.391751 0.391751 0 0.875 0H13.5625C14.0457 0 14.4375 0.391751 14.4375 0.875V3.0625H17.3125C17.5867 3.0625 17.845 3.19101 18.0104 3.40969L20.8229 7.12844C20.9378 7.2804 21 7.46572 21 7.65625V11.375C21 11.8582 20.6082 12.25 20.125 12.25H17.7881C17.4278 13.2695 16.4554 14 15.3125 14C14.1696 14 13.1972 13.2695 12.8369 12.25H7.72563C7.36527 13.2695 6.39293 14 5.25 14C4.10706 14 3.13473 13.2695 2.77437 12.25H0.875C0.391751 12.25 0 11.8582 0 11.375V0.875ZM2.77437 10.5C3.13473 9.48047 4.10706 8.75 5.25 8.75C6.39293 8.75 7.36527 9.48046 7.72563 10.5H12.6875V1.75H1.75V10.5H2.77437ZM14.4375 8.89937V4.8125H16.8772L19.25 7.94987V10.5H17.7881C17.4278 9.48046 16.4554 8.75 15.3125 8.75C15.0057 8.75 14.7112 8.80264 14.4375 8.89937ZM5.25 10.5C4.76676 10.5 4.375 10.8918 4.375 11.375C4.375 11.8582 4.76676 12.25 5.25 12.25C5.73323 12.25 6.125 11.8582 6.125 11.375C6.125 10.8918 5.73323 10.5 5.25 10.5ZM15.3125 10.5C14.8293 10.5 14.4375 10.8918 14.4375 11.375C14.4375 11.8582 14.8293 12.25 15.3125 12.25C15.7957 12.25 16.1875 11.8582 16.1875 11.375C16.1875 10.8918 15.7957 10.5 15.3125 10.5Z"
                                />
                              </svg>
                            </div>
                          </span>
                        </div>
                        <div
                          className="tf-progress-msg"
                          suppressHydrationWarning
                        >
                          {remaining > 0 ? (
                            <>
                              Buy{" "}
                              <span className="price fw-6">
                                Rs. {remaining.toLocaleString()}
                              </span>{" "}
                              more to enjoy{" "}
                              <span className="fw-6">Free Shipping</span>
                            </>
                          ) : (
                            <span className="fw-6">
                              🎉 You have free shipping!
                            </span>
                          )}
                        </div>
                      </div>
                    )}

                    <div className="tf-page-cart-checkout">
                      {/* Totals */}
                      <div className="tf-cart-totals-discounts">
                        <h3>Subtotal</h3>
                        <span className="total-value" suppressHydrationWarning>
                          Rs. {sub.toLocaleString()} PKR
                        </span>
                      </div>
                      <p className="tf-cart-tax">
                        Taxes and shipping calculated at checkout
                      </p>

                      {/* Agree */}
                      <div className="cart-checkbox mb-1 d-flex align-items-center gap-2">
                        <input
                          type="checkbox"
                          className="tf-check"
                          id="check-agree"
                          checked={agreed}
                          onChange={(e) => {
                            setAgreed(e.target.checked);
                            if (e.target.checked) setShowAgreeError(false);
                          }}
                          style={{
                            margin: 0, width: "16px", height: "16px", flexShrink: 0,
                            outline: showAgreeError ? "2px solid #e53e3e" : undefined,
                            accentColor: showAgreeError ? "#e53e3e" : undefined,
                          }}
                        />
                        <label htmlFor="check-agree" className="fw-4 mb-0 d-flex align-items-center" style={{ gap: "4px", color: showAgreeError ? "#e53e3e" : undefined }}>
                          I agree with the{" "}
                          <Link href="/terms-conditions" className="text-decoration-underline" style={{ color: showAgreeError ? "#e53e3e" : "black", fontWeight: 600 }}>
                            terms and conditions
                          </Link>
                        </label>
                      </div>
                      {showAgreeError && (
                        <p style={{ color: "#e53e3e", fontSize: 12, marginBottom: 8, marginTop: 2 }}>
                          ⚠ Please agree to the terms and conditions to proceed.
                        </p>
                      )}

                      {/* Checkout */}
                      <div className="cart-checkout-btn">
                        {session ? (
                          <Link
                            href="/checkout"
                            className="tf-btn w-100 btn-fill animate-hover-btn radius-3 justify-content-center"
                            onClick={(e) => {
                              if (!agreed) {
                                e.preventDefault();
                                setShowAgreeError(true);
                              }
                            }}
                          >
                            <span>Check out</span>
                          </Link>
                        ) : (
                          <a
                            href="#login"
                            data-bs-toggle="modal"
                            className="tf-btn w-100 btn-fill animate-hover-btn radius-3 justify-content-center"
                            onClick={(e) => {
                              if (!agreed) {
                                e.preventDefault();
                                setShowAgreeError(true);
                              }
                            }}
                          >
                            <span>Check out</span>
                          </a>
                        )}
                      </div>

                      {/* Payment Icons */}
                      <div className="tf-page-cart_imgtrust">
                        <p className="text-center fw-6">
                          Guarantee Safe Checkout
                        </p>
                        <div className="cart-list-social">
                          <div className="payment-item">
                            <svg
                              viewBox="0 0 38 24"
                              xmlns="http://www.w3.org/2000/svg"
                              role="img"
                              width={38}
                              height={24}
                              aria-labelledby="pi-visa"
                            >
                              <title id="pi-visa">Visa</title>
                              <path
                                opacity=".07"
                                d="M35 0H3C1.3 0 0 1.3 0 3v18c0 1.7 1.4 3 3 3h32c1.7 0 3-1.3 3-3V3c0-1.7-1.4-3-3-3z"
                              />
                              <path
                                fill="#fff"
                                d="M35 1c1.1 0 2 .9 2 2v18c0 1.1-.9 2-2 2H3c-1.1 0-2-.9-2-2V3c0-1.1.9-2 2-2h32"
                              />
                              <path
                                d="M28.3 10.1H28c-.4 1-.7 1.5-1 3h1.9c-.3-1.5-.3-2.2-.6-3zm2.9 5.9h-1.7c-.1 0-.1 0-.2-.1l-.2-.9-.1-.2h-2.4c-.1 0-.2 0-.2.2l-.3.9c0 .1-.1.1-.1.1h-2.1l.2-.5L27 8.7c0-.5.3-.7.8-.7h1.5c.1 0 .2 0 .2.2l1.4 6.5c.1.4.2.7.2 1.1.1.1.1.1.1.2zm-13.4-.3l.4-1.8c.1 0 .2.1.2.1.7.3 1.4.5 2.1.4.2 0 .5-.1.7-.2.5-.2.5-.7.1-1.1-.2-.2-.5-.3-.8-.5-.4-.2-.8-.4-1.1-.7-1.2-1-.8-2.4-.1-3.1.6-.4.9-.8 1.7-.8 1.2 0 2.5 0 3.1.2h.1c-.1.6-.2 1.1-.4 1.7-.5-.2-1-.4-1.5-.4-.3 0-.6 0-.9.1-.2 0-.3.1-.4.2-.2.2-.2.5 0 .7l.5.4c.4.2.8.4 1.1.6.5.3 1 .8 1.1 1.4.2.9-.1 1.7-.9 2.3-.5.4-.7.6-1.4.6-1.4 0-2.5.1-3.4-.2-.1.2-.1.2-.2.1zm-3.5.3c.1-.7.1-.7.2-1 .5-2.2 1-4.5 1.4-6.7.1-.2.1-.3.3-.3H18c-.2 1.2-.4 2.1-.7 3.2-.3 1.5-.6 3-1 4.5 0 .2-.1.2-.3.2M5 8.2c0-.1.2-.2.3-.2h3.4c.5 0 .9.3 1 .8l.9 4.4c0 .1 0 .1.1.2 0-.1.1-.1.1-.1l2.1-5.1c-.1-.1 0-.2.1-.2h2.1c0 .1 0 .1-.1.2l-3.1 7.3c-.1.2-.1.3-.2.4-.1.1-.3 0-.5 0H9.7c-.1 0-.2 0-.2-.2L7.9 9.5c-.2-.2-.5-.5-.9-.6-.6-.3-1.7-.5-1.9-.5L5 8.2z"
                                fill="#142688"
                              />
                            </svg>
                          </div>
                          <div className="payment-item">
                            <svg
                              viewBox="0 0 38 24"
                              xmlns="http://www.w3.org/2000/svg"
                              width={38}
                              height={24}
                              role="img"
                              aria-labelledby="pi-paypal"
                            >
                              <title id="pi-paypal">PayPal</title>
                              <path
                                opacity=".07"
                                d="M35 0H3C1.3 0 0 1.3 0 3v18c0 1.7 1.4 3 3 3h32c1.7 0 3-1.3 3-3V3c0-1.7-1.4-3-3-3z"
                              />
                              <path
                                fill="#fff"
                                d="M35 1c1.1 0 2 .9 2 2v18c0 1.1-.9 2-2 2H3c-1.1 0-2-.9-2-2V3c0-1.1.9-2 2-2h32"
                              />
                              <path
                                fill="#003087"
                                d="M23.9 8.3c.2-1 0-1.7-.6-2.3-.6-.7-1.7-1-3.1-1h-4.1c-.3 0-.5.2-.6.5L14 15.6c0 .2.1.4.3.4H17l.4-3.4 1.8-2.2 4.7-2.1z"
                              />
                              <path
                                fill="#3086C8"
                                d="M23.9 8.3l-.2.2c-.5 2.8-2.2 3.8-4.6 3.8H18c-.3 0-.5.2-.6.5l-.6 3.9-.2 1c0 .2.1.4.3.4H19c.3 0 .5-.2.5-.4v-.1l.4-2.4v-.1c0-.2.3-.4.5-.4h.3c2.1 0 3.7-.8 4.1-3.2.2-1 .1-1.8-.4-2.4-.1-.5-.3-.7-.5-.8z"
                              />
                              <path
                                fill="#012169"
                                d="M23.3 8.1c-.1-.1-.2-.1-.3-.1-.1 0-.2 0-.3-.1-.3-.1-.7-.1-1.1-.1h-3c-.1 0-.2 0-.2.1-.2.1-.3.2-.3.4l-.7 4.4v.1c0-.3.3-.5.6-.5h1.3c2.5 0 4.1-1 4.6-3.8v-.2c-.1-.1-.3-.2-.5-.2h-.1z"
                              />
                            </svg>
                          </div>
                          <div className="payment-item">
                            <svg
                              viewBox="0 0 38 24"
                              xmlns="http://www.w3.org/2000/svg"
                              role="img"
                              width={38}
                              height={24}
                              aria-labelledby="pi-master"
                            >
                              <title id="pi-master">Mastercard</title>
                              <path
                                opacity=".07"
                                d="M35 0H3C1.3 0 0 1.3 0 3v18c0 1.7 1.4 3 3 3h32c1.7 0 3-1.3 3-3V3c0-1.7-1.4-3-3-3z"
                              />
                              <path
                                fill="#fff"
                                d="M35 1c1.1 0 2 .9 2 2v18c0 1.1-.9 2-2 2H3c-1.1 0-2-.9-2-2V3c0-1.1.9-2 2-2h32"
                              />
                              <circle fill="#EB001B" cx={15} cy={12} r={7} />
                              <circle fill="#F79E1B" cx={23} cy={12} r={7} />
                              <path
                                fill="#FF5F00"
                                d="M22 12c0-2.4-1.2-4.5-3-5.7-1.8 1.3-3 3.4-3 5.7s1.2 4.5 3 5.7c1.8-1.2 3-3.3 3-5.7z"
                              />
                            </svg>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </section>
      {/* /page-cart */}
    </>
  );
}
