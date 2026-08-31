import { Metadata } from "next";
import { getPublishedProducts } from "@/lib/queries";
import ProductGrid from "@/components/storefront/ProductGrid";

export const metadata: Metadata = {
  title: "New Arrivals",
  description: "Explore the latest additions to the AURELIN & CO. collection of quiet luxury menswear.",
};

export const revalidate = 1800;

export default async function NewArrivalsPage() {
  const products = await getPublishedProducts({ newArrival: true, limit: 30 });

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
          SEASONAL RELEASE
        </p>
        <h1
          style={{
            fontFamily: "var(--font-cormorant)",
            fontSize: "clamp(2rem, 4vw, 3rem)",
            fontWeight: 400,
            color: "#172744",
          }}
        >
          New Arrivals
        </h1>
      </div>

      <ProductGrid products={products} columns={4} />
    </div>
  );
}
