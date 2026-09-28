import { Suspense } from "react";
import { notFound } from "next/navigation";
import { Metadata } from "next";
import { getCategoryBySlug, getActiveCategories, getPublishedProducts } from "@/lib/queries";
import ProductGrid from "@/components/storefront/ProductGrid";
import ShopFilters from "@/components/storefront/ShopFilters";
import { SITE_URL } from "@/config/site";

export const dynamic = "force-dynamic";
export const revalidate = 0;

interface Props {
  params: Promise<{ slug: string }>;
  searchParams?: Promise<{ [key: string]: string | undefined }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const category = await getCategoryBySlug(slug);
  if (!category) return { title: "Category Not Found" };

  const title = category.seo_title || `${category.name} — Luxury Linen Menswear`;
  const description =
    category.seo_description ||
    category.description ||
    `Explore the ${category.name} collection by AURELIN & CO. — crafted from pure European linen and premium fabrics for the refined gentleman.`;
  const canonical = `${SITE_URL}/shop/${slug}`;

  return {
    title,
    description,
    keywords: [
      category.name,
      `${category.name} luxury menswear`,
      "AURELIN & CO.",
      "pure linen collection",
      "luxury menswear India",
    ],
    alternates: { canonical },
    robots: {
      index: true,
      follow: true,
      googleBot: { index: true, follow: true, "max-snippet": -1, "max-image-preview": "large" },
    },
    openGraph: {
      type: "website",
      url: canonical,
      title: `${title} | AURELIN & CO.`,
      description,
      siteName: "AURELIN & CO.",
      locale: "en_IN",
      images: [{ url: `${SITE_URL}/og-image.png`, width: 1200, height: 630, alt: category.name }],
    },
    twitter: {
      card: "summary_large_image",
      title: `${title} | AURELIN & CO.`,
      description,
      images: [`${SITE_URL}/og-image.png`],
      site: "@aurelinco",
    },
  };
}

export default async function CategoryPage({ params, searchParams }: Props) {
  const { slug } = await params;
  const sp = (await searchParams) || {};
  const sort = sp.sort;
  const size = sp.size;

  const [category, categories] = await Promise.all([
    getCategoryBySlug(slug),
    getActiveCategories(),
  ]);

  if (!category) notFound();

  const products = await getPublishedProducts({
    categorySlug: slug,
    sortBy: sort,
    size,
    limit: 48,
  });

  const hasActiveFilter = Boolean(size || (sort && sort !== "featured"));

  return (
    <div className="container-luxury py-6 md:py-12">
      {/* Category Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@graph": [
              {
                "@type": "CollectionPage",
                "@id": `${SITE_URL}/shop/${slug}/#categorypage`,
                url: `${SITE_URL}/shop/${slug}`,
                name: category.name,
                description: category.description || `${category.name} by AURELIN & CO.`,
                isPartOf: { "@id": `${SITE_URL}/#website` },
                about: { "@id": `${SITE_URL}/#organization` },
                inLanguage: "en-IN",
              },
              {
                "@type": "BreadcrumbList",
                itemListElement: [
                  { "@type": "ListItem", position: 1, name: "Home", item: SITE_URL },
                  { "@type": "ListItem", position: 2, name: "Shop", item: `${SITE_URL}/shop` },
                  { "@type": "ListItem", position: 3, name: category.name, item: `${SITE_URL}/shop/${slug}` },
                ],
              },
            ],
          }),
        }}
      />

      {/* Page Header */}
      <div className="text-center mb-6 md:mb-10 border-b border-[#D8C8AF40] pb-6 md:pb-8">
        <p
          className="mb-2 text-[#B9A77A] uppercase tracking-[0.2em] font-semibold"
          style={{
            fontFamily: "var(--font-inter)",
            fontSize: "0.625rem",
          }}
        >
          CATEGORY
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
          {category.name}
        </h1>
        {category.description && (
          <p
            className="mt-2 max-w-md mx-auto opacity-70 text-xs sm:text-sm leading-relaxed"
            style={{ fontFamily: "var(--font-inter)" }}
          >
            {category.description}
          </p>
        )}
        <p className="text-xs text-charcoal/50 mt-2 uppercase tracking-wider font-medium">
          {products.length === 0
            ? hasActiveFilter
              ? "0 Pieces Matched"
              : "Upcoming Seasonal Drop"
            : `${products.length} ${products.length === 1 ? "Piece" : "Pieces"} Available`}
        </p>
      </div>

      {/* Mobile Filter Bar & Popup Trigger */}
      <div className="md:hidden">
        <ShopFilters
          categories={categories}
          totalProducts={products.length}
          currentSort={sort}
          currentSize={size}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 lg:grid-cols-5 gap-8 lg:gap-12 items-start">
        {/* Desktop Filters Sidebar (Hidden on mobile) */}
        <aside className="hidden md:block md:col-span-1 border-r border-[#D8C8AF30] md:pr-6">
          <ShopFilters
            categories={categories}
            totalProducts={products.length}
            currentSort={sort}
            currentSize={size}
          />
        </aside>

        {/* Product Grid (Takes full width on mobile, 3-4 cols on desktop) */}
        <div className="col-span-1 md:col-span-3 lg:col-span-4">
          <Suspense fallback={<ProductGridSkeleton />}>
            <ProductGrid
              products={products}
              columns={3}
              hasActiveFilter={hasActiveFilter}
              clearFiltersHref={`/shop/${slug}`}
            />
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
