import { Suspense } from "react";
import { Metadata } from "next";
import { getPublishedProducts, getActiveCategories } from "@/lib/queries";
import ProductGrid from "@/components/storefront/ProductGrid";
import ShopFilters from "@/components/storefront/ShopFilters";

export const metadata: Metadata = {
  title: "Shop All — AURELIN & CO.",
  description: "Browse the complete AURELIN & CO. collection of premium menswear and luxury linen garments.",
};

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function ShopPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | undefined }>;
}) {
  const params = await searchParams;
  const [products, categories] = await Promise.all([
    getPublishedProducts({ limit: 48 }),
    getActiveCategories(),
  ]);

  return (
    <div className="container-luxury py-6 md:py-12">
      {/* Page Header */}
      <div className="text-center mb-6 md:mb-10 border-b border-[#D8C8AF40] pb-6 md:pb-8">
        <p
          className="mb-2 text-[#B9A77A] uppercase tracking-[0.2em] font-semibold"
          style={{
            fontFamily: "var(--font-inter)",
            fontSize: "0.625rem",
          }}
        >
          THE MAISON COLLECTION
        </p>
        <h1
          style={{
            fontFamily: "var(--font-cormorant)",
            fontSize: "clamp(1.875rem, 3.5vw, 2.75rem)",
            fontWeight: 400,
            color: "#172744",
            letterSpacing: "0.02em",
          }}
        >
          All Garments
        </h1>
        <p className="text-xs text-charcoal/50 mt-1 uppercase tracking-wider font-medium">
          {products.length === 0
            ? "Upcoming Seasonal Drop"
            : `${products.length} ${products.length === 1 ? "Piece" : "Pieces"} Available`}
        </p>
      </div>

      {/* Mobile Filter Bar & Popup Trigger */}
      <div className="md:hidden">
        <ShopFilters categories={categories} totalProducts={products.length} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 lg:grid-cols-5 gap-8 lg:gap-12 items-start">
        {/* Desktop Filters Sidebar (Hidden on mobile) */}
        <aside className="hidden md:block md:col-span-1 border-r border-[#D8C8AF30] md:pr-6">
          <ShopFilters categories={categories} totalProducts={products.length} />
        </aside>

        {/* Product Grid (Takes full width on mobile, 3-4 cols on desktop) */}
        <div className="col-span-1 md:col-span-3 lg:col-span-4">
          <Suspense fallback={<ProductGridSkeleton />}>
            <ProductGrid products={products} columns={3} />
          </Suspense>
        </div>
      </div>
    </div>
  );
}

function ProductGridSkeleton() {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-8">
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="animate-pulse space-y-3">
          <div className="aspect-[3/4] bg-[#D8C8AF]/20 rounded-xs" />
          <div className="h-4 bg-[#D8C8AF]/30 rounded w-3/4 mx-auto" />
          <div className="h-3 bg-[#D8C8AF]/20 rounded w-1/2 mx-auto" />
        </div>
      ))}
    </div>
  );
}
