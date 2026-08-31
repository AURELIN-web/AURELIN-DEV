import { notFound } from "next/navigation";
import { Metadata } from "next";
import { getCollectionBySlug } from "@/lib/queries";
import { SITE_URL } from "@/config/site";
import ProductGrid from "@/components/storefront/ProductGrid";

export const dynamic = "force-dynamic";
export const revalidate = 0;

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const collection = await getCollectionBySlug(slug);
  if (!collection) return { title: "Collection Not Found" };
  return {
    title: collection.seo_title || collection.name,
    description: collection.seo_description || collection.description || undefined,
    alternates: { canonical: `${SITE_URL}/collections/${slug}` },
  };
}

export default async function CollectionPage({ params }: Props) {
  const { slug } = await params;
  const collection = await getCollectionBySlug(slug);
  if (!collection) notFound();

  const products = (collection as any).collection_products
    ?.sort((a: any, b: any) => a.sort_order - b.sort_order)
    .map((cp: any) => cp.products)
    .filter(Boolean) || [];

  return (
    <div>
      {/* Hero */}
      <div
        className="relative py-20 md:py-28 flex items-end justify-start"
        style={{
          backgroundColor: "#172744",
          backgroundImage: collection.hero_image_url ? `url(${collection.hero_image_url})` : undefined,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        <div className="absolute inset-0" style={{ backgroundColor: "rgba(16,28,50,0.5)" }} />
        <div className="relative z-10 container-luxury">
          <h1
            style={{ fontFamily: "var(--font-cormorant)", fontSize: "clamp(2rem, 5vw, 3.5rem)", fontWeight: 400, color: "#F8F6F0", lineHeight: 1.1 }}
          >
            {collection.name}
          </h1>
          {collection.description && (
            <p
              className="mt-3 max-w-md opacity-70"
              style={{ fontFamily: "var(--font-inter)", fontSize: "0.9375rem", fontWeight: 300, color: "#F8F6F0" }}
            >
              {collection.description}
            </p>
          )}
        </div>
      </div>

      {/* Products */}
      <div className="container-luxury py-12 md:py-16">
        <ProductGrid products={products} columns={4} />
      </div>
    </div>
  );
}
