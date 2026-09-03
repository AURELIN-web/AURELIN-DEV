import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/utils/supabase/admin";

// GET /api/admin/products - List products
export async function GET(request: NextRequest) {
  try {
    const supabase = createAdminClient();
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get("limit") || "100", 10);
    const page = parseInt(searchParams.get("page") || "1", 10);
    const offset = (page - 1) * limit;

    const { data: products, error, count } = await supabase
      .from("products")
      .select(`
        *,
        product_variants (*),
        product_images (*)
      `, { count: "exact" })
      .order("created_at", { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) throw error;
    return NextResponse.json({ success: true, products: products || [], total: count || 0 });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

// POST /api/admin/products - Create or Update product (Service Role bypasses RLS)
const supportsStorefrontFlag = async (supabase: any, tableName: "products" | "product_variants") => {
  try {
    const { error } = await supabase.from(tableName).select("show_on_storefront").limit(1);
    return !error;
  } catch {
    return false;
  }
};

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const supabase = createAdminClient();
    const productStorefrontFlagEnabled = await supportsStorefrontFlag(supabase, "products");
    const variantStorefrontFlagEnabled = await supportsStorefrontFlag(supabase, "product_variants");

    const {
      id,
      name,
      slug,
      sku,
      short_description,
      description,
      price,
      compare_at_price,
      sale_price,
      status = "published",
      is_featured = false,
      is_new_arrival = false,
      is_best_seller = false,
      show_on_storefront = true,
      stock_quantity = 0,
      low_stock_threshold = 5,
      material,
      fabric,
      fit,
      care_instructions,
      seo_title,
      seo_description,
      seo_keywords,
      category_id,
      category_ids = [],
      primary_image_url,
      variants = [],
      images = [],
    } = body;

    if (!name || price === undefined || price === null) {
      return NextResponse.json({ success: false, error: "Product name and price are required" }, { status: 400 });
    }

    let baseSlug = (slug || name)
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");

    // Automatically ensure slug is unique
    let finalSlug = baseSlug;
    let counter = 1;
    while (true) {
      let query = supabase.from("products").select("id").eq("slug", finalSlug);
      if (id) {
        query = query.neq("id", id);
      }
      const { data: existing } = await query.maybeSingle();
      if (!existing) break;
      counter++;
      finalSlug = `${baseSlug}-${counter}`;
    }

    const productPayload = {
      name,
      slug: finalSlug,
      sku: sku || null,
      short_description: short_description || null,
      description: description || null,
      price: parseFloat(price),
      compare_at_price: compare_at_price ? parseFloat(compare_at_price) : null,
      sale_price: sale_price ? parseFloat(sale_price) : null,
      status: status || "published",
      is_featured: !!is_featured,
      is_new_arrival: !!is_new_arrival,
      is_best_seller: !!is_best_seller,
      ...(productStorefrontFlagEnabled ? { show_on_storefront: !!show_on_storefront } : {}),
      stock_quantity: parseInt(stock_quantity, 10) || 0,
      low_stock_threshold: parseInt(low_stock_threshold, 10) || 5,
      material: material || null,
      fabric: fabric || null,
      fit: fit || null,
      care_instructions: care_instructions || null,
      seo_title: seo_title || null,
      seo_description: seo_description || null,
      seo_keywords: seo_keywords || null,
      primary_image_url: primary_image_url || (images.length > 0 ? images[0].url : null),
      updated_at: new Date().toISOString(),
    };

    let productId = id;

    if (productId) {
      const { data, error } = await supabase
        .from("products")
        .update(productPayload)
        .eq("id", productId)
        .select()
        .single();
      if (error) throw error;
    } else {
      const { data, error } = await supabase
        .from("products")
        .insert(productPayload)
        .select()
        .single();
      if (error) throw error;
      productId = data.id;
    }

    // 2. Persist category association
    if (productId) {
      const selectedCategoryIds = Array.from(
        new Set([
          ...(Array.isArray(category_ids) ? category_ids.filter(Boolean) : []),
          ...(category_id ? [category_id] : []),
        ])
      );

      await supabase.from("product_categories").delete().eq("product_id", productId);

      if (selectedCategoryIds.length > 0) {
        const categoryPayloads = selectedCategoryIds.map((catId: string) => ({
          product_id: productId,
          category_id: catId,
        }));
        await supabase.from("product_categories").insert(categoryPayloads);
      }
    }

    // 3. Persist variants if provided
    if (productId) {
      await supabase.from("product_variants").delete().eq("product_id", productId);

      if (variants.length > 0) {
        const variantPayloads = variants.map((v: any) => ({
          product_id: productId,
          size: v.size || null,
          colour: v.colour || null,
          colour_hex: v.colour_hex || null,
          price: v.price ? parseFloat(v.price) : parseFloat(price),
          stock_quantity: parseInt(v.stock_quantity, 10) || 0,
          sku: v.sku || null,
          is_available: v.is_available !== false,
          image_url: v.image_url || null,
          ...(variantStorefrontFlagEnabled ? { show_on_storefront: !!v.show_on_storefront } : {}),
        }));
        await supabase.from("product_variants").insert(variantPayloads);
      }
    }

    // 4. Persist product image records
    if (productId && images.length > 0) {
      await supabase.from("product_images").delete().eq("product_id", productId);

      const imagePayloads = images.map((img: any, i: number) => ({
        product_id: productId,
        url: img.url,
        alt_text: img.alt_text || name,
        sort_order: i,
      }));
      await supabase.from("product_images").insert(imagePayloads);
    }

    return NextResponse.json({ success: true, productId });
  } catch (err: any) {
    console.error("Admin product save error:", err);
    return NextResponse.json({ success: false, error: err.message || "Failed to save product" }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    if (!id) {
      return NextResponse.json({ success: false, error: "Product ID is required" }, { status: 400 });
    }

    const supabase = createAdminClient();
    const { error } = await supabase.from("products").delete().eq("id", id);
    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
