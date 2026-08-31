import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Shipping & Delivery",
  description: "Information regarding AURELIN & CO. shipping times, domestic and international delivery options.",
};

export default function ShippingPage() {
  return (
    <div className="container-luxury py-16 md:py-24">
      <div className="max-w-2xl mx-auto space-y-10">
        <div className="text-center">
          <p
            className="mb-3"
            style={{
              fontFamily: "var(--font-inter)",
              fontSize: "0.625rem",
              letterSpacing: "0.22em",
              textTransform: "uppercase",
              color: "#B9A77A",
            }}
          >
            DISPATCH & DELIVERY
          </p>
          <h1
            style={{
              fontFamily: "var(--font-cormorant)",
              fontSize: "clamp(2rem, 4vw, 3rem)",
              fontWeight: 400,
              color: "#172744",
            }}
          >
            Shipping Policy
          </h1>
        </div>

        <div className="space-y-6 text-charcoal opacity-80 leading-relaxed text-sm md:text-base" style={{ fontFamily: "var(--font-inter)" }}>
          <section>
            <h2 className="text-navy text-xl font-normal mb-2" style={{ fontFamily: "var(--font-cormorant)" }}>
              Complimentary Standard Shipping
            </h2>
            <p>
              We provide complimentary express ground shipping on all orders nationwide. Orders are dispatched from our atelier within 24 to 48 hours of order confirmation.
            </p>
          </section>

          <section>
            <h2 className="text-navy text-xl font-normal mb-2" style={{ fontFamily: "var(--font-cormorant)" }}>
              Delivery Timelines
            </h2>
            <p>
              Metro cities generally receive orders within 3–5 business days. Non-metro locations and remote areas take between 5–7 business days. You will receive a tracking link via SMS/Email as soon as your parcel is handed to the courier.
            </p>
          </section>

          <section>
            <h2 className="text-navy text-xl font-normal mb-2" style={{ fontFamily: "var(--font-cormorant)" }}>
              Packaging
            </h2>
            <p>
              Every AURELIN piece is hand-checked, tissue-wrapped, and delivered in our signature rigid matte ivory keepsake box, ensuring the garment arrives in pristine presentation.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
