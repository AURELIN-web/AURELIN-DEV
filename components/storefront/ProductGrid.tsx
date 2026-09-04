import type { Product } from "@/types/database";
import ProductCard from "./ProductCard";
import AtelierCuriosityCard from "./AtelierCuriosityCard";

interface Props {
  products: Product[];
  columns?: 2 | 3 | 4;
}

export default function ProductGrid({ products, columns = 4 }: Props) {
  if (products.length === 0) {
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
