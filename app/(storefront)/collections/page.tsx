import { Metadata } from "next";
import { getActiveCollections } from "@/lib/queries";
import CollectionGridSection from "@/components/storefront/sections/CollectionGridSection";

export const metadata: Metadata = {
  title: "Collections",
  description: "Explore all AURELIN & CO. collections — Linen Essentials, Signature Shirts, Summer Edit and more.",
};

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function CollectionsPage() {
  const collections = await getActiveCollections();

  const tiles = collections.map((c) => ({
    title: c.name.toUpperCase(),
    subtitle: c.description || undefined,
    href: `/collections/${c.slug}`,
    image: c.hero_image_url,
    ctaText: "SHOP NOW",
  }));

  return (
    <div>
      <div className="text-center py-16 md:py-20" style={{ backgroundColor: "#F8F6F0" }}>
        <p className="mb-3" style={{ fontFamily: "var(--font-inter)", fontSize: "0.625rem", letterSpacing: "0.22em", textTransform: "uppercase", color: "#B9A77A" }}>
          CURATED EDITS
        </p>
        <h1 style={{ fontFamily: "var(--font-cormorant)", fontSize: "clamp(2rem, 4vw, 3rem)", fontWeight: 400, color: "#172744" }}>
          Our Collections
        </h1>
      </div>
      {tiles.length > 0 && (
        <CollectionGridSection tiles={tiles} />
      )}
    </div>
  );
}
