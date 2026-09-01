"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useCart } from "@/contexts/CartContext";
import { formatPrice } from "@/lib/utils/format";
import { buildWhatsAppOrderUrl } from "@/lib/utils/whatsapp";
import { createClient } from "@/utils/supabase/client";
import { toast } from "sonner";
import Image from "next/image";
import { ArrowRight, Lock, MessageCircle, CheckCircle2 } from "lucide-react";
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
  const [step, setStep] = useState<"details" | "confirmed">("details");
  const [orderNumber, setOrderNumber] = useState("");
  const [whatsappUrl, setWhatsappUrl] = useState("");
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
      toast.error("Please fill all required fields marked with *");
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

    try {
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

      // Build structured WhatsApp order URL
      const waUrl = buildWhatsAppOrderUrl({
        whatsappNumber: "919645032855",
        orderNumber: orderNum,
        customer: {
          fullName: form.full_name,
          phone: form.phone,
          email: form.email,
          addressLine1: form.address_line1,
          addressLine2: form.address_line2,
          city: form.city,
          state: form.state,
          postalCode: form.postal_code,
          country: form.country,
          notes: form.notes,
        },
        items: items.map((i) => ({
          name: i.name,
          colour: i.colour,
          size: i.size,
          quantity: i.quantity,
          price: i.price,
        })),
        subtotal,
        total: subtotal,
      });

      setOrderNumber(orderNum);
      setWhatsappUrl(waUrl);
      clearCart();
      setStep("confirmed");
      setPlacing(false);

      // Automatically redirect/open WhatsApp
      window.open(waUrl, "_blank", "noopener,noreferrer");
    } catch {
      toast.error("An unexpected error occurred. Please try again.");
      setPlacing(false);
    }
  };

  const inputStyle = {
    fontFamily: "var(--font-inter)",
    fontSize: "0.875rem",
    color: "#172744",
    borderColor: "#D8C8AF",
  };

  const labelStyle = {
    fontFamily: "var(--font-inter)",
    fontSize: "0.625rem",
    letterSpacing: "0.16em",
    textTransform: "uppercase" as const,
    color: "#172744",
    fontWeight: 600,
  };

  if (step === "confirmed") {
    return (
      <div className="container-luxury py-16 md:py-24 text-center">
        <div className="max-w-md mx-auto bg-white border border-[#D8C8AF] p-8 md:p-12 rounded-xs shadow-sm">
          <CheckCircle2 size={44} className="mx-auto text-emerald-600 mb-4" />
          <p
            className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#B9A77A] mb-1"
            style={{ fontFamily: "var(--font-inter)" }}
          >
            ORDER PLACED SUCCESSFULLY
          </p>
          <h1
            className="mb-3"
            style={{ fontFamily: "var(--font-cormorant)", fontSize: "2.25rem", fontWeight: 400, color: "#172744" }}
          >
            Thank you, {form.full_name.split(" ")[0]}
          </h1>
          <p className="mb-2 text-xs text-charcoal/80" style={{ fontFamily: "var(--font-inter)" }}>
            Your bespoke order reference is <strong className="text-[#172744] font-semibold">{orderNumber}</strong>.
          </p>
          <p className="mb-8 text-xs text-charcoal/60 leading-relaxed" style={{ fontFamily: "var(--font-inter)" }}>
            We have prepared your order details and delivery address. Click below to continue on WhatsApp with our concierge to confirm payment and tailoring.
          </p>

          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2.5 w-full py-4 mb-3 bg-[#172744] hover:bg-[#101C32] text-[#F8F6F0] transition-colors rounded-xs shadow-md"
            style={{ fontFamily: "var(--font-inter)", fontSize: "0.75rem", letterSpacing: "0.18em", textTransform: "uppercase", fontWeight: 600 }}
          >
            <MessageCircle size={16} /> Open WhatsApp Order (+91 96450 32855)
          </a>

          <button
            onClick={() => router.push("/")}
            className="block w-full py-3.5 border border-[#D8C8AF] hover:border-[#172744] text-[#172744] text-xs font-semibold uppercase tracking-wider rounded-xs transition-colors"
            style={{ fontFamily: "var(--font-inter)" }}
          >
            Continue Shopping
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="container-luxury py-10 md:py-16">
      <div className="border-b border-[#D8C8AF40] pb-6 mb-10">
        <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#B9A77A] mb-1">
          AURELIN & CO. MAISON
        </p>
        <h1
          style={{ fontFamily: "var(--font-cormorant)", fontSize: "clamp(2rem, 3.5vw, 2.75rem)", fontWeight: 400, color: "#172744" }}
        >
          Bespoke Checkout
        </h1>
        <p className="text-xs text-charcoal/60 mt-1">
          Enter your delivery details below to place your order directly via WhatsApp concierge.
        </p>
      </div>

      <div className="flex flex-col lg:flex-row gap-10 lg:gap-14 items-start">
        {/* Left: Form */}
        <div className="flex-1 w-full space-y-8">
          {/* Contact Details */}
          <div className="bg-white border border-[#D8C8AF] p-6 md:p-8 rounded-xs space-y-5 shadow-2xs">
            <h2
              className="text-xs font-bold uppercase tracking-[0.18em] text-[#172744] pb-3 border-b border-[#D8C8AF30]"
              style={{ fontFamily: "var(--font-inter)" }}
            >
              1. Contact Information
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label className="block mb-1.5" style={labelStyle}>Full Name *</label>
                <input
                  type="text"
                  placeholder="e.g. Rahul Sharma"
                  value={form.full_name}
                  onChange={(e) => update("full_name", e.target.value)}
                  required
                  className="w-full px-4 py-3 border rounded-xs outline-none bg-[#F8F6F0]/30 focus:bg-white focus:border-[#172744] transition-colors"
                  style={inputStyle}
                />
              </div>
              <div>
                <label className="block mb-1.5" style={labelStyle}>Email Address *</label>
                <input
                  type="email"
                  placeholder="rahul@example.com"
                  value={form.email}
                  onChange={(e) => update("email", e.target.value)}
                  required
                  className="w-full px-4 py-3 border rounded-xs outline-none bg-[#F8F6F0]/30 focus:bg-white focus:border-[#172744] transition-colors"
                  style={inputStyle}
                />
              </div>
              <div>
                <label className="block mb-1.5" style={labelStyle}>Phone / WhatsApp Number *</label>
                <input
                  type="tel"
                  placeholder="+91 98765 43210"
                  value={form.phone}
                  onChange={(e) => update("phone", e.target.value)}
                  required
                  className="w-full px-4 py-3 border rounded-xs outline-none bg-[#F8F6F0]/30 focus:bg-white focus:border-[#172744] transition-colors"
                  style={inputStyle}
                />
              </div>
            </div>
          </div>

          {/* Shipping Address */}
          <div className="bg-white border border-[#D8C8AF] p-6 md:p-8 rounded-xs space-y-5 shadow-2xs">
            <h2
              className="text-xs font-bold uppercase tracking-[0.18em] text-[#172744] pb-3 border-b border-[#D8C8AF30]"
              style={{ fontFamily: "var(--font-inter)" }}
            >
              2. Delivery Address
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label className="block mb-1.5" style={labelStyle}>Street Address / Flat / Villa *</label>
                <input
                  type="text"
                  placeholder="Apartment 4B, Heritage Enclave, MG Road"
                  value={form.address_line1}
                  onChange={(e) => update("address_line1", e.target.value)}
                  required
                  className="w-full px-4 py-3 border rounded-xs outline-none bg-[#F8F6F0]/30 focus:bg-white focus:border-[#172744] transition-colors"
                  style={inputStyle}
                />
              </div>
              <div className="md:col-span-2">
                <label className="block mb-1.5" style={labelStyle}>Landmark / Area (Optional)</label>
                <input
                  type="text"
                  placeholder="Near Central Mall"
                  value={form.address_line2}
                  onChange={(e) => update("address_line2", e.target.value)}
                  className="w-full px-4 py-3 border rounded-xs outline-none bg-[#F8F6F0]/30 focus:bg-white focus:border-[#172744] transition-colors"
                  style={inputStyle}
                />
              </div>
              <div>
                <label className="block mb-1.5" style={labelStyle}>City *</label>
                <input
                  type="text"
                  placeholder="Bengaluru"
                  value={form.city}
                  onChange={(e) => update("city", e.target.value)}
                  required
                  className="w-full px-4 py-3 border rounded-xs outline-none bg-[#F8F6F0]/30 focus:bg-white focus:border-[#172744] transition-colors"
                  style={inputStyle}
                />
              </div>
              <div>
                <label className="block mb-1.5" style={labelStyle}>State</label>
                <input
                  type="text"
                  placeholder="Karnataka"
                  value={form.state}
                  onChange={(e) => update("state", e.target.value)}
                  className="w-full px-4 py-3 border rounded-xs outline-none bg-[#F8F6F0]/30 focus:bg-white focus:border-[#172744] transition-colors"
                  style={inputStyle}
                />
              </div>
              <div>
                <label className="block mb-1.5" style={labelStyle}>PIN Code *</label>
                <input
                  type="text"
                  placeholder="560001"
                  value={form.postal_code}
                  onChange={(e) => update("postal_code", e.target.value)}
                  required
                  className="w-full px-4 py-3 border rounded-xs outline-none bg-[#F8F6F0]/30 focus:bg-white focus:border-[#172744] transition-colors"
                  style={inputStyle}
                />
              </div>
              <div>
                <label className="block mb-1.5" style={labelStyle}>Country</label>
                <input
                  type="text"
                  value={form.country}
                  onChange={(e) => update("country", e.target.value)}
                  className="w-full px-4 py-3 border rounded-xs outline-none bg-[#F8F6F0]/30 focus:bg-white focus:border-[#172744] transition-colors"
                  style={inputStyle}
                />
              </div>
              <div className="md:col-span-2">
                <label className="block mb-1.5" style={labelStyle}>Tailoring or Delivery Notes (Optional)</label>
                <textarea
                  placeholder="Any custom fit preferences or delivery timing notes..."
                  value={form.notes}
                  onChange={(e) => update("notes", e.target.value)}
                  rows={2}
                  className="w-full px-4 py-3 border rounded-xs outline-none bg-[#F8F6F0]/30 focus:bg-white focus:border-[#172744] transition-colors resize-none"
                  style={inputStyle}
                />
              </div>
            </div>
          </div>

          {/* Concierge Note */}
          <div className="flex items-center gap-3.5 p-4 bg-[#172744] text-[#F8F6F0] rounded-xs shadow-xs">
            <Lock size={16} className="text-[#B9A77A] flex-shrink-0" />
            <p className="text-xs font-light leading-relaxed">
              Upon placing this order, your details and garment selections will be sent directly to our WhatsApp Concierge (<strong>+91 96450 32855</strong>) for payment confirmation and tracking.
            </p>
          </div>
        </div>

        {/* Right: Order Summary */}
        <div className="lg:w-96 flex-shrink-0 w-full lg:sticky lg:top-24">
          <div className="bg-white border border-[#D8C8AF] p-6 rounded-xs shadow-sm space-y-5">
            <h2
              className="text-xs font-bold uppercase tracking-[0.18em] text-[#172744] pb-3 border-b border-[#D8C8AF30]"
              style={{ fontFamily: "var(--font-inter)" }}
            >
              Order Summary ({items.length})
            </h2>

            <ul className="divide-y divide-[#D8C8AF20] max-h-72 overflow-y-auto space-y-3 pr-1">
              {items.map((item) => (
                <li key={`${item.productId}-${item.variantId}`} className="pt-3 first:pt-0 flex gap-3.5">
                  <div className="relative w-14 h-18 bg-[#F8F6F0] rounded-xs overflow-hidden flex-shrink-0 border border-[#D8C8AF]/60">
                    {item.image && (
                      <Image src={item.image} alt={item.name} fill sizes="56px" className="object-cover" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-[#172744] truncate">{item.name}</p>
                    <p className="text-[11px] text-charcoal/60 mt-0.5">
                      {[item.size ? `Size: ${item.size}` : null, item.colour ? `Colour: ${item.colour}` : null].filter(Boolean).join(" • ")}
                    </p>
                    <p className="text-[11px] text-charcoal/50 mt-0.5">
                      Qty: {item.quantity} × {formatPrice(item.price)}
                    </p>
                  </div>
                  <span className="text-xs font-semibold text-[#172744] flex-shrink-0">
                    {formatPrice(item.price * item.quantity)}
                  </span>
                </li>
              ))}
            </ul>

            <div className="border-t border-[#D8C8AF40] pt-4 space-y-2 text-xs">
              <div className="flex justify-between text-charcoal/70">
                <span>Subtotal</span>
                <span className="font-medium text-[#172744]">{formatPrice(subtotal)}</span>
              </div>
              <div className="flex justify-between text-charcoal/70">
                <span>Shipping</span>
                <span className="text-emerald-700 font-semibold">Complimentary</span>
              </div>
              <div className="flex justify-between pt-3 border-t border-[#D8C8AF40] text-sm font-semibold text-[#172744]">
                <span>Total Amount</span>
                <span>{formatPrice(subtotal)}</span>
              </div>
            </div>

            <button
              type="button"
              onClick={handlePlaceOrder}
              disabled={placing}
              className="w-full py-4 bg-[#172744] hover:bg-[#101C32] text-[#F8F6F0] flex items-center justify-center gap-2.5 text-xs font-semibold uppercase tracking-[0.18em] rounded-xs shadow-md transition-all disabled:opacity-50"
            >
              {placing ? (
                "Processing Order..."
              ) : (
                <>
                  <MessageCircle size={16} /> Place Order via WhatsApp <ArrowRight size={14} />
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
