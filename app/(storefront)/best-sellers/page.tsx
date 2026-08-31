import { Metadata } from "next";
import { getPublishedProducts } from "@/lib/queries";
import ProductGrid from "@/components/storefront/ProductGrid";

export const metadata: Metadata = {
  title: "Best Sellers",
  description: "Our most coveted linen shirts and tailored pieces, celebrated for craftsmanship and effortless drape.",
};

export const revalidate = 1800;

export default async function BestSellersPage() {
  const products = await getPublishedProducts({ bestSeller: true, limit: 30 });

  return (
    <div className="container-luxury py-16 md:py-24">
      <div className="text-center mb-12">
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
          ICONS OF THE HOUSE
        </p>
        <h1
          style={{
            fontFamily: "var(--font-cormorant)",
            fontSize: "clamp(2rem, 4vw, 3rem)",
            fontWeight: 400,
            color: "#172744",
          }}
        >
          Best Sellers
        </h1>
      </div>

      <ProductGrid products={products} columns={4} />
    </div>
  );
}
