import { Metadata } from "next";
import { SITE_URL } from "@/config/site";

export const metadata: Metadata = {
  title: "Our Story — A Modern Menswear House",
  description:
    "The story of AURELIN & CO. — a luxury menswear maison shaped by timeless silhouettes, pure European linen, and the belief that true elegance is never excessive. Founded in India.",
  keywords: [
    "AURELIN & CO. story", "luxury menswear brand India", "about Aurelin",
    "atelier menswear brand", "sustainable linen brand", "Indian luxury fashion brand",
  ],
  alternates: { canonical: `${SITE_URL}/about` },
  robots: { index: true, follow: true },
  openGraph: {
    type: "website",
    url: `${SITE_URL}/about`,
    title: "Our Story — AURELIN & CO.",
    description: "A luxury menswear maison shaped by timeless silhouettes and pure European linen.",
    siteName: "AURELIN & CO.",
    locale: "en_IN",
    images: [{ url: `${SITE_URL}/og-image.png`, width: 1200, height: 630, alt: "AURELIN & CO. — Our Story" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Our Story — AURELIN & CO.",
    description: "A luxury menswear maison shaped by timeless silhouettes and pure European linen.",
    images: [`${SITE_URL}/og-image.png`],
    site: "@aurelinco",
  },
};

export default function AboutPage() {
  return (
    <div>
      {/* Hero */}
      <div
        className="relative py-28 md:py-40 flex items-center justify-center text-center"
        style={{ backgroundColor: "#172744" }}
      >
        <div className="max-w-2xl px-6">
          <p
            className="mb-4"
            style={{ fontFamily: "var(--font-inter)", fontSize: "0.625rem", letterSpacing: "0.22em", textTransform: "uppercase", color: "#B9A77A" }}
          >
            OUR STORY
          </p>
          <h1
            style={{ fontFamily: "var(--font-cormorant)", fontSize: "clamp(2.5rem, 5vw, 4rem)", fontWeight: 400, color: "#F8F6F0", lineHeight: 1.1, letterSpacing: "-0.01em" }}
          >
            A Modern Menswear House
          </h1>
        </div>
      </div>

      {/* Story */}
      <div className="container-luxury py-20 md:py-28">
        <div className="max-w-2xl mx-auto">
          <div className="w-8 h-px mb-10" style={{ backgroundColor: "#B9A77A" }} />
          <p
            className="mb-8"
            style={{ fontFamily: "var(--font-cormorant)", fontSize: "clamp(1.25rem, 2.5vw, 1.625rem)", fontWeight: 400, lineHeight: 1.7, color: "#172744" }}
          >
            AURELIN & CO. was founded on a single conviction: that a man who dresses with intention carries himself differently.
          </p>
          <p
            className="mb-6 opacity-70"
            style={{ fontFamily: "var(--font-inter)", fontSize: "0.9375rem", fontWeight: 300, lineHeight: 1.9, color: "#242424" }}
          >
            We believe in the power of natural fabrics — linen that breathes, cotton that ages beautifully, fabrics that develop character with wear. Every piece in our collection is chosen for its ability to transcend seasons.
          </p>
          <p
            className="opacity-70"
            style={{ fontFamily: "var(--font-inter)", fontSize: "0.9375rem", fontWeight: 300, lineHeight: 1.9, color: "#242424" }}
          >
            The AURELIN man is not defined by fashion weeks or fleeting trends. He is defined by consistency, by quiet confidence, by the understanding that true style is never accidental.
          </p>
        </div>
      </div>

      {/* Pillars */}
      <div className="border-y py-16 md:py-20" style={{ borderColor: "#D8C8AF40", backgroundColor: "#F0EDE8" }}>
        <div className="container-luxury">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            {[
              { label: "NATURAL FABRICS", body: "We source only from mills that prioritize natural fibres — linen, cotton, wool. Nothing synthetic enters our collection." },
              { label: "CRAFTSMANSHIP", body: "Every stitch is considered. Every button placed with purpose. We work with skilled artisans who share our commitment to quality." },
              { label: "TIMELESSNESS", body: "We design for decades, not seasons. A shirt purchased today should still feel relevant ten years from now." },
            ].map(({ label, body }) => (
              <div key={label} className="text-center">
                <div className="w-8 h-px mx-auto mb-6" style={{ backgroundColor: "#B9A77A" }} />
                <h3
                  className="mb-4"
                  style={{ fontFamily: "var(--font-inter)", fontSize: "0.625rem", letterSpacing: "0.22em", textTransform: "uppercase", color: "#172744", fontWeight: 600 }}
                >
                  {label}
                </h3>
                <p
                  className="opacity-60"
                  style={{ fontFamily: "var(--font-inter)", fontSize: "0.875rem", lineHeight: 1.8, fontWeight: 300 }}
                >
                  {body}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
