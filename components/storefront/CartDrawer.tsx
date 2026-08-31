"use client";

import { X, Plus, Minus, ShoppingBag, ArrowRight } from "lucide-react";
import { useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useCart } from "@/contexts/CartContext";
import { formatPrice } from "@/lib/utils/format";

export default function CartDrawer() {
  const { items, isOpen, closeCart, removeItem, updateQuantity, subtotal } = useCart();

  // Close on Escape
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeCart();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [closeCart]);

  // Lock scroll when open
  useEffect(() => {
    if (isOpen) document.body.style.overflow = "hidden";
    else document.body.style.overflow = "";
    return () => { document.body.style.overflow = ""; };
  }, [isOpen]);

  return (
    <>
      {/* Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-50 bg-charcoal/30 backdrop-blur-sm"
          onClick={closeCart}
          aria-hidden="true"
        />
      )}

      {/* Drawer */}
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Shopping bag"
        className={`fixed top-0 right-0 z-50 flex flex-col h-full w-full max-w-md transition-transform duration-350 ease-luxury`}
        style={{
          backgroundColor: "#F8F6F0",
          transform: isOpen ? "translateX(0)" : "translateX(100%)",
          transitionTimingFunction: "cubic-bezier(0.25, 0.46, 0.45, 0.94)",
          transitionDuration: "350ms",
        }}
      >
        {/* Header */}
        <div
          className="flex items-center justify-between px-6 py-5 border-b"
          style={{ borderColor: "#D8C8AF40" }}
        >
          <div className="flex items-center gap-3">
            <ShoppingBag size={16} className="text-navy" />
            <h2
              className="label-uppercase text-navy"
              style={{ fontSize: "0.6875rem", letterSpacing: "0.2em" }}
            >
              YOUR BAG
            </h2>
            {items.length > 0 && (
              <span
                className="text-charcoal opacity-50"
                style={{ fontFamily: "var(--font-inter)", fontSize: "0.75rem" }}
              >
                ({items.length} {items.length === 1 ? "item" : "items"})
              </span>
            )}
          </div>
          <button
            onClick={closeCart}
            aria-label="Close bag"
            className="text-charcoal hover:text-navy transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Items */}
        <div className="flex-1 overflow-y-auto">
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full px-8 text-center gap-4">
              <ShoppingBag size={40} className="text-beige" />
              <div>
                <p
                  className="text-charcoal mb-2"
                  style={{ fontFamily: "var(--font-cormorant)", fontSize: "1.5rem", fontWeight: 400 }}
                >
                  Your bag is empty
                </p>
                <p
                  className="text-charcoal opacity-50"
                  style={{ fontFamily: "var(--font-inter)", fontSize: "0.8125rem" }}
                >
                  Discover our latest pieces
                </p>
              </div>
              <Link
                href="/shop"
                onClick={closeCart}
                className="mt-2 label-uppercase px-8 py-3 border border-navy text-navy hover:bg-navy hover:text-ivory transition-colors"
                style={{ fontSize: "0.6875rem", letterSpacing: "0.16em" }}
              >
                EXPLORE THE COLLECTION
              </Link>
            </div>
          ) : (
            <ul className="divide-y" style={{ borderColor: "#D8C8AF30" }}>
              {items.map((item) => (
                <li key={`${item.productId}-${item.variantId}`} className="flex gap-4 p-5">
                  {/* Image */}
                  <div
                    className="relative w-20 h-28 flex-shrink-0 overflow-hidden"
                    style={{ backgroundColor: "#D8C8AF30" }}
                  >
                    {item.image ? (
                      <Image
                        src={item.image}
                        alt={item.name}
                        fill
                        sizes="80px"
                        className="object-cover"
                      />
                    ) : (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <span style={{ fontSize: "0.5rem", color: "#172744", opacity: 0.4 }}>
                          AURELIN
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Details */}
                  <div className="flex-1 flex flex-col gap-1.5">
                    <div className="flex items-start justify-between">
                      <div>
                        <Link
                          href={`/product/${item.slug}`}
                          onClick={closeCart}
                          className="text-charcoal hover:text-navy transition-colors"
                          style={{
                            fontFamily: "var(--font-inter)",
                            fontSize: "0.8125rem",
                            fontWeight: 400,
                          }}
                        >
                          {item.name}
                        </Link>
                        {(item.colour || item.size) && (
                          <p
                            className="opacity-50 mt-0.5"
                            style={{ fontFamily: "var(--font-inter)", fontSize: "0.6875rem" }}
                          >
                            {[item.colour, item.size].filter(Boolean).join(" / ")}
                          </p>
                        )}
                      </div>
                      <button
                        onClick={() => removeItem(item.productId, item.variantId)}
                        aria-label={`Remove ${item.name}`}
                        className="text-charcoal/40 hover:text-charcoal transition-colors ml-2 mt-0.5"
                      >
                        <X size={14} />
                      </button>
                    </div>

                    <div className="flex items-center justify-between mt-auto">
                      {/* Quantity */}
                      <div className="flex items-center border" style={{ borderColor: "#D8C8AF" }}>
                        <button
                          onClick={() =>
                            updateQuantity(item.productId, item.variantId, item.quantity - 1)
                          }
                          aria-label="Decrease quantity"
                          className="w-7 h-7 flex items-center justify-center text-charcoal hover:text-navy transition-colors"
                        >
                          <Minus size={10} />
                        </button>
                        <span
                          className="w-8 text-center text-charcoal"
                          style={{ fontFamily: "var(--font-inter)", fontSize: "0.8125rem" }}
                        >
                          {item.quantity}
                        </span>
                        <button
                          onClick={() =>
                            updateQuantity(item.productId, item.variantId, item.quantity + 1)
                          }
                          disabled={item.quantity >= item.maxStock}
                          aria-label="Increase quantity"
                          className="w-7 h-7 flex items-center justify-center text-charcoal hover:text-navy transition-colors disabled:opacity-30"
                        >
                          <Plus size={10} />
                        </button>
                      </div>

                      {/* Price */}
                      <span
                        className="text-charcoal"
                        style={{ fontFamily: "var(--font-inter)", fontSize: "0.875rem", fontWeight: 500 }}
                      >
                        {formatPrice(item.price * item.quantity)}
                      </span>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Footer */}
        {items.length > 0 && (
          <div
            className="px-6 py-5 border-t space-y-4"
            style={{ borderColor: "#D8C8AF40" }}
          >
            {/* Subtotal */}
            <div className="flex justify-between items-center">
              <span
                className="label-uppercase text-charcoal opacity-60"
                style={{ fontSize: "0.6875rem", letterSpacing: "0.16em" }}
              >
                SUBTOTAL
              </span>
              <span
                className="text-charcoal"
                style={{ fontFamily: "var(--font-inter)", fontSize: "1rem", fontWeight: 500 }}
              >
                {formatPrice(subtotal)}
              </span>
            </div>

            <p
              className="opacity-40 text-center"
              style={{ fontFamily: "var(--font-inter)", fontSize: "0.6875rem" }}
            >
              Shipping calculated at checkout
            </p>

            <Link
              href="/checkout"
              onClick={closeCart}
              className="flex items-center justify-center gap-2 w-full py-4 label-uppercase text-ivory transition-all duration-200 hover:opacity-90"
              style={{
                backgroundColor: "#172744",
                fontSize: "0.6875rem",
                letterSpacing: "0.18em",
              }}
            >
              PROCEED TO CHECKOUT
              <ArrowRight size={14} />
            </Link>

            <Link
              href="/cart"
              onClick={closeCart}
              className="block text-center label-uppercase text-charcoal opacity-50 hover:opacity-80 transition-opacity"
              style={{ fontSize: "0.625rem", letterSpacing: "0.14em" }}
            >
              VIEW BAG
            </Link>
          </div>
        )}
      </div>
    </>
  );
}
