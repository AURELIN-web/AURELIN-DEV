import { Suspense } from "react";
import { Metadata } from "next";
import {
  getHeroSettings,
  getPublishedProducts,
  getActiveCollections,
  getHomepageSections,
  getSiteSettings,
} from "@/lib/queries";
import HeroVideo from "@/components/storefront/HeroVideo";
import CollectionGridSection from "@/components/storefront/sections/CollectionGridSection";
import SignaturePiecesSection from "@/components/storefront/sections/SignaturePiecesSection";
import FabricStorySection from "@/components/storefront/sections/FabricStorySection";
import BrandStorySection from "@/components/storefront/sections/BrandStorySection";
import TrustFeaturesSection from "@/components/storefront/sections/TrustFeaturesSection";
import { SITE_NAME, SITE_DESCRIPTION, SITE_URL } from "@/config/site";
import type { HomepageSection } from "@/types/database";

export const metadata: Metadata = {
  title: `${SITE_NAME} — MAISON DE L'HOMME`,
  description: SITE_DESCRIPTION,
  alternates: { canonical: SITE_URL },
  openGraph: {
    url: SITE_URL,
    type: "website",
  },
};

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function HomePage() {
  const [heroSettings, collections, sections, featuredProducts, bestSellers] =
    await Promise.all([
      getHeroSettings(),
      getActiveCollections(),
      getHomepageSections(),
      getPublishedProducts({ featured: true, limit: 4 }),
      getPublishedProducts({ bestSeller: true, limit: 4 }),
    ]);

  const signatureProducts =
    featuredProducts.length > 0 ? featuredProducts : bestSellers;

  // Map sections config
  const collectionSection = sections.find((s) => s.section_type === "collection_grid");
  const signatureSection = sections.find((s) => s.section_type === "signature_pieces");
  const fabricSection = sections.find((s) => s.section_type === "fabric_story");
  const brandStorySection = sections.find((s) => s.section_type === "brand_story");
  const trustSection = sections.find((s) => s.section_type === "trust_features");

  const collectionTiles = collections.slice(0, 4).map((c) => ({
    title: c.name.toUpperCase(),
    href: `/collections/${c.slug}`,
    image: c.hero_image_url,
    ctaText: "SHOP NOW",
  }));

  return (
    <>
      {/* ——— HERO ——— */}
      <HeroVideo settings={heroSettings} />

      {/* ——— JSON-LD Organization Schema ——— */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "ClothingStore",
            name: "AURELIN & CO.",
            description: SITE_DESCRIPTION,
            url: SITE_URL,
            logo: `${SITE_URL}/logo.svg`,
            address: {
              "@type": "PostalAddress",
              addressCountry: "IN",
            },
            sameAs: [],
          }),
        }}
      />

      {/* ——— COLLECTION GRID ——— */}
      {collectionTiles.length > 0 && (
        <CollectionGridSection
          sectionTitle={collectionSection?.title || "THE AURELIN COLLECTION"}
          subtitle={
            (collectionSection?.config as { subtitle?: string } | null)?.subtitle ||
            "Crafted for those who appreciate what doesn't need to be explained."
          }
          tiles={collectionTiles}
        />
      )}

      {/* ——— SIGNATURE PIECES ——— */}
      {signatureProducts.length > 0 && (
        <SignaturePiecesSection
          title={signatureSection?.title || "SIGNATURE PIECES"}
          products={signatureProducts}
          ctaText={
            (signatureSection?.config as { cta_text?: string } | null)?.cta_text || "VIEW ALL"
          }
          ctaUrl={
            (signatureSection?.config as { cta_url?: string } | null)?.cta_url || "/shop"
          }
        />
      )}

      {/* ——— FABRIC STORY ——— */}
      <Suspense>
        <FabricStorySection
          eyebrow={
            (fabricSection?.config as Record<string, string> | null)?.eyebrow || "OUR FABRICS"
          }
          heading={
            (fabricSection?.config as Record<string, string> | null)?.heading ||
            "THE LANGUAGE\nOF LINEN"
          }
          body={
            (fabricSection?.config as Record<string, string> | null)?.body ||
            "Natural texture.\nEffortless movement.\nDesigned for warm days\nand refined moments."
          }
          ctaText={
            (fabricSection?.config as Record<string, string> | null)?.cta_text ||
            "DISCOVER OUR FABRICS →"
          }
          ctaUrl={
            (fabricSection?.config as Record<string, string> | null)?.cta_url || "/care-guide"
          }
          fabricImageUrl={
            (fabricSection?.config as Record<string, string | null> | null)?.image_url || null
          }
        />
      </Suspense>

      {/* ——— BRAND STORY ——— */}
      <BrandStorySection
        heading={
          (brandStorySection?.config as Record<string, string> | null)?.heading ||
          "DRESS WITH CHARACTER"
        }
        body={
          (brandStorySection?.config as Record<string, string> | null)?.body ||
          "Style is not about being noticed.\nIt is about being remembered."
        }
        ctaText={
          (brandStorySection?.config as Record<string, string> | null)?.cta_text ||
          "EXPLORE AURELIN →"
        }
        ctaUrl={
          (brandStorySection?.config as Record<string, string> | null)?.cta_url || "/about"
        }
        imageUrl={
          (brandStorySection?.config as Record<string, string | null> | null)?.image_url || null
        }
      />

      {/* ——— TRUST FEATURES ——— */}
      <TrustFeaturesSection
        features={
          (
            trustSection?.config as {
              features?: { title: string; description?: string }[];
            } | null
          )?.features || undefined
        }
      />
    </>
  );
}
