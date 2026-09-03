import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/utils/supabase/admin";

export async function GET() {
  try {
    const supabase = createAdminClient();
    const { data, error } = await supabase
      .from("discounts")
      .select("*")
      .order("created_at", { ascending: false });
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

    const { id, code, type, value, min_order_amount, is_active = true } = body;

    if (!code) {
      return NextResponse.json({ success: false, error: "Discount code is required" }, { status: 400 });
    }

    const payload = {
      code: code.toUpperCase().trim(),
      type: type || "percentage",
      value: parseFloat(value) || 0,
      min_order_amount: min_order_amount ? parseFloat(min_order_amount) : null,
      is_active,
      updated_at: new Date().toISOString(),
    };

    let result;
    if (id) {
      result = await supabase.from("discounts").update(payload).eq("id", id).select().single();
    } else {
      result = await supabase.from("discounts").insert(payload).select().single();
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
    const { error } = await supabase.from("discounts").delete().eq("id", id);
    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
