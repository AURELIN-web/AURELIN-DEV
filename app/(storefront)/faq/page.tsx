import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Frequently Asked Questions",
  description: "Answers to common questions about AURELIN & CO. garments, sizing, ordering, and delivery.",
};

const faqs = [
  {
    q: "What fabrics do you use in your collections?",
    a: "We exclusively use high-grade natural fabrics, predominantly European flax linen, fine organic cottons, and blended natural weaves designed for breathability and timeless texture.",
  },
  {
    q: "How does the 'Order via WhatsApp' concierge work?",
    a: "When you click 'Order via WhatsApp' on any product page, our concierge pre-fills your selected size, colour, and garment choice in a direct message. Our team assists you with sizing recommendations, custom styling, and seamless checkout confirmation.",
  },
  {
    q: "How long does shipping take?",
    a: "Standard domestic deliveries typically arrive within 4 to 7 business days. Express shipping options are also available during checkout.",
  },
  {
    q: "What is your exchange and return policy?",
    a: "We offer complimentary size exchanges and returns within 30 days of delivery for all unworn garments with original tags intact.",
  },
  {
    q: "How should I care for my linen garments?",
    a: "We recommend gentle cold hand washing or machine washing on a delicate cycle with mild detergent. Hang to dry in shade and iron while slightly damp for the crispest drape.",
  },
];

export default function FAQPage() {
  return (
    <div className="container-luxury py-16 md:py-24">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-14">
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
            CLIENT ASSISTANCE
          </p>
          <h1
            style={{
              fontFamily: "var(--font-cormorant)",
              fontSize: "clamp(2rem, 4vw, 3rem)",
              fontWeight: 400,
              color: "#172744",
            }}
          >
            Frequently Asked Questions
          </h1>
        </div>

        <div className="divide-y divide-beige/40">
          {faqs.map((faq, i) => (
            <div key={i} className="py-6">
              <h2
                className="text-navy text-lg md:text-xl font-normal mb-3"
                style={{ fontFamily: "var(--font-cormorant)" }}
              >
                {faq.q}
              </h2>
              <p
                className="opacity-70 text-sm md:text-base leading-relaxed"
                style={{ fontFamily: "var(--font-inter)" }}
              >
                {faq.a}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
