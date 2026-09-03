import { notFound } from "next/navigation";
import { createAdminClient } from "@/utils/supabase/admin";
import { formatPrice, formatDate } from "@/lib/utils/format";
import Link from "next/link";
import OrderStatusSelector from "@/components/admin/OrderStatusSelector";
import { ChevronLeft, MessageCircle, Image as ImageIcon } from "lucide-react";

export const dynamic = "force-dynamic";
export const revalidate = 0;

interface Props {
  params: Promise<{ id: string }>;
}

export default async function AdminOrderDetailPage({ params }: Props) {
  const { id } = await params;
  const supabase = createAdminClient();

  const { data: order } = await supabase
    .from("orders")
    .select("*, order_items(*)")
    .eq("id", id)
    .single();

  if (!order) notFound();

  // Fetch product images for all items
  const productIds = Array.from(
    new Set((order.order_items || []).map((item: any) => item.product_id).filter(Boolean))
  );

  let productMap: Record<string, any> = {};
  if (productIds.length > 0) {
    const { data: prods } = await supabase
      .from("products")
      .select("id, primary_image_url, name, slug")
      .in("id", productIds);
    (prods || []).forEach((p: any) => {
      productMap[p.id] = p;
    });
  }

  const shipping = order.shipping_address as any;

  return (
    <div className="space-y-8 max-w-4xl">
      <div className="flex items-center justify-between">
        <div>
          <Link
            href="/admin/orders"
            className="inline-flex items-center gap-1 opacity-50 hover:opacity-100 mb-2 label-uppercase text-xs tracking-widest text-navy transition-opacity"
          >
            <ChevronLeft size={13} /> BACK TO ORDERS
          </Link>
          <h1
            style={{
              fontFamily: "var(--font-cormorant)",
              fontSize: "1.75rem",
              fontWeight: 400,
              color: "#172744",
            }}
          >
            Order {order.order_number}
          </h1>
          <p className="mt-0.5 opacity-50" style={{ fontFamily: "var(--font-inter)", fontSize: "0.8125rem" }}>
            Placed on {formatDate(order.created_at)}
          </p>
        </div>

        {order.customer_phone && (
          <a
            href={`https://wa.me/${order.customer_phone.replace(/\D/g, "")}?text=Hello%20${encodeURIComponent(order.customer_name)}%2C%20regarding%20your%20AURELIN%20order%20${order.order_number}%3A`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 px-4 py-2.5 bg-navy text-ivory label-uppercase text-xs tracking-wider"
          >
            <MessageCircle size={14} /> WhatsApp Customer
          </a>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left 2 Cols: Order Details */}
        <div className="md:col-span-2 space-y-6">
          {/* Items */}
          <div className="p-6 bg-ivory border border-beige/40">
            <h2 className="label-uppercase text-navy text-xs font-semibold tracking-wider mb-4">
              ORDER ITEMS ({order.order_items?.length || 0})
            </h2>
            <div className="divide-y divide-beige/30">
              {order.order_items?.map((item: any) => {
                const imageUrl =
                  item.variant_info?.image ||
                  productMap[item.product_id]?.primary_image_url ||
                  null;

                return (
                  <div key={item.id} className="py-3.5 flex justify-between items-center gap-4">
                    <div className="flex items-center gap-3.5 min-w-0">
                      {/* Product Image Thumbnail */}
                      <div className="relative w-14 h-16 bg-[#172744]/5 rounded-sm overflow-hidden flex-shrink-0 border border-[#D8C8AF]/60">
                        {imageUrl ? (
                          <img
                            src={imageUrl}
                            alt={item.product_name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-charcoal/30">
                            <ImageIcon size={18} />
                          </div>
                        )}
                      </div>

                      <div className="min-w-0">
                        <p className="font-medium text-[#172744] text-sm leading-snug" style={{ fontFamily: "var(--font-inter)" }}>
                          {item.product_name}
                        </p>
                        {item.variant_info && (
                          <p className="opacity-60 text-xs mt-0.5" style={{ fontFamily: "var(--font-inter)" }}>
                            {Object.entries(item.variant_info)
                              .filter(([k, v]) => v && k !== "image")
                              .map(([k, v]) => `${k}: ${v}`)
                              .join(" / ")}
                          </p>
                        )}
                        <p className="opacity-60 text-xs mt-1" style={{ fontFamily: "var(--font-inter)" }}>
                          Qty: {item.quantity} × {formatPrice(item.unit_price)}
                        </p>
                      </div>
                    </div>

                    <span className="font-semibold text-[#172744] text-sm flex-shrink-0" style={{ fontFamily: "var(--font-inter)" }}>
                      {formatPrice(item.total_price)}
                    </span>
                  </div>
                );
              })}
            </div>

            <div className="border-t border-beige/40 pt-4 mt-4 space-y-2 text-sm" style={{ fontFamily: "var(--font-inter)" }}>
              <div className="flex justify-between opacity-70">
                <span>Subtotal</span>
                <span>{formatPrice(order.subtotal)}</span>
              </div>
              <div className="flex justify-between opacity-70">
                <span>Shipping</span>
                <span>{order.shipping_amount ? formatPrice(order.shipping_amount) : "Complimentary"}</span>
              </div>
              <div className="flex justify-between font-semibold text-navy text-base pt-2 border-t border-beige/30">
                <span>Total</span>
                <span>{formatPrice(order.total)}</span>
              </div>
            </div>
          </div>

          {/* Shipping Details */}
          <div className="p-6 bg-ivory border border-beige/40">
            <h2 className="label-uppercase text-navy text-xs font-semibold tracking-wider mb-4">
              SHIPPING ADDRESS
            </h2>
            <div className="text-sm opacity-80 space-y-1" style={{ fontFamily: "var(--font-inter)" }}>
              <p className="font-medium text-navy">{shipping?.full_name || order.customer_name}</p>
              <p>{shipping?.address_line1}</p>
              {shipping?.address_line2 && <p>{shipping.address_line2}</p>}
              <p>{shipping?.city}, {shipping?.state} {shipping?.postal_code}</p>
              <p>{shipping?.country}</p>
              <p className="mt-2 text-xs opacity-60">Phone: {shipping?.phone || order.customer_phone || "—"}</p>
            </div>
          </div>
        </div>

        {/* Right Col: Status Management */}
        <div className="space-y-6">
          <OrderStatusSelector
            orderId={order.id}
            initialOrderStatus={order.order_status}
            initialPaymentStatus={order.payment_status}
          />
        </div>
      </div>
    </div>
  );
}
