import Link from "next/link";
import type { Product } from "@/types/database";
import ProductCard from "./ProductCard";
import AtelierCuriosityCard from "./AtelierCuriosityCard";

interface Props {
  products: Product[];
  columns?: 2 | 3 | 4;
  hasActiveFilter?: boolean;
  clearFiltersHref?: string;
}

export default function ProductGrid({
  products,
  columns = 4,
  hasActiveFilter = false,
  clearFiltersHref,
}: Props) {
  if (products.length === 0) {
    if (hasActiveFilter) {
      return (
        <div className="py-12 px-6 text-center border border-[#D8C8AF]/60 bg-[#FAF9F5] rounded-xs max-w-lg mx-auto my-6">
          <p
            className="text-[0.625rem] tracking-[0.2em] uppercase text-[#B9A77A] font-semibold mb-2"
            style={{ fontFamily: "var(--font-inter)" }}
          >
            FILTER REFINEMENT
          </p>
          <h3
            className="text-2xl font-normal text-[#172744] mb-3"
            style={{ fontFamily: "var(--font-cormorant)" }}
          >
            No Garments Found
          </h3>
          <p
            className="text-xs text-charcoal/70 mb-6 max-w-xs mx-auto leading-relaxed"
            style={{ fontFamily: "var(--font-inter)" }}
          >
            No pieces match your selected size or sort filter. Try selecting another size or reset your filters.
          </p>
          <Link
            href={clearFiltersHref || "/shop"}
            className="inline-flex items-center justify-center px-6 py-2.5 bg-[#172744] text-[#F8F6F0] text-xs font-semibold uppercase tracking-wider rounded-xs hover:bg-[#101C32] transition-colors"
            style={{ fontFamily: "var(--font-inter)" }}
          >
            Clear Active Filters
          </Link>
        </div>
      );
    }

    return (
      <div className="py-6">
        <AtelierCuriosityCard
          title="New Arrivals Will Be Added Soon"
          subtitle="Our atelier is currently handcrafting the upcoming seasonal release. Featuring pure European linen, bespoke textures, and relaxed silhouettes."
        />
      </div>
    );
  }

  const gridCols = {
    2: "grid-cols-2",
    3: "grid-cols-2 md:grid-cols-3",
    4: "grid-cols-2 md:grid-cols-3 lg:grid-cols-4",
  }[columns];

  return (
    <div className={`grid ${gridCols} gap-x-4 gap-y-8 md:gap-x-6 md:gap-y-12`}>
      {products.map((product, i) => (
        <ProductCard key={product.id} product={product} priority={i < 4} />
      ))}
    </div>
  );
}
