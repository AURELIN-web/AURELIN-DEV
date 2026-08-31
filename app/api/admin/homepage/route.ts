import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/utils/supabase/admin";

// GET /api/admin/homepage - Fetch all sections
export async function GET() {
  try {
    const supabase = createAdminClient();
    const { data: sections, error } = await supabase
      .from("homepage_sections")
      .select("*")
      .order("sort_order");

    if (error) throw error;
    return NextResponse.json({ success: true, sections: sections || [] });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

// POST /api/admin/homepage - Upsert/Update homepage section configs
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const supabase = createAdminClient();

    // If batch array of sections
    if (Array.isArray(body)) {
      for (const section of body) {
        if (section.id) {
          await supabase
            .from("homepage_sections")
            .update({
              title: section.title,
              is_active: section.is_active,
              sort_order: section.sort_order,
              config: section.config,
              updated_at: new Date().toISOString(),
            })
            .eq("id", section.id);
        } else if (section.section_type) {
          await supabase
            .from("homepage_sections")
            .upsert({
              section_type: section.section_type,
              title: section.title,
              is_active: section.is_active,
              sort_order: section.sort_order,
              config: section.config,
              updated_at: new Date().toISOString(),
            }, { onConflict: "section_type" });
        }
      }
      return NextResponse.json({ success: true });
    }

    // Single section update
    const { id, section_type, title, is_active = true, sort_order = 0, config = {} } = body;

    const payload = {
      section_type,
      title,
      is_active,
      sort_order,
      config,
      updated_at: new Date().toISOString(),
    };

    let result;
    if (id) {
      result = await supabase
        .from("homepage_sections")
        .update(payload)
        .eq("id", id)
        .select()
        .single();
    } else {
      result = await supabase
        .from("homepage_sections")
        .upsert(payload, { onConflict: "section_type" })
        .select()
        .single();
    }

    if (result.error) throw result.error;
    return NextResponse.json({ success: true, data: result.data });
  } catch (err: any) {
    console.error("Homepage CMS error:", err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
