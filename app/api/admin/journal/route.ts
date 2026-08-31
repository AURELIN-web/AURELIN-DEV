import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/utils/supabase/admin";

export async function GET() {
  try {
    const supabase = createAdminClient();
    const { data, error } = await supabase.from("journal_posts").select("*").order("created_at", { ascending: false });
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

    const { id, title, slug, excerpt, content, cover_image_url, author = "AURELIN Atelier", status = "published" } = body;

    const payload = {
      title,
      slug: slug || title.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
      excerpt: excerpt || null,
      content: content || "",
      cover_image_url: cover_image_url || null,
      author,
      status,
      updated_at: new Date().toISOString(),
    };

    let result;
    if (id) {
      result = await supabase.from("journal_posts").update(payload).eq("id", id).select().single();
    } else {
      result = await supabase.from("journal_posts").insert(payload).select().single();
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
    const { error } = await supabase.from("journal_posts").delete().eq("id", id);
    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
