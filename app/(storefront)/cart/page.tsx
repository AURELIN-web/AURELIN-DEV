"use client";

import { useCart } from "@/contexts/CartContext";
import { formatPrice } from "@/lib/utils/format";
import Link from "next/link";
import Image from "next/image";
import { X, Plus, Minus, ShoppingBag, ArrowRight } from "lucide-react";

export default function CartPage() {
  const { items, removeItem, updateQuantity, subtotal, itemCount } = useCart();

  if (items.length === 0) {
    return (
      <div className="container-luxury py-20 text-center">
        <div className="max-w-sm mx-auto">
          <ShoppingBag size={48} className="mx-auto mb-6 opacity-20" style={{ color: "#172744" }} />
          <h1
            className="mb-3"
            style={{ fontFamily: "var(--font-cormorant)", fontSize: "2rem", fontWeight: 400, color: "#172744" }}
          >
            Your bag is empty
          </h1>
          <p className="mb-8 opacity-50" style={{ fontFamily: "var(--font-inter)", fontSize: "0.9375rem" }}>
            Discover our latest collection of premium menswear.
          </p>
          <Link
            href="/shop"
            className="inline-block px-8 py-4"
            style={{ backgroundColor: "#172744", color: "#F8F6F0", fontFamily: "var(--font-inter)", fontSize: "0.6875rem", letterSpacing: "0.18em", textTransform: "uppercase" }}
          >
            EXPLORE THE COLLECTION
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container-luxury py-12 md:py-10">
      <h1
        className="mb-10"
        style={{ fontFamily: "var(--font-cormorant)", fontSize: "clamp(1.75rem, 3vw, 2.5rem)", fontWeight: 400, color: "#172744" }}
      >
        Your Bag ({itemCount} {itemCount === 1 ? "item" : "items"})
      </h1>

      <div className="flex flex-col lg:flex-row gap-12 lg:gap-16">
        {/* Items */}
        <div className="flex-1">
          <div className="divide-y border-2 border-[#f0c37b30] px-5 ">
            {items.map((item) => (
              <div key={`${item.productId}-${item.variantId}`} className="flex gap-5 py-6">
                <div className="relative w-24 h-32 flex-shrink-0 overflow-hidden" style={{ backgroundColor: "#D8C8AF20" }}>
                  {item.image && <Image src={item.image} alt={item.name} fill sizes="96px" className="object-cover" />}
                </div>
                <div className="flex-1">
                  <div className="flex justify-between">
                    <Link href={`/product/${item.slug}`} style={{ fontFamily: "var(--font-inter)", fontSize: "0.9375rem", fontWeight: 400, color: "#172744" }}>
                      {item.name}
                    </Link>
                    <button onClick={() => removeItem(item.productId, item.variantId)} className="text-charcoal opacity-30 hover:opacity-60 transition-opacity ml-4">
                      <X size={16} />
                    </button>
                  </div>
                  {(item.colour || item.size) && (
                    <p className="mt-1 opacity-50" style={{ fontFamily: "var(--font-inter)", fontSize: "0.8125rem" }}>
                      {[item.colour, item.size].filter(Boolean).join(" / ")}
                    </p>
                  )}
                  <div className="flex items-center justify-between mt-4">
                    <div className="flex items-center border" style={{ borderColor: "#D8C8AF" }}>
                      <button onClick={() => updateQuantity(item.productId, item.variantId, item.quantity - 1)} className="w-9 h-9 flex items-center justify-center hover:text-navy transition-colors">
                        <Minus size={11} />
                      </button>
                      <span className="w-9 text-center" style={{ fontFamily: "var(--font-inter)", fontSize: "0.875rem" }}>{item.quantity}</span>
                      <button onClick={() => updateQuantity(item.productId, item.variantId, item.quantity + 1)} disabled={item.quantity >= item.maxStock} className="w-9 h-9 flex items-center justify-center hover:text-navy transition-colors disabled:opacity-30">
                        <Plus size={11} />
                      </button>
                    </div>
                    <span style={{ fontFamily: "var(--font-inter)", fontSize: "1rem", fontWeight: 500, color: "#172744" }}>
                      {formatPrice(item.price * item.quantity)}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Summary */}
        <div className="lg:w-80 flex-shrink-0">
          <div style={{ backgroundColor: "#F0EDE8", padding: "1.5rem", border: "1px solid #D8C8AF30" }}>
            <h2
              className="mb-5"
              style={{ fontFamily: "var(--font-inter)", fontSize: "0.6875rem", letterSpacing: "0.18em", textTransform: "uppercase", color: "#172744", fontWeight: 600 }}
            >
              ORDER SUMMARY
            </h2>
            <div className="space-y-3 mb-5">
              <div className="flex justify-between">
                <span className="opacity-60" style={{ fontFamily: "var(--font-inter)", fontSize: "0.875rem" }}>Subtotal</span>
                <span style={{ fontFamily: "var(--font-inter)", fontSize: "0.875rem", color: "#172744" }}>{formatPrice(subtotal)}</span>
              </div>
              <div className="flex justify-between">
                <span className="opacity-60" style={{ fontFamily: "var(--font-inter)", fontSize: "0.875rem" }}>Shipping</span>
                <span className="opacity-50" style={{ fontFamily: "var(--font-inter)", fontSize: "0.875rem" }}>Complimentary</span>
              </div>
              <div className="pt-3 border-t flex justify-between" style={{ borderColor: "#D8C8AF40" }}>
                <span style={{ fontFamily: "var(--font-inter)", fontSize: "0.9375rem", fontWeight: 500, color: "#172744" }}>Total</span>
                <span style={{ fontFamily: "var(--font-inter)", fontSize: "0.9375rem", fontWeight: 600, color: "#172744" }}>{formatPrice(subtotal)}</span>
              </div>
            </div>

            {/* Discount code */}
            <div className="flex gap-2 mb-5">
              <input
                type="text"
                placeholder="Discount code"
                className="flex-1 px-3 py-2.5 border outline-none bg-transparent text-sm"
                style={{ borderColor: "#D8C8AF", fontFamily: "var(--font-inter)" }}
              />
              <button className="px-4 py-2.5 border transition-colors hover:border-navy hover:text-navy" style={{ borderColor: "#D8C8AF", fontFamily: "var(--font-inter)", fontSize: "0.6875rem", letterSpacing: "0.1em" }}>
                APPLY
              </button>
            </div>

            <Link
              href="/checkout"
              className="flex items-center justify-center gap-2 w-full py-4"
              style={{ backgroundColor: "#172744", color: "#F8F6F0", fontFamily: "var(--font-inter)", fontSize: "0.6875rem", letterSpacing: "0.18em", textTransform: "uppercase" }}
            >
              CHECKOUT <ArrowRight size={14} />
            </Link>

            <Link
              href="/shop"
              className="block text-center mt-3 opacity-40 hover:opacity-70 transition-opacity"
              style={{ fontFamily: "var(--font-inter)", fontSize: "0.6875rem", letterSpacing: "0.12em", textTransform: "uppercase" }}
            >
              CONTINUE SHOPPING
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
