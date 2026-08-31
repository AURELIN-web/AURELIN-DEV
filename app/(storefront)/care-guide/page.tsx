import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Garment Care Guide",
  description: "Preserve the drape, texture, and lifespan of your natural linen and cotton garments.",
};

export default function CareGuidePage() {
  return (
    <div className="container-luxury py-16 md:py-24">
      <div className="max-w-2xl mx-auto space-y-12">
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
            PRESERVING CRAFT
          </p>
          <h1
            style={{
              fontFamily: "var(--font-cormorant)",
              fontSize: "clamp(2rem, 4vw, 3rem)",
              fontWeight: 400,
              color: "#172744",
            }}
          >
            Fabric Care Guide
          </h1>
        </div>

        <div className="space-y-8 text-charcoal opacity-80 leading-relaxed text-sm md:text-base" style={{ fontFamily: "var(--font-inter)" }}>
          <section className="p-6 border border-beige/40 bg-ivory">
            <h2 className="text-navy text-2xl font-normal mb-3" style={{ fontFamily: "var(--font-cormorant)" }}>
              Pure Linen Care
            </h2>
            <ul className="space-y-2 list-disc pl-5 opacity-90">
              <li>Wash in cold or lukewarm water (30°C max) using a gentle cycle or by hand.</li>
              <li>Always choose a mild, bleach-free detergent to protect the natural flax fibers.</li>
              <li>Avoid tumble drying; air dry flat or hung in shade away from harsh direct sunlight.</li>
              <li>Iron while slightly damp on medium-high heat for a crisp press, or embrace the natural casual rumple.</li>
            </ul>
          </section>

          <section className="p-6 border border-beige/40 bg-ivory">
            <h2 className="text-navy text-2xl font-normal mb-3" style={{ fontFamily: "var(--font-cormorant)" }}>
              Fine Cotton & Twill
            </h2>
            <ul className="space-y-2 list-disc pl-5 opacity-90">
              <li>Button shirts fully before washing to maintain collar and cuff shape.</li>
              <li>Wash with similar subtle tones (whites, creams, and navies separated).</li>
              <li>Warm iron with light steam for a sharp, refined drape.</li>
            </ul>
          </section>
        </div>
      </div>
    </div>
  );
}
