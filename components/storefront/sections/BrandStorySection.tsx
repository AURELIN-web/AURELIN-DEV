import Image from "next/image";
import Link from "next/link";

interface Props {
  heading?: string;
  body?: string;
  ctaText?: string;
  ctaUrl?: string;
  imageUrl?: string | null;
}

export default function BrandStorySection({
  heading = "DRESS WITH CHARACTER",
  body = "Style is not about being noticed.\nIt is about being remembered.",
  ctaText = "EXPLORE AURELIN →",
  ctaUrl = "/about",
  imageUrl = null,
}: Props) {
  return (
    <section
      className="relative flex flex-col md:flex-row"
      style={{ backgroundColor: "#F8F6F0" }}
      aria-label="Brand story"
    >
      {/* Left: Image */}
      <div
        className="flex-1 relative min-h-[320px] md:min-h-[480px] order-2 md:order-1"
        style={{ backgroundColor: "#D8C8AF50" }}
      >
        {imageUrl ? (
          <Image
            src={imageUrl}
            alt="AURELIN brand story"
            fill
            sizes="(max-width: 768px) 100vw, 50vw"
            className="object-cover"
          />
        ) : (
          <div
            className="absolute inset-0 flex items-center justify-center p-6 text-center"
            style={{ backgroundColor: "#E8E0D0" }}
          >
            <span
              className="text-[10px] uppercase tracking-widest text-[#172744]/40 font-semibold"
              style={{ fontFamily: "var(--font-inter)" }}
            >
              MAISON PHILOSOPHY
            </span>
          </div>
        )}
      </div>

      {/* Right: Text */}
      <div
        className="flex-1 flex flex-col justify-center px-10 md:px-16 lg:px-20 py-20 md:py-24 order-1 md:order-2"
        style={{ backgroundColor: "#F8F6F0" }}
      >
        <h2
          className="mb-6"
          style={{
            fontFamily: "var(--font-cormorant)",
            fontSize: "clamp(1.75rem, 4vw, 3rem)",
            fontWeight: 400,
            letterSpacing: "0.04em",
            color: "#172744",
          }}
        >
          {heading}
        </h2>

        <p
          className="mb-10"
          style={{
            fontFamily: "var(--font-inter)",
            fontSize: "0.9375rem",
            fontWeight: 300,
            lineHeight: 1.9,
            color: "#242424",
            opacity: 0.7,
            whiteSpace: "pre-line",
          }}
        >
          {body}
        </p>

        <Link
          href={ctaUrl}
          className="inline-flex items-center gap-2 transition-opacity hover:opacity-60"
          style={{
            fontFamily: "var(--font-inter)",
            fontSize: "0.6875rem",
            letterSpacing: "0.18em",
            fontWeight: 500,
            textTransform: "uppercase",
            color: "#172744",
          }}
        >
          {ctaText}
        </Link>
      </div>
    </section>
  );
}
