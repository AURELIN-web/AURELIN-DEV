import { createClient } from "@/utils/supabase/server";
import { formatPrice, formatDate } from "@/lib/utils/format";
import Link from "next/link";
import OrderStatusBadge from "@/components/admin/OrderStatusBadge";

export default async function AdminOrdersPage() {
  const supabase = await createClient();
  const { data: orders } = await supabase
    .from("orders")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(50);

  return (
    <div className="space-y-6">
      <div>
        <h1 style={{ fontFamily: "var(--font-cormorant)", fontSize: "1.75rem", fontWeight: 400, color: "#172744" }}>
          Orders
        </h1>
        <p className="mt-0.5 opacity-50" style={{ fontFamily: "var(--font-inter)", fontSize: "0.8125rem" }}>
          {orders?.length || 0} orders
        </p>
      </div>

      <div style={{ backgroundColor: "#F8F6F0", border: "1px solid #D8C8AF40" }}>
        {!orders || orders.length === 0 ? (
          <div className="py-16 text-center">
            <p className="opacity-40" style={{ fontFamily: "var(--font-inter)", fontSize: "0.875rem" }}>No orders yet.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr style={{ borderBottom: "1px solid #D8C8AF40" }}>
                  {["Order #", "Customer", "Date", "Amount", "Payment", "Status", ""].map((h) => (
                    <th
                      key={h}
                      className="text-left px-4 py-3"
                      style={{ fontFamily: "var(--font-inter)", fontSize: "0.5625rem", letterSpacing: "0.16em", textTransform: "uppercase", color: "#172744", opacity: 0.5, fontWeight: 600 }}
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {orders.map((order) => (
                  <tr
                    key={order.id}
                    className="border-b hover:bg-beige/10 transition-colors"
                    style={{ borderColor: "#D8C8AF20" }}
                  >
                    <td className="px-4 py-3.5">
                      <span style={{ fontFamily: "var(--font-inter)", fontSize: "0.875rem", fontWeight: 500, color: "#172744" }}>
                        {order.order_number}
                      </span>
                    </td>
                    <td className="px-4 py-3.5">
                      <p style={{ fontFamily: "var(--font-inter)", fontSize: "0.875rem", color: "#242424" }}>{order.customer_name}</p>
                      <p className="opacity-40" style={{ fontFamily: "var(--font-inter)", fontSize: "0.75rem" }}>{order.customer_email}</p>
                    </td>
                    <td className="px-4 py-3.5">
                      <span className="opacity-50" style={{ fontFamily: "var(--font-inter)", fontSize: "0.8125rem" }}>
                        {formatDate(order.created_at)}
                      </span>
                    </td>
                    <td className="px-4 py-3.5">
                      <span style={{ fontFamily: "var(--font-inter)", fontSize: "0.875rem", fontWeight: 500, color: "#172744" }}>
                        {formatPrice(order.total)}
                      </span>
                    </td>
                    <td className="px-4 py-3.5">
                      <OrderStatusBadge status={order.payment_status} type="payment" />
                    </td>
                    <td className="px-4 py-3.5">
                      <OrderStatusBadge status={order.order_status} type="order" />
                    </td>
                    <td className="px-4 py-3.5">
                      <Link
                        href={`/admin/orders/${order.id}`}
                        className="opacity-50 hover:opacity-100 transition-opacity"
                        style={{ fontFamily: "var(--font-inter)", fontSize: "0.6875rem", letterSpacing: "0.12em", textTransform: "uppercase", color: "#172744" }}
                      >
                        VIEW →
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
