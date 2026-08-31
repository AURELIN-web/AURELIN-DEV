import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Exchanges & Returns",
  description: "Our 30-day exchange and returns policy for AURELIN & CO. garments.",
};

export default function ReturnsPage() {
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
            GUARANTEE OF SATISFACTION
          </p>
          <h1
            style={{
              fontFamily: "var(--font-cormorant)",
              fontSize: "clamp(2rem, 4vw, 3rem)",
              fontWeight: 400,
              color: "#172744",
            }}
          >
            Exchanges & Returns
          </h1>
        </div>

        <div className="space-y-6 text-charcoal opacity-80 leading-relaxed text-sm md:text-base" style={{ fontFamily: "var(--font-inter)" }}>
          <section>
            <h2 className="text-navy text-xl font-normal mb-2" style={{ fontFamily: "var(--font-cormorant)" }}>
              30-Day Effortless Exchanges
            </h2>
            <p>
              If a size does not fit exactly to your liking, we offer immediate size exchanges. Simply message our WhatsApp concierge or contact our support team with your order number.
            </p>
          </section>

          <section>
            <h2 className="text-navy text-xl font-normal mb-2" style={{ fontFamily: "var(--font-cormorant)" }}>
              Return Eligibility
            </h2>
            <p>
              Items must be unworn, unwashed, and returned in their original packaging with all garment tags intact. Returns are accepted within 30 days of the delivery date.
            </p>
          </section>

          <section>
            <h2 className="text-navy text-xl font-normal mb-2" style={{ fontFamily: "var(--font-cormorant)" }}>
              Refund Process
            </h2>
            <p>
              Once your returned garment is inspected at our facility, refunds are processed back to your original payment method or bank account within 3–5 working days.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
