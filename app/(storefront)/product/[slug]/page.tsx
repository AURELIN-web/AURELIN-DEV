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

  const title = product.seo_title || product.name;
  const description =
    product.seo_description ||
    product.short_description ||
    `Shop ${product.name} by AURELIN & CO. — Pure European linen, handcrafted luxury menswear. Free shipping on orders above ₹999.`;
  const canonical = `${SITE_URL}/product/${product.slug}`;
  const imageUrl = product.primary_image_url || `${SITE_URL}/og-image.png`;

  return {
    title,
    description,
    keywords: [
      product.name,
      "AURELIN & CO.",
      "luxury linen menswear",
      product.material || "pure linen",
      product.fit || "relaxed fit",
      "premium menswear India",
      "buy linen shirt online India",
    ].filter(Boolean),
    alternates: { canonical },
    openGraph: {
      type: "website",
      url: canonical,
      title,
      description,
      siteName: "AURELIN & CO.",
      locale: "en_IN",
      images: [
        {
          url: imageUrl,
          width: 800,
          height: 1067,
          alt: `${product.name} — AURELIN & CO.`,
          type: "image/jpeg",
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [{ url: imageUrl, alt: `${product.name} — AURELIN & CO.` }],
      site: "@aurelinco",
      creator: "@aurelinco",
    },
    robots: {
      index: true,
      follow: true,
      googleBot: { index: true, follow: true, "max-image-preview": "large", "max-snippet": -1 },
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

  const canonical = `${SITE_URL}/product/${product.slug}`;
  const imageUrl = product.primary_image_url || `${SITE_URL}/og-image.png`;

  const productSchema = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Product",
        "@id": `${canonical}/#product`,
        name: product.name,
        description: product.description || product.short_description,
        sku: product.sku,
        mpn: product.sku,
        brand: {
          "@type": "Brand",
          name: "AURELIN & CO.",
          url: SITE_URL,
          logo: `${SITE_URL}/logo.svg`,
        },
        image: [
          imageUrl,
          ...(((product as any).images || (product as any).product_images)?.map((img: any) => img.url).filter(Boolean) || []),
        ].slice(0, 5),
        url: canonical,
        category: "Luxury Menswear > Linen Shirts",
        material: product.material || "100% European Flax Linen",
        color: (product as any).variants?.[0]?.colour || (product as any).product_variants?.[0]?.colour || undefined,
        offers: {
          "@type": "Offer",
          "@id": `${canonical}/#offer`,
          url: canonical,
          price: product.sale_price ?? product.price,
          priceCurrency: "INR",
          priceValidUntil: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000)
            .toISOString()
            .split("T")[0],
          availability:
            product.stock_quantity > 0
              ? "https://schema.org/InStock"
              : "https://schema.org/OutOfStock",
          itemCondition: "https://schema.org/NewCondition",
          seller: {
            "@type": "Organization",
            name: "AURELIN & CO.",
            url: SITE_URL,
          },
          shippingDetails: {
            "@type": "OfferShippingDetails",
            shippingRate: {
              "@type": "MonetaryAmount",
              value: 0,
              currency: "INR",
            },
            deliveryTime: {
              "@type": "ShippingDeliveryTime",
              handlingTime: { "@type": "QuantitativeValue", minValue: 1, maxValue: 2, unitCode: "DAY" },
              transitTime: { "@type": "QuantitativeValue", minValue: 3, maxValue: 7, unitCode: "DAY" },
            },
            shippingDestination: {
              "@type": "DefinedRegion",
              addressCountry: "IN",
            },
          },
          hasMerchantReturnPolicy: {
            "@type": "MerchantReturnPolicy",
            applicableCountry: "IN",
            returnPolicyCategory: "https://schema.org/MerchantReturnFiniteReturnWindow",
            merchantReturnDays: 7,
            returnMethod: "https://schema.org/ReturnByMail",
            returnFees: "https://schema.org/FreeReturn",
          },
        },
      },
      {
        "@type": "BreadcrumbList",
        "@id": `${canonical}/#breadcrumb`,
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Home", item: SITE_URL },
          { "@type": "ListItem", position: 2, name: "Shop", item: `${SITE_URL}/shop` },
          { "@type": "ListItem", position: 3, name: product.name, item: canonical },
        ],
      },
    ],
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
