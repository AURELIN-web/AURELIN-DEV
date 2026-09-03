import { notFound } from "next/navigation";
import { createAdminClient } from "@/utils/supabase/admin";
import ProductFormClient from "@/components/admin/ProductFormClient";

interface Props {
  params: Promise<{ id: string }>;
}

export default async function EditProductPage({ params }: Props) {
  const { id } = await params;
  const supabase = createAdminClient();

  const { data: product } = await supabase
    .from("products")
    .select(`
      *,
      product_variants (*),
      product_images (*),
      product_categories (category_id)
    `)
    .eq("id", id)
    .single();

  if (!product) notFound();

  const sortedImages = (product.product_images || []).sort(
    (a: any, b: any) => (a.sort_order || 0) - (b.sort_order || 0)
  ).map((img: any) => ({
    url: img.url,
    alt_text: img.alt_text || product.name,
  }));

  // If no product_images records but primary_image_url exists, include it
  const initialImages = sortedImages.length > 0
    ? sortedImages
    : product.primary_image_url
    ? [{ url: product.primary_image_url, alt_text: product.name }]
    : [];

  return (
    <ProductFormClient
      initialProduct={{
        id: product.id,
        name: product.name,
        slug: product.slug,
        sku: product.sku || "",
        short_description: product.short_description || "",
        description: product.description || "",
        price: product.price?.toString() || "",
        compare_at_price: product.compare_at_price?.toString() || "",
        sale_price: product.sale_price?.toString() || "",
        status: product.status || "published",
        is_featured: !!product.is_featured,
        is_new_arrival: !!product.is_new_arrival,
        is_best_seller: !!product.is_best_seller,
        show_on_storefront: product.show_on_storefront ?? true,
        stock_quantity: product.stock_quantity ?? 0,
        low_stock_threshold: product.low_stock_threshold ?? 3,
        material: product.material || "",
        fabric: product.fabric || "",
        fit: product.fit || "",
        care_instructions: product.care_instructions || "",
        seo_title: product.seo_title || "",
        seo_description: product.seo_description || "",
        seo_keywords: product.seo_keywords || "",
        primary_image_url: product.primary_image_url || "",
        category_id: product.product_categories?.[0]?.category_id || "",
        variants: product.product_variants || [],
        images: initialImages,
      }}
    />
  );
}
