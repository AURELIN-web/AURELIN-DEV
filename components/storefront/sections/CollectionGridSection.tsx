import Link from "next/link";
import Image from "next/image";

interface CollectionTile {
  title: string;
  subtitle?: string;
  href: string;
  image: string | null;
  ctaText?: string;
}

interface Props {
  sectionTitle?: string;
  subtitle?: string;
  tiles: CollectionTile[];
}

export default function CollectionGridSection({ sectionTitle, subtitle, tiles }: Props) {
  return (
    <section className="py-16 md:py-20" style={{ backgroundColor: "#F8F6F0" }}>
      <div className="container-luxury">
        {/* Section Header */}
        <div className="text-center mb-10 md:mb-12">
          {sectionTitle && (
            <h2
              className="mb-3"
              style={{
                fontFamily: "var(--font-cormorant)",
                fontSize: "clamp(1.5rem, 3vw, 2rem)",
                fontWeight: 400,
                letterSpacing: "0.08em",
                color: "#172744",
              }}
            >
              {sectionTitle}
            </h2>
          )}
          {subtitle && (
            <p
              className="opacity-60"
              style={{
                fontFamily: "var(--font-inter)",
                fontSize: "0.875rem",
                fontWeight: 300,
                color: "#242424",
              }}
            >
              {subtitle}
            </p>
          )}
        </div>

        {/* Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 md:gap-3">
          {tiles.map((tile, i) => (
            <Link
              key={tile.href}
              href={tile.href}
              className="group relative overflow-hidden aspect-[3/4] block"
              aria-label={`${tile.title} collection`}
            >
              {tile.image ? (
                <Image
                  src={tile.image}
                  alt={tile.title}
                  fill
                  sizes="(max-width: 768px) 50vw, 25vw"
                  className="object-cover transition-transform duration-700 group-hover:scale-[1.04]"
                  priority={i < 2}
                />
              ) : (
                <div
                  className="absolute inset-0 flex items-center justify-center p-4"
                  style={{ backgroundColor: i % 2 === 0 ? "#172744" : "#101C32" }}
                >
                  <span
                    className="text-xs uppercase tracking-widest text-[#B9A77A]/60 text-center font-medium"
                    style={{ fontFamily: "var(--font-inter)" }}
                  >
                    {tile.title}
                  </span>
                </div>
              )}

              {/* Overlay */}
              <div className="absolute inset-0 bg-deep-navy/30 transition-opacity duration-300 group-hover:bg-deep-navy/45" />

              {/* Text */}
              <div className="absolute inset-0 flex flex-col items-center justify-end pb-8 px-4 text-center">
                <h3
                  className="text-ivory mb-1 leading-tight"
                  style={{
                    fontFamily: "var(--font-cormorant)",
                    fontSize: "clamp(1rem, 2.5vw, 1.375rem)",
                    fontWeight: 400,
                    letterSpacing: "0.04em",
                  }}
                >
                  {tile.title}
                </h3>
                <p
                  className="text-ivory/70 mb-3"
                  style={{
                    fontFamily: "var(--font-inter)",
                    fontSize: "0.6rem",
                    letterSpacing: "0.18em",
                    fontWeight: 400,
                    textTransform: "uppercase",
                  }}
                >
                  {tile.ctaText || "SHOP NOW"}
                </p>
                {/* Animated underline */}
                <div
                  className="h-px w-6 transition-all duration-300 group-hover:w-12"
                  style={{ backgroundColor: "#B9A77A" }}
                />
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
