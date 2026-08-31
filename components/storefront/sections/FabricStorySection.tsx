import Image from "next/image";
import Link from "next/link";

interface Props {
  eyebrow?: string;
  heading?: string;
  body?: string;
  ctaText?: string;
  ctaUrl?: string;
  fabricImageUrl?: string | null;
}

export default function FabricStorySection({
  eyebrow = "OUR FABRICS",
  heading = "THE LANGUAGE\nOF LINEN",
  body = "Natural texture.\nEffortless movement.\nDesigned for warm days\nand refined moments.",
  ctaText = "DISCOVER OUR FABRICS →",
  ctaUrl = "/care-guide",
  fabricImageUrl = null,
}: Props) {
  return (
    <section className="flex flex-col md:flex-row" aria-label="Fabric story">
      {/* Left: Navy text panel */}
      <div
        className="flex-1 flex flex-col justify-center px-10 md:px-16 lg:px-20 py-20 md:py-24"
        style={{ backgroundColor: "#172744" }}
      >
        {/* Eyebrow */}
        <p
          className="mb-6"
          style={{
            fontFamily: "var(--font-inter)",
            fontSize: "0.625rem",
            letterSpacing: "0.22em",
            fontWeight: 400,
            textTransform: "uppercase",
            color: "#B9A77A",
          }}
        >
          {eyebrow}
        </p>

        {/* Champagne rule */}
        <div className="mb-6 w-8 h-px" style={{ backgroundColor: "#B9A77A" }} />

        {/* Heading */}
        <h2
          className="mb-8"
          style={{
            fontFamily: "var(--font-cormorant)",
            fontSize: "clamp(2rem, 4vw, 3rem)",
            fontWeight: 400,
            letterSpacing: "-0.01em",
            lineHeight: 1.1,
            color: "#F8F6F0",
            whiteSpace: "pre-line",
          }}
        >
          {heading}
        </h2>

        {/* Body */}
        <p
          className="mb-10"
          style={{
            fontFamily: "var(--font-inter)",
            fontSize: "0.9375rem",
            fontWeight: 300,
            lineHeight: 1.9,
            color: "#D8C8AF",
            whiteSpace: "pre-line",
          }}
        >
          {body}
        </p>

        {/* CTA */}
        <Link
          href={ctaUrl}
          className="inline-flex items-center gap-2 transition-opacity hover:opacity-70"
          style={{
            fontFamily: "var(--font-inter)",
            fontSize: "0.6875rem",
            letterSpacing: "0.18em",
            fontWeight: 500,
            textTransform: "uppercase",
            color: "#B9A77A",
          }}
        >
          {ctaText}
        </Link>
      </div>

      {/* Right: Fabric image */}
      <div className="flex-1 relative min-h-[320px] md:min-h-[480px]" style={{ backgroundColor: "#D8C8AF" }}>
        {fabricImageUrl ? (
          <Image
            src={fabricImageUrl}
            alt="AURELIN linen fabric close-up"
            fill
            sizes="(max-width: 768px) 100vw, 50vw"
            className="object-cover"
          />
        ) : (
          <div
            className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center"
            style={{ backgroundColor: "#D8C8AF" }}
          >
            <span
              className="text-[10px] uppercase tracking-widest text-[#172744]/40 font-semibold"
              style={{ fontFamily: "var(--font-inter)" }}
            >
              FABRIC ATELIER
            </span>
          </div>
        )}
      </div>
    </section>
  );
}
