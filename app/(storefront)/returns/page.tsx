import { Metadata } from "next";
import { SITE_URL } from "@/config/site";

export const metadata: Metadata = {
  title: "Exchanges & Returns — 7-Day Hassle-Free Policy",
  description: "AURELIN & CO. exchange and returns policy — easy 7-day returns on unworn garments, free return shipping, and dedicated WhatsApp support for exchanges.",
  keywords: ["AURELIN returns", "exchange policy luxury menswear", "7-day return India", "AURELIN refund"],
  alternates: { canonical: `${SITE_URL}/returns` },
  robots: { index: true, follow: true },
  openGraph: { type: "website", url: `${SITE_URL}/returns`, title: "Exchanges & Returns | AURELIN & CO.", description: "Easy 7-day returns. Free return shipping. WhatsApp exchange support.", siteName: "AURELIN & CO.", locale: "en_IN" },
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
