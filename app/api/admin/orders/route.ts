import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/utils/supabase/admin";
import { revalidatePath } from "next/cache";

export async function GET() {
  try {
    const supabase = createAdminClient();
    const { data: orders, error } = await supabase
      .from("orders")
      .select("*, order_items(*)")
      .order("created_at", { ascending: false });

    if (error) throw error;
    return NextResponse.json({ success: true, orders: orders || [] });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, order_status, payment_status } = body;

    if (!id) {
      return NextResponse.json({ success: false, error: "Order ID is required" }, { status: 400 });
    }

    const supabase = createAdminClient();
    const updateData: Record<string, any> = {
      updated_at: new Date().toISOString(),
    };

    if (order_status) updateData.order_status = order_status;
    if (payment_status) updateData.payment_status = payment_status;

    let { data, error } = await supabase
      .from("orders")
      .update(updateData)
      .eq("id", id)
      .select("*, order_items(*)")
      .single();

    // If 'completed' was passed and rejected by DB check constraint, map to 'delivered'
    if (error && error.message?.includes("order_status") && order_status === "completed") {
      updateData.order_status = "delivered";
      const retry = await supabase
        .from("orders")
        .update(updateData)
        .eq("id", id)
        .select("*, order_items(*)")
        .single();
      data = retry.data;
      error = retry.error;
    }

    if (error) throw error;

    revalidatePath("/admin/orders");
    revalidatePath(`/admin/orders/${id}`);
    revalidatePath("/admin/dashboard");

    return NextResponse.json({ success: true, order: data });
  } catch (err: any) {
    console.error("Admin order update error:", err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
