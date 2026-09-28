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

  const title = collection.seo_title || `${collection.name} Collection`;
  const description =
    collection.seo_description ||
    collection.description ||
    `Shop the ${collection.name} collection by AURELIN & CO. — luxury linen menswear, handcrafted for the modern gentleman.`;
  const canonical = `${SITE_URL}/collections/${slug}`;
  const imageUrl = collection.hero_image_url || `${SITE_URL}/og-image.png`;

  return {
    title,
    description,
    keywords: [
      collection.name, "AURELIN & CO.", "luxury linen collection",
      "premium menswear India", `${collection.name} menswear`,
    ],
    alternates: { canonical },
    robots: { index: true, follow: true, googleBot: { index: true, follow: true, "max-image-preview": "large", "max-snippet": -1 } },
    openGraph: {
      type: "website",
      url: canonical,
      title: `${title} | AURELIN & CO.`,
      description,
      siteName: "AURELIN & CO.",
      locale: "en_IN",
      images: [{ url: imageUrl, width: 1200, height: 630, alt: `${collection.name} — AURELIN & CO.` }],
    },
    twitter: {
      card: "summary_large_image",
      title: `${title} | AURELIN & CO.`,
      description,
      images: [{ url: imageUrl, alt: `${collection.name} — AURELIN & CO.` }],
      site: "@aurelinco",
    },
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
      {/* Collection Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@graph": [
              {
                "@type": "CollectionPage",
                "@id": `${SITE_URL}/collections/${slug}/#collectionpage`,
                url: `${SITE_URL}/collections/${slug}`,
                name: collection.name,
                description: collection.description || `${collection.name} collection by AURELIN & CO.`,
                isPartOf: { "@id": `${SITE_URL}/#website` },
                about: { "@id": `${SITE_URL}/#organization` },
                inLanguage: "en-IN",
              },
              {
                "@type": "BreadcrumbList",
                itemListElement: [
                  { "@type": "ListItem", position: 1, name: "Home", item: SITE_URL },
                  { "@type": "ListItem", position: 2, name: "Collections", item: `${SITE_URL}/collections` },
                  { "@type": "ListItem", position: 3, name: collection.name, item: `${SITE_URL}/collections/${slug}` },
                ],
              },
            ],
          }),
        }}
      />

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
      <div className="container-luxury py-12 md:py-10">
        <ProductGrid products={products} columns={4} />
      </div>
    </div>
  );
}
