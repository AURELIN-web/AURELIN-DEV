interface TrustFeature {
  title: string;
  description?: string;
}

interface Props {
  features?: TrustFeature[];
}

const defaultFeatures: TrustFeature[] = [
  { title: "PREMIUM NATURAL FABRICS", description: "Sourced from the finest mills across Europe" },
  { title: "CRAFTSMANSHIP", description: "Meticulous attention to detail in every stitch" },
  { title: "EASY EXCHANGES", description: "Hassle-free returns & exchanges within 30 days" },
  { title: "WHATSAPP CONCIERGE", description: "Personal styling assistance at your fingertips" },
];

export default function TrustFeaturesSection({ features = defaultFeatures }: Props) {
  return (
    <section
      className="py-14 md:py-16 border-y"
      style={{ backgroundColor: "#F8F6F0", borderColor: "#D8C8AF40" }}
      aria-label="Our commitments"
    >
      <div className="container-luxury">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-4">
          {features.map((feature, i) => (
            <div
              key={i}
              className="flex flex-col items-center text-center gap-4"
            >
              {/* Minimal geometric mark instead of icon */}
              <div
                className="w-6 h-px flex-shrink-0 mt-1"
                style={{ backgroundColor: "#B9A77A" }}
              />

              <div>
                <h3
                  className="mb-2"
                  style={{
                    fontFamily: "var(--font-inter)",
                    fontSize: "0.6rem",
                    fontWeight: 600,
                    letterSpacing: "0.2em",
                    textTransform: "uppercase",
                    color: "#172744",
                  }}
                >
                  {feature.title}
                </h3>
                {feature.description && (
                  <p
                    style={{
                      fontFamily: "var(--font-inter)",
                      fontSize: "0.75rem",
                      fontWeight: 300,
                      lineHeight: 1.7,
                      color: "#242424",
                      opacity: 0.6,
                    }}
                  >
                    {feature.description}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
