import { Metadata } from "next";
import { getPublishedProducts } from "@/lib/queries";
import ProductGrid from "@/components/storefront/ProductGrid";
import { SITE_URL } from "@/config/site";

export const metadata: Metadata = {
  title: "New Arrivals — Latest Luxury Linen Drops",
  description: "Explore the latest additions to AURELIN & CO. — freshly released luxury linen shirts, trousers, and signature menswear pieces, handcrafted with pure European flax.",
  keywords: ["new arrivals luxury menswear", "latest linen shirts India", "AURELIN new collection", "new luxury menswear drops"],
  alternates: { canonical: `${SITE_URL}/new-arrivals` },
  robots: { index: true, follow: true },
  openGraph: { type: "website", url: `${SITE_URL}/new-arrivals`, title: "New Arrivals | AURELIN & CO.", description: "The latest luxury linen menswear drops.", siteName: "AURELIN & CO.", locale: "en_IN", images: [{ url: `${SITE_URL}/og-image.png`, width: 1200, height: 630 }] },
  twitter: { card: "summary_large_image", title: "New Arrivals | AURELIN & CO.", images: [`${SITE_URL}/og-image.png`], site: "@aurelinco" },
};

export const dynamic = "force-dynamic";
export const revalidate = 0;

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
