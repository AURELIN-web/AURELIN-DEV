import Link from "next/link";
import ProductCard from "../ProductCard";
import AtelierCuriosityCard from "../AtelierCuriosityCard";
import type { Product } from "@/types/database";

interface Props {
  title?: string;
  products: Product[];
  ctaText?: string;
  ctaUrl?: string;
}

export default function SignaturePiecesSection({
  title = "SIGNATURE PIECES",
  products,
  ctaText = "VIEW ALL",
  ctaUrl = "/shop",
}: Props) {
  const hasProducts = products && products.length > 0;

  return (
    <section className="py-16 md:py-20" style={{ backgroundColor: "#F8F6F0" }}>
      <div className="container-luxury">
        {/* Section Header */}
        <div
          className="flex items-center justify-between mb-8 md:mb-10 border-b pb-4"
          style={{ borderColor: "#D8C8AF40" }}
        >
          <div>
            <h2
              style={{
                fontFamily: "var(--font-cormorant)",
                fontSize: "clamp(1.25rem, 2.5vw, 1.75rem)",
                fontWeight: 400,
                letterSpacing: "0.1em",
                color: "#172744",
              }}
            >
              {title}
            </h2>
            {/* Champagne accent line */}
            <div className="mt-1.5 h-px w-10" style={{ backgroundColor: "#B9A77A" }} />
          </div>

          {hasProducts ? (
            <Link
              href={ctaUrl}
              className="label-uppercase text-charcoal hover:text-navy transition-colors underline-hover"
              style={{ fontSize: "0.625rem", letterSpacing: "0.16em" }}
            >
              {ctaText}
            </Link>
          ) : (
            <span
              className="label-uppercase text-[#B9A77A] font-semibold"
              style={{ fontSize: "0.625rem", letterSpacing: "0.2em" }}
            >
              SEASONAL EDIT
            </span>
          )}
        </div>

        {/* Product Grid or Premium Curiosity State */}
        {hasProducts ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-4 gap-y-8 md:gap-x-6">
            {products.slice(0, 4).map((product, i) => (
              <ProductCard key={product.id} product={product} priority={i < 2} />
            ))}
          </div>
        ) : (
          <AtelierCuriosityCard
            title="New Arrivals Will Be Added Soon"
            subtitle="Our master artisans are currently tailoring our upcoming seasonal edit. Crafted from pure European flax with relaxed silhouettes and artisanal finishes — releasing shortly."
          />
        )}
      </div>
    </section>
  );
}
