import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: "AURELIN & CO. privacy policy and customer data handling standards.",
};

export default function PrivacyPolicyPage() {
  return (
    <div className="container-luxury py-16 md:py-24">
      <div className="max-w-2xl mx-auto space-y-8 text-charcoal opacity-80 leading-relaxed text-sm md:text-base" style={{ fontFamily: "var(--font-inter)" }}>
        <div className="text-center">
          <h1
            className="text-navy text-3xl md:text-4xl font-normal mb-2"
            style={{ fontFamily: "var(--font-cormorant)" }}
          >
            Privacy Policy
          </h1>
          <p className="text-xs opacity-50 uppercase tracking-widest">Last Updated: January 2026</p>
        </div>

        <section className="space-y-3">
          <h2 className="text-navy text-xl font-normal" style={{ fontFamily: "var(--font-cormorant)" }}>
            Information Collection
          </h2>
          <p>
            We collect personal information necessary to fulfill your orders, provide styling recommendations via WhatsApp, and ensure secure transactions. This includes name, delivery address, phone number, and order preferences.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-navy text-xl font-normal" style={{ fontFamily: "var(--font-cormorant)" }}>
            Data Protection
          </h2>
          <p>
            We will never sell or monetize your personal details. All information is handled with discretion in compliance with strict privacy standards and protected via row-level security.
          </p>
        </section>
      </div>
    </div>
  );
}
