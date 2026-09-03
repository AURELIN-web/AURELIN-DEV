"use server";

import { revalidatePath } from "next/cache";
import { createAdminClient } from "@/utils/supabase/admin";
import type { ShippingAddress, WhatsAppSettings } from "@/types/database";

export interface PlaceOrderItem {
  productId: string;
  variantId: string | null;
  name: string;
  colour: string | null;
  size: string | null;
  quantity: number;
  price: number;
  image?: string | null;
}

export interface PlaceOrderPayload {
  orderNumber: string;
  customerEmail: string;
  customerName: string;
  customerPhone: string;
  shippingAddress: ShippingAddress;
  subtotal: number;
  notes: string | null;
  items: PlaceOrderItem[];
}

export async function placeOrder(
  payload: PlaceOrderPayload
): Promise<{ success: true; orderId: string } | { success: false; error: string }> {
  try {
    const supabase = createAdminClient();

    const { data: order, error } = await supabase
      .from("orders")
      .insert({
        order_number: payload.orderNumber,
        customer_email: payload.customerEmail,
        customer_name: payload.customerName,
        customer_phone: payload.customerPhone,
        shipping_address: payload.shippingAddress,
        subtotal: payload.subtotal,
        shipping_amount: 0,
        discount_amount: 0,
        total: payload.subtotal,
        payment_status: "pending",
        order_status: "pending",
        notes: payload.notes,
      })
      .select("id")
      .single();

    if (error || !order) {
      console.error(
        "[placeOrder] orders insert error:",
        error?.message,
        error?.code,
        error?.details,
        error?.hint
      );
      return { success: false, error: error?.message ?? "Unknown error inserting order" };
    }

    const { error: itemsError } = await supabase.from("order_items").insert(
      payload.items.map((item) => ({
        order_id: order.id,
        product_id: item.productId,
        variant_id: item.variantId,
        product_name: item.name,
        variant_info: { colour: item.colour, size: item.size, image: item.image || null },
        quantity: item.quantity,
        unit_price: item.price,
        total_price: item.price * item.quantity,
      }))
    );

    if (itemsError) {
      console.error(
        "[placeOrder] order_items insert error:",
        itemsError?.message,
        itemsError?.code
      );
    }

    revalidatePath("/admin/orders");
    revalidatePath("/admin/dashboard");

    return { success: true, orderId: order.id };
  } catch (err) {
    console.error("[placeOrder] unexpected error:", err);
    return { success: false, error: String(err) };
  }
}

export async function getWhatsAppSettingsAction(): Promise<WhatsAppSettings | null> {
  try {
    const supabase = createAdminClient();
    const { data } = await supabase
      .from("site_settings")
      .select("value")
      .eq("key", "whatsapp")
      .single();
    return (data?.value as WhatsAppSettings) || null;
  } catch {
    return null;
  }
}
