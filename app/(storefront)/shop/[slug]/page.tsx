import { notFound } from "next/navigation";
import { Metadata } from "next";
import { getCategoryBySlug, getActiveCategories } from "@/lib/queries";
import { createClient } from "@/utils/supabase/server";
import ProductGrid from "@/components/storefront/ProductGrid";
import ShopFilters from "@/components/storefront/ShopFilters";
import type { Product } from "@/types/database";

export const dynamic = "force-dynamic";
export const revalidate = 0;

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const category = await getCategoryBySlug(slug);
  if (!category) return { title: "Category Not Found" };

  return {
    title: category.seo_title || category.name,
    description: category.seo_description || category.description || undefined,
  };
}

export default async function CategoryPage({ params }: Props) {
  const { slug } = await params;
  const [category, categories] = await Promise.all([
    getCategoryBySlug(slug),
    getActiveCategories(),
  ]);

  if (!category) notFound();

  const supabase = await createClient();
  const { data: products } = await supabase
    .from("products")
    .select(`
      *,
      product_variants (*),
      product_categories!inner (category_id)
    `)
    .eq("product_categories.category_id", category.id)
    .eq("status", "published");

  return (
    <div className="container-luxury py-12 md:py-10">
      <div className="text-center mb-10 md:mb-14">
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
          CATEGORY
        </p>
        <h1
          style={{
            fontFamily: "var(--font-cormorant)",
            fontSize: "clamp(2rem, 4vw, 3rem)",
            fontWeight: 400,
            color: "#172744",
          }}
        >
          {category.name}
        </h1>
        {category.description && (
          <p
            className="mt-2 max-w-md mx-auto opacity-60 text-sm"
            style={{ fontFamily: "var(--font-inter)" }}
          >
            {category.description}
          </p>
        )}
      </div>

      <div className="flex flex-col md:flex-row gap-8">
        <aside className="w-full md:w-52 flex-shrink-0">
          <ShopFilters categories={categories} />
        </aside>

        <div className="flex-1">
          <ProductGrid products={(products as Product[]) || []} columns={3} />
        </div>
      </div>
    </div>
  );
}
