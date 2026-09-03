import { unstable_cache } from "next/cache";
import { createClient } from "@/utils/supabase/server";
import { createAdminClient } from "@/utils/supabase/admin";
import type { Product, Category, Collection, HeroSettings, AnnouncementBarSettings, WhatsAppSettings, HomepageSection } from "@/types/database";

// ================================================
// PRODUCTS
// ================================================

export async function getPublishedProducts(options?: {
  limit?: number;
  featured?: boolean;
  newArrival?: boolean;
  bestSeller?: boolean;
  categorySlug?: string;
  collectionSlug?: string;
}) {
  const supabase = await createClient();

  let query = supabase
    .from("products")
    .select(`
      *,
      product_variants (*),
      product_images (*)
    `)
    .eq("status", "published")
    .order("created_at", { ascending: false });

  if (options?.featured) query = query.eq("is_featured", true);
  if (options?.newArrival) query = query.eq("is_new_arrival", true);
  if (options?.bestSeller) query = query.eq("is_best_seller", true);
  if (options?.limit) query = query.limit(options.limit);

  const { data, error } = await query;
  if (error) console.error("getPublishedProducts error:", error);
  const products = (data as Product[]) || [];
  return products.filter((product) => {
    if (product.show_on_storefront === false) return false;
    if (product.show_on_storefront === true || product.show_on_storefront == null) return true;

    const hasVisibleVariant = (product.product_variants ?? []).some((variant) => {
      if (variant.show_on_storefront === false) return false;
      return variant.show_on_storefront === true || variant.show_on_storefront == null;
    });

    if (hasVisibleVariant) return true;
    return Boolean(product.primary_image_url || product.product_images?.length);
  });
}

export async function getProductBySlug(slug: string): Promise<Product | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("products")
    .select(`
      *,
      product_variants (*),
      product_images (id, url, alt_text, sort_order),
      product_categories (
        category_id,
        categories (id, name, slug)
      )
    `)
    .eq("slug", slug)
    .eq("status", "published")
    .single();

  if (error) return null;
  return data as Product;
}

export async function getRelatedProducts(productId: string, limit = 4): Promise<Product[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("products")
    .select("id, name, slug, price, sale_price, primary_image_url, hover_image_url, product_variants (*)")
    .eq("status", "published")
    .neq("id", productId)
    .limit(limit);
  const products = (data as Product[]) || [];
  return products.filter((product) => {
    if (product.show_on_storefront === false) return false;
    if (product.show_on_storefront === true || product.show_on_storefront == null) return true;

    const hasVisibleVariant = (product.product_variants ?? []).some((variant) => {
      if (variant.show_on_storefront === false) return false;
      return variant.show_on_storefront === true || variant.show_on_storefront == null;
    });

    if (hasVisibleVariant) return true;
    return Boolean(product.primary_image_url || product.product_images?.length);
  });
}

// ================================================
// CATEGORIES
// ================================================

export async function getActiveCategories(): Promise<Category[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("categories")
    .select("*")
    .eq("is_active", true)
    .order("sort_order");
  return (data as Category[]) || [];
}

export async function getCategoryBySlug(slug: string): Promise<Category | null> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("categories")
    .select("*")
    .eq("slug", slug)
    .eq("is_active", true)
    .single();
  return data as Category | null;
}

// ================================================
// COLLECTIONS
// ================================================

export async function getActiveCollections(): Promise<Collection[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("collections")
    .select("*")
    .eq("is_active", true)
    .order("sort_order");
  return (data as Collection[]) || [];
}

export async function getCollectionBySlug(slug: string): Promise<Collection | null> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("collections")
    .select(`
      *,
      collection_products (
        sort_order,
        products (
          *,
          product_variants (*),
          product_images (*)
        )
      )
    `)
    .eq("slug", slug)
    .eq("is_active", true)
    .single();
  return data as Collection | null;
}

// ================================================
// HERO SETTINGS
// ================================================

export const getHeroSettings = unstable_cache(
  async (): Promise<HeroSettings | null> => {
    const supabase = createAdminClient();
    const { data } = await supabase
      .from("hero_settings")
      .select("*")
      .eq("is_active", true)
      .limit(1)
      .single();
    return data as HeroSettings | null;
  },
  ["hero-settings"],
  { tags: ["hero-settings"], revalidate: 60 }
);

