import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/utils/supabase/admin";

export async function GET() {
  try {
    const supabase = createAdminClient();
    const { data, error } = await supabase.from("categories").select("*").order("sort_order");
    if (error) throw error;
    return NextResponse.json({ success: true, data: data || [] });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const supabase = createAdminClient();

    const { id, name, slug, description, image_url, is_active = true, sort_order = 0 } = body;

    let baseSlug = (slug || name)
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");

    let finalSlug = baseSlug;
    let counter = 1;
    while (true) {
      let query = supabase.from("categories").select("id").eq("slug", finalSlug);
      if (id) query = query.neq("id", id);
      const { data: existing } = await query.maybeSingle();
      if (!existing) break;
      counter++;
      finalSlug = `${baseSlug}-${counter}`;
    }

    const payload = {
      name,
      slug: finalSlug,
      description: description || null,
      image_url: image_url || null,
      is_active,
      sort_order,
      updated_at: new Date().toISOString(),
    };

    let result;
    if (id) {
      result = await supabase.from("categories").update(payload).eq("id", id).select().single();
    } else {
      result = await supabase.from("categories").insert(payload).select().single();
    }

    if (result.error) throw result.error;
    return NextResponse.json({ success: true, data: result.data });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    if (!id) return NextResponse.json({ success: false, error: "ID required" }, { status: 400 });

    const supabase = createAdminClient();
    const { error } = await supabase.from("categories").delete().eq("id", id);
    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
