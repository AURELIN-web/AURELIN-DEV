import type { Product } from "@/types/database";
import ProductCard from "./ProductCard";

interface Props {
  products: Product[];
  columns?: 2 | 3 | 4;
}

export default function ProductGrid({ products, columns = 4 }: Props) {
  if (products.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-4 text-center">
        <p
          style={{
            fontFamily: "var(--font-cormorant)",
            fontSize: "1.5rem",
            fontWeight: 400,
            color: "#172744",
          }}
        >
          No products found
        </p>
        <p
          style={{
            fontFamily: "var(--font-inter)",
            fontSize: "0.875rem",
            color: "#242424",
            opacity: 0.5,
          }}
        >
          Check back soon for new arrivals.
        </p>
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
