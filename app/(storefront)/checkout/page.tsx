"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useCart } from "@/contexts/CartContext";
import { formatPrice } from "@/lib/utils/format";
import { createClient } from "@/utils/supabase/client";
import { toast } from "sonner";
import Image from "next/image";
import { ArrowRight, Lock } from "lucide-react";
import type { ShippingAddress } from "@/types/database";

interface FormState {
  full_name: string;
  email: string;
  phone: string;
  address_line1: string;
  address_line2: string;
  city: string;
  state: string;
  postal_code: string;
  country: string;
  notes: string;
}

const defaultForm: FormState = {
  full_name: "",
  email: "",
  phone: "",
  address_line1: "",
  address_line2: "",
  city: "",
  state: "",
  postal_code: "",
  country: "India",
  notes: "",
};

export default function CheckoutPage() {
  const { items, subtotal, clearCart } = useCart();
  const [form, setForm] = useState<FormState>(defaultForm);
  const [step, setStep] = useState<"details" | "review" | "confirmed">("details");
  const [orderNumber, setOrderNumber] = useState("");
  const [placing, setPlacing] = useState(false);
  const router = useRouter();

  if (items.length === 0 && step !== "confirmed") {
    router.push("/cart");
    return null;
  }

  const update = (key: keyof FormState, value: string) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handlePlaceOrder = async () => {
    if (!form.full_name || !form.email || !form.phone || !form.address_line1 || !form.city || !form.postal_code) {
      toast.error("Please fill all required fields");
      return;
    }
    setPlacing(true);
    const supabase = createClient();

    const shippingAddress: ShippingAddress = {
      full_name: form.full_name,
      phone: form.phone,
      address_line1: form.address_line1,
      address_line2: form.address_line2 || undefined,
      city: form.city,
      state: form.state,
      postal_code: form.postal_code,
      country: form.country,
    };

    const orderNum = `AUR-${Date.now().toString().slice(-8)}`;

    const { data: order, error } = await supabase
      .from("orders")
      .insert({
        order_number: orderNum,
        customer_email: form.email,
        customer_name: form.full_name,
        customer_phone: form.phone,
        shipping_address: shippingAddress,
        subtotal,
        shipping_amount: 0,
        discount_amount: 0,
        total: subtotal,
        payment_status: "pending",
        order_status: "pending",
        notes: form.notes || null,
      })
      .select("id")
      .single();

    if (error || !order) {
      toast.error("Failed to place order. Please try again.");
      setPlacing(false);
      return;
    }

    // Insert order items
    await supabase.from("order_items").insert(
      items.map((item) => ({
        order_id: order.id,
        product_id: item.productId,
        variant_id: item.variantId,
        product_name: item.name,
        variant_info: { colour: item.colour, size: item.size },
        quantity: item.quantity,
        unit_price: item.price,
        total_price: item.price * item.quantity,
      }))
    );

    setOrderNumber(orderNum);
    clearCart();
    setStep("confirmed");
    setPlacing(false);
  };

  const inputStyle = {
    fontFamily: "var(--font-inter)",
    fontSize: "0.9375rem",
    color: "#242424",
    borderColor: "#D8C8AF",
  };

  const labelStyle = {
    fontFamily: "var(--font-inter)",
    fontSize: "0.5625rem",
    letterSpacing: "0.16em",
    textTransform: "uppercase" as const,
    color: "#172744",
    opacity: 0.6,
  };

  if (step === "confirmed") {
    return (
      <div className="container-luxury py-24 text-center">
        <div className="max-w-sm mx-auto">
          <div className="w-12 h-px mx-auto mb-8" style={{ backgroundColor: "#B9A77A" }} />
          <h1
            className="mb-4"
            style={{ fontFamily: "var(--font-cormorant)", fontSize: "2.25rem", fontWeight: 400, color: "#172744" }}
          >
            Order Confirmed
          </h1>
          <p className="mb-2" style={{ fontFamily: "var(--font-inter)", fontSize: "0.9375rem", color: "#242424", opacity: 0.7 }}>
            Thank you, {form.full_name.split(" ")[0]}.
          </p>
          <p className="mb-8 opacity-50" style={{ fontFamily: "var(--font-inter)", fontSize: "0.875rem" }}>
            Your order <strong>{orderNumber}</strong> has been placed. We will be in touch shortly.
          </p>
          <a
            href={`https://wa.me/919999999999?text=Hello%2C%20I%20just%20placed%20order%20${orderNumber}%20and%20would%20like%20to%20confirm.`}
            target="_blank"
            rel="noopener noreferrer"
            className="block w-full py-4 mb-3 transition-opacity hover:opacity-80"
            style={{ backgroundColor: "#172744", color: "#F8F6F0", fontFamily: "var(--font-inter)", fontSize: "0.6875rem", letterSpacing: "0.18em", textTransform: "uppercase" }}
          >
            CONFIRM VIA WHATSAPP
          </a>
          <button
            onClick={() => router.push("/")}
            className="block w-full py-4 border transition-colors hover:border-navy"
            style={{ borderColor: "#D8C8AF", fontFamily: "var(--font-inter)", fontSize: "0.6875rem", letterSpacing: "0.14em", textTransform: "uppercase" }}
          >
            CONTINUE SHOPPING
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="container-luxury py-12 md:py-16">
      <h1
        className="mb-10"
        style={{ fontFamily: "var(--font-cormorant)", fontSize: "clamp(1.75rem, 3vw, 2.5rem)", fontWeight: 400, color: "#172744" }}
      >
        Checkout
      </h1>

      <div className="flex flex-col lg:flex-row gap-12 lg:gap-16">
        {/* Left: Form */}
        <div className="flex-1 space-y-8">
          {/* Contact Details */}
          <div>
            <h2
              className="mb-5"
              style={{ fontFamily: "var(--font-inter)", fontSize: "0.6875rem", letterSpacing: "0.18em", textTransform: "uppercase", color: "#172744", fontWeight: 600 }}
            >
              CONTACT DETAILS
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label className="block mb-1.5" style={labelStyle}>Full Name *</label>
                <input type="text" value={form.full_name} onChange={(e) => update("full_name", e.target.value)} required className="w-full px-4 py-3 border outline-none bg-transparent" style={inputStyle} />
              </div>
              <div>
                <label className="block mb-1.5" style={labelStyle}>Email *</label>
                <input type="email" value={form.email} onChange={(e) => update("email", e.target.value)} required className="w-full px-4 py-3 border outline-none bg-transparent" style={inputStyle} />
              </div>
              <div>
                <label className="block mb-1.5" style={labelStyle}>Phone *</label>
                <input type="tel" value={form.phone} onChange={(e) => update("phone", e.target.value)} required className="w-full px-4 py-3 border outline-none bg-transparent" style={inputStyle} />
              </div>
            </div>
          </div>

          {/* Shipping Address */}
          <div>
            <h2
              className="mb-5"
              style={{ fontFamily: "var(--font-inter)", fontSize: "0.6875rem", letterSpacing: "0.18em", textTransform: "uppercase", color: "#172744", fontWeight: 600 }}
            >
              SHIPPING ADDRESS
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label className="block mb-1.5" style={labelStyle}>Address Line 1 *</label>
                <input type="text" value={form.address_line1} onChange={(e) => update("address_line1", e.target.value)} required className="w-full px-4 py-3 border outline-none bg-transparent" style={inputStyle} />
              </div>
              <div className="md:col-span-2">
                <label className="block mb-1.5" style={labelStyle}>Address Line 2</label>
                <input type="text" value={form.address_line2} onChange={(e) => update("address_line2", e.target.value)} className="w-full px-4 py-3 border outline-none bg-transparent" style={inputStyle} />
              </div>
              <div>
                <label className="block mb-1.5" style={labelStyle}>City *</label>
                <input type="text" value={form.city} onChange={(e) => update("city", e.target.value)} required className="w-full px-4 py-3 border outline-none bg-transparent" style={inputStyle} />
              </div>
              <div>
                <label className="block mb-1.5" style={labelStyle}>State</label>
                <input type="text" value={form.state} onChange={(e) => update("state", e.target.value)} className="w-full px-4 py-3 border outline-none bg-transparent" style={inputStyle} />
              </div>
              <div>
                <label className="block mb-1.5" style={labelStyle}>PIN Code *</label>
                <input type="text" value={form.postal_code} onChange={(e) => update("postal_code", e.target.value)} required className="w-full px-4 py-3 border outline-none bg-transparent" style={inputStyle} />
              </div>
              <div>
                <label className="block mb-1.5" style={labelStyle}>Country</label>
                <input type="text" value={form.country} onChange={(e) => update("country", e.target.value)} className="w-full px-4 py-3 border outline-none bg-transparent" style={inputStyle} />
              </div>
              <div className="md:col-span-2">
                <label className="block mb-1.5" style={labelStyle}>Order Notes (optional)</label>
                <textarea value={form.notes} onChange={(e) => update("notes", e.target.value)} rows={3} className="w-full px-4 py-3 border outline-none bg-transparent resize-none" style={inputStyle} />
              </div>
            </div>
          </div>

          {/* Payment Note */}
          <div
            className="flex items-center gap-3 p-4"
            style={{ backgroundColor: "#172744", color: "#D8C8AF" }}
          >
            <Lock size={14} />
            <p style={{ fontFamily: "var(--font-inter)", fontSize: "0.8125rem", fontWeight: 300, lineHeight: 1.6 }}>
              Payment is collected via bank transfer or UPI after order confirmation. We will contact you via WhatsApp with payment details.
            </p>
          </div>
        </div>

        {/* Right: Order Summary */}
        <div className="lg:w-80 flex-shrink-0">
          <div style={{ backgroundColor: "#F0EDE8", padding: "1.5rem", border: "1px solid #D8C8AF30" }}>
            <h2
              className="mb-5"
              style={{ fontFamily: "var(--font-inter)", fontSize: "0.6875rem", letterSpacing: "0.18em", textTransform: "uppercase", color: "#172744", fontWeight: 600 }}
            >
              YOUR ORDER
            </h2>
            <ul className="space-y-3 mb-5">
              {items.map((item) => (
                <li key={`${item.productId}-${item.variantId}`} className="flex gap-3">
                  <div className="relative w-12 h-16 flex-shrink-0 overflow-hidden" style={{ backgroundColor: "#D8C8AF20" }}>
                    {item.image && <Image src={item.image} alt={item.name} fill sizes="48px" className="object-cover" />}
                  </div>
                  <div className="flex-1">
                    <p style={{ fontFamily: "var(--font-inter)", fontSize: "0.8125rem", color: "#172744" }}>{item.name}</p>
                    <p className="opacity-50" style={{ fontFamily: "var(--font-inter)", fontSize: "0.75rem" }}>
                      {[item.colour, item.size, `×${item.quantity}`].filter(Boolean).join(" / ")}
                    </p>
                  </div>
                  <span style={{ fontFamily: "var(--font-inter)", fontSize: "0.875rem", color: "#172744" }}>
                    {formatPrice(item.price * item.quantity)}
                  </span>
                </li>
              ))}
            </ul>

            <div className="border-t pt-4 space-y-2 mb-5" style={{ borderColor: "#D8C8AF40" }}>
              <div className="flex justify-between">
                <span className="opacity-60" style={{ fontFamily: "var(--font-inter)", fontSize: "0.875rem" }}>Subtotal</span>
                <span style={{ fontFamily: "var(--font-inter)", fontSize: "0.875rem" }}>{formatPrice(subtotal)}</span>
              </div>
              <div className="flex justify-between">
                <span className="opacity-60" style={{ fontFamily: "var(--font-inter)", fontSize: "0.875rem" }}>Shipping</span>
                <span className="opacity-40" style={{ fontFamily: "var(--font-inter)", fontSize: "0.875rem" }}>Complimentary</span>
              </div>
              <div className="flex justify-between pt-2 border-t" style={{ borderColor: "#D8C8AF40" }}>
                <span style={{ fontFamily: "var(--font-inter)", fontSize: "0.9375rem", fontWeight: 500, color: "#172744" }}>Total</span>
                <span style={{ fontFamily: "var(--font-inter)", fontSize: "0.9375rem", fontWeight: 600, color: "#172744" }}>{formatPrice(subtotal)}</span>
              </div>
            </div>

            <button
              onClick={handlePlaceOrder}
              disabled={placing}
              className="flex items-center justify-center gap-2 w-full py-4 transition-opacity hover:opacity-90 disabled:opacity-50"
              style={{ backgroundColor: "#172744", color: "#F8F6F0", fontFamily: "var(--font-inter)", fontSize: "0.6875rem", letterSpacing: "0.18em", textTransform: "uppercase" }}
            >
              {placing ? "PLACING ORDER..." : "PLACE ORDER"} <ArrowRight size={14} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
