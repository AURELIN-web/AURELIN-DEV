import { Metadata } from "next";
import { getPublishedProducts } from "@/lib/queries";
import ProductGrid from "@/components/storefront/ProductGrid";
import { SITE_URL } from "@/config/site";

export const metadata: Metadata = {
  title: "Best Sellers — Most-Loved Linen Menswear",
  description: "Shop AURELIN & CO.'s most coveted pieces — our best-selling luxury linen shirts and tailored garments, celebrated for exceptional craftsmanship and effortless drape.",
  keywords: ["best selling linen shirts India", "most popular luxury menswear", "AURELIN best sellers", "top rated linen shirts"],
  alternates: { canonical: `${SITE_URL}/best-sellers` },
  robots: { index: true, follow: true },
  openGraph: { type: "website", url: `${SITE_URL}/best-sellers`, title: "Best Sellers | AURELIN & CO.", description: "Our most coveted luxury linen pieces.", siteName: "AURELIN & CO.", locale: "en_IN", images: [{ url: `${SITE_URL}/og-image.png`, width: 1200, height: 630 }] },
  twitter: { card: "summary_large_image", title: "Best Sellers | AURELIN & CO.", images: [`${SITE_URL}/og-image.png`], site: "@aurelinco" },
};

export const dynamic = "force-dynamic";
export const revalidate = 0;

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
