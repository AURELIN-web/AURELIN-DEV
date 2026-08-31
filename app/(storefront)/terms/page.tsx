import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Terms & Conditions",
  description: "Terms and conditions governing purchases and usage of AURELIN & CO. services.",
};

export default function TermsPage() {
  return (
    <div className="container-luxury py-16 md:py-24">
      <div className="max-w-2xl mx-auto space-y-8 text-charcoal opacity-80 leading-relaxed text-sm md:text-base" style={{ fontFamily: "var(--font-inter)" }}>
        <div className="text-center">
          <h1
            className="text-navy text-3xl md:text-4xl font-normal mb-2"
            style={{ fontFamily: "var(--font-cormorant)" }}
          >
            Terms & Conditions
          </h1>
          <p className="text-xs opacity-50 uppercase tracking-widest">AURELIN & CO. · Maison De L&apos;Homme</p>
        </div>

        <section className="space-y-3">
          <h2 className="text-navy text-xl font-normal" style={{ fontFamily: "var(--font-cormorant)" }}>
            Orders & Confirmation
          </h2>
          <p>
            By placing an order via our online checkout or through our WhatsApp concierge, you confirm that your provided contact details and delivery addresses are accurate.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-navy text-xl font-normal" style={{ fontFamily: "var(--font-cormorant)" }}>
            Product Integrity & Variations
          </h2>
          <p>
            Due to the natural characteristics of European flax linen and organic cotton, slight slub variations and weave textures are inherent features that enhance the character of each garment.
          </p>
        </section>
      </div>
    </div>
  );
}
