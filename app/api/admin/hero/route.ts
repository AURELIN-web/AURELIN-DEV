import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/utils/supabase/admin";
import { revalidateTag } from "next/cache";

export async function GET() {
  try {
    const supabase = createAdminClient();
    const { data, error } = await supabase
      .from("hero_settings")
      .select("*")
      .limit(1)
      .single();

    if (error) throw error;
    return NextResponse.json({ success: true, data });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const supabase = createAdminClient();

    let heroId = body.id;
    if (!heroId) {
      const { data: existing } = await supabase
        .from("hero_settings")
        .select("id")
        .limit(1)
        .single();
      heroId = existing?.id;
    }

    const payload = {
      desktop_video_url: body.desktop_video_url ?? null,
      mobile_video_url: body.mobile_video_url ?? null,
      poster_image_url: body.poster_image_url ?? null,
      eyebrow: body.eyebrow ?? "SPRING / SUMMER",
      heading: body.heading ?? "THE ART OF DRESSING WELL",
      subheading: body.subheading ?? "Quiet confidence. Timeless character.",
      primary_cta_text: body.primary_cta_text ?? "DISCOVER THE COLLECTION",
      primary_cta_url: body.primary_cta_url ?? "/collections",
      secondary_cta_text: body.secondary_cta_text ?? "SHOP NEW ARRIVALS",
      secondary_cta_url: body.secondary_cta_url ?? "/new-arrivals",
      overlay_strength: body.overlay_strength ?? 0.35,
      autoplay: body.autoplay ?? true,
      loop: body.loop ?? true,
      is_muted: body.is_muted ?? true,
      is_active: body.is_active ?? true,
      updated_at: new Date().toISOString(),
    };

    let result;
    if (heroId) {
      result = await supabase
        .from("hero_settings")
        .update(payload)
        .eq("id", heroId)
        .select()
        .single();
    } else {
      result = await supabase
        .from("hero_settings")
        .insert(payload)
        .select()
        .single();
    }

    if (result.error) throw result.error;

    // Bust the storefront cache so video/settings are live immediately
    revalidateTag("hero-settings", "default");

    return NextResponse.json({ success: true, data: result.data });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
