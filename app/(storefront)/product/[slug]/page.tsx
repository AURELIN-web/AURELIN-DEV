import { notFound } from "next/navigation";
import { Metadata } from "next";
import { getProductBySlug, getRelatedProducts, getSiteSettings } from "@/lib/queries";
import { SITE_URL } from "@/config/site";
import ProductDetailClient from "@/components/storefront/ProductDetailClient";
import SignaturePiecesSection from "@/components/storefront/sections/SignaturePiecesSection";

export const dynamic = "force-dynamic";
export const revalidate = 0;

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) return { title: "Product Not Found" };

  return {
    title: product.seo_title || product.name,
    description: product.seo_description || product.short_description || undefined,
    alternates: { canonical: `${SITE_URL}/product/${product.slug}` },
    openGraph: {
      title: product.seo_title || product.name,
      description: product.seo_description || product.short_description || undefined,
      url: `${SITE_URL}/product/${product.slug}`,
      images: product.primary_image_url
        ? [{ url: product.primary_image_url, alt: product.name }]
        : [],
    },
  };
}

export default async function ProductPage({ params }: Props) {
  const { slug } = await params;
  const [product, settings] = await Promise.all([
    getProductBySlug(slug),
    getSiteSettings(),
  ]);

  if (!product) notFound();

  const related = await getRelatedProducts(product.id, 4);

  const productSchema = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    description: product.description,
    brand: { "@type": "Brand", name: "AURELIN & CO." },
    sku: product.sku,
    offers: {
      "@type": "Offer",
      price: product.sale_price ?? product.price,
      priceCurrency: product.currency || "INR",
      availability:
        product.stock_quantity > 0
          ? "https://schema.org/InStock"
          : "https://schema.org/OutOfStock",
      url: `${SITE_URL}/product/${product.slug}`,
    },
    image: product.primary_image_url ? [product.primary_image_url] : [],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(productSchema) }}
      />

      <ProductDetailClient
        product={product}
        whatsappSettings={settings.whatsapp}
      />

      {/* Related Products */}
      {related.length > 0 && (
        <div className="border-t" style={{ borderColor: "#D8C8AF30" }}>
          <SignaturePiecesSection
            title="YOU MAY ALSO LIKE"
            products={related}
            ctaText="VIEW ALL"
            ctaUrl="/shop"
          />
        </div>
      )}
    </>
  );
}