// ================================================
// SITE SETTINGS
// ================================================

export async function getSiteSettings() {
  const supabase = await createClient();
  const { data } = await supabase
    .from("site_settings")
    .select("key, value");

  const settings: Record<string, unknown> = {};
  data?.forEach((row) => {
    settings[row.key] = row.value;
  });

  return {
    announcementBar: settings.announcement_bar as AnnouncementBarSettings | null,
    whatsapp: settings.whatsapp as WhatsAppSettings | null,
    seo: settings.seo as Record<string, string> | null,
    footer: settings.footer as Record<string, string> | null,
  };
}

// ================================================
// HOMEPAGE SECTIONS
// ================================================

export async function getHomepageSections(): Promise<HomepageSection[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("homepage_sections")
    .select("*")
    .eq("is_active", true)
    .order("sort_order");
  return (data as HomepageSection[]) || [];
}

// ================================================
// JOURNAL
// ================================================

export async function getPublishedJournalPosts(limit = 10) {
  const supabase = await createClient();
  const { data } = await supabase
    .from("journal_posts")
    .select("id, title, slug, cover_image_url, excerpt, author, published_at, created_at")
    .eq("status", "published")
    .order("published_at", { ascending: false })
    .limit(limit);
  return data || [];
}

export async function getJournalPostBySlug(slug: string) {
  const supabase = await createClient();
  const { data } = await supabase
    .from("journal_posts")
    .select("*")
    .eq("slug", slug)
    .eq("status", "published")
    .single();
  return data;
}

// ================================================
// SEARCH
// ================================================

export async function searchProducts(query: string, limit = 20) {
  const supabase = await createClient();
  const { data } = await supabase
    .from("products")
    .select("id, name, slug, price, sale_price, primary_image_url")
    .eq("status", "published")
    .or(`name.ilike.%${query}%,description.ilike.%${query}%`)
    .limit(limit);
  return (data as Product[]) || [];
}

// ================================================
// ADMIN QUERIES
// ================================================

export async function adminGetAllProducts(page = 1, perPage = 20) {
  const supabase = createAdminClient();
  const from = (page - 1) * perPage;
  const { data, count } = await supabase
    .from("products")
    .select("*, product_variants(*)", { count: "exact" })
    .order("created_at", { ascending: false })
    .range(from, from + perPage - 1);
  return { products: (data as Product[]) || [], total: count || 0 };
}

export async function adminGetDashboardStats() {
  const supabase = createAdminClient();

  const [
    { count: orderCount },
    { count: productCount },
    { count: customerCount },
    { data: recentOrders },
    { data: lowStockProducts },
    { data: whatsappCount },
    { data: ordersData },
  ] = await Promise.all([
    supabase.from("orders").select("id", { count: "exact", head: true }),
    supabase.from("products").select("id", { count: "exact", head: true }),
    supabase.from("profiles").select("id", { count: "exact", head: true }).eq("role", "customer"),
    supabase.from("orders").select("*, order_items(*)").order("created_at", { ascending: false }).limit(5),
    supabase.from("products").select("id, name, stock_quantity, low_stock_threshold, sku").filter("stock_quantity", "lte", "low_stock_threshold").limit(5),
    supabase.from("whatsapp_enquiries").select("id", { count: "exact", head: true }),
    supabase.from("orders").select("total, payment_status, order_status, customer_email"),
  ]);

  // Revenue sum from non-cancelled orders
  const totalRevenue =
    ordersData
      ?.filter((o) => o.order_status !== "cancelled")
      .reduce((sum, o) => sum + (Number(o.total) || 0), 0) || 0;

  // Clients count: max of registered profiles or unique client emails from orders
  const uniqueOrderEmails = new Set(ordersData?.map((o) => o.customer_email).filter(Boolean));
  const finalCustomerCount = Math.max(customerCount || 0, uniqueOrderEmails.size);

  return {
    totalRevenue,
    orderCount: orderCount || 0,
    productCount: productCount || 0,
    customerCount: finalCustomerCount,
    recentOrders: recentOrders || [],
    lowStockProducts: lowStockProducts || [],
    whatsappEnquiries: whatsappCount || 0,
  };
}
