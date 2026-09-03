"use client";

import { useState } from "react";
import Link from "next/link";
import { formatPrice, formatDate } from "@/lib/utils/format";
import OrderStatusBadge from "@/components/admin/OrderStatusBadge";
import { toast } from "sonner";
import { ShoppingCart, Clock, CheckCircle2, Loader2 } from "lucide-react";
import type { Order } from "@/types/database";

interface Props {
  initialOrders: Order[];
}

const STATUS_OPTIONS = [
  { value: "pending", label: "Pending" },
  { value: "processing", label: "Processing" },
  { value: "shipped", label: "Shipped" },
  { value: "completed", label: "Completed" },
];

export default function AdminOrdersManager({ initialOrders }: Props) {
  const [orders, setOrders] = useState<Order[]>(initialOrders);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const totalOrders = orders.length;
  const pendingOrders = orders.filter((o) => o.order_status === "pending").length;
  const completedOrders = orders.filter(
    (o) => o.order_status === "completed" || o.order_status === "delivered"
  ).length;

  const handleStatusChange = async (orderId: string, newStatus: string) => {
    const originalOrders = [...orders];
    setUpdatingId(orderId);

    // Optimistic update
    setOrders((prev) =>
      prev.map((o) => (o.id === orderId ? { ...o, order_status: newStatus as any } : o))
    );

    try {
      const res = await fetch("/api/admin/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: orderId,
          order_status: newStatus,
        }),
      });
      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to update order status");
      }

      toast.success(`Order status updated to ${newStatus}`);
    } catch (err: any) {
      // Revert on error
      setOrders(originalOrders);
      toast.error(err.message || "Failed to update order status");
    } finally {
      setUpdatingId(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* 1. Header with Stats Cards */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-[#D8C8AF40]">
        <div>
          <h1
            style={{
              fontFamily: "var(--font-cormorant)",
              fontSize: "2rem",
              fontWeight: 400,
              color: "#172744",
              letterSpacing: "-0.01em",
            }}
          >
            Orders Management
          </h1>
          <p className="text-xs text-charcoal/60 mt-0.5" style={{ fontFamily: "var(--font-inter)" }}>
            Review customer purchases, manage fulfillment, and update real-time status.
          </p>
        </div>
      </div>

      {/* Top 3 Stat Cards: Total Orders, Pending Orders, Completed Orders */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Total Orders */}
        <div className="bg-white border border-[#D8C8AF] p-5 rounded-sm shadow-sm flex items-center justify-between">
          <div>
            <p
              className="text-[10px] font-semibold tracking-wider text-[#172744]/60 uppercase"
              style={{ fontFamily: "var(--font-inter)" }}
            >
              Total Orders
            </p>
            <p
              className="text-3xl text-[#172744] font-serif font-normal mt-1"
              style={{ fontFamily: "var(--font-cormorant)" }}
            >
              {totalOrders}
            </p>
            <p className="text-[11px] text-charcoal/50 mt-0.5" style={{ fontFamily: "var(--font-inter)" }}>
              All client bookings
            </p>
          </div>
          <div className="p-3 rounded-sm bg-[#172744]/5 text-[#172744]">
            <ShoppingCart size={20} />
          </div>
        </div>

        {/* Pending Orders */}
        <div className="bg-white border border-[#D8C8AF] p-5 rounded-sm shadow-sm flex items-center justify-between">
          <div>
            <p
              className="text-[10px] font-semibold tracking-wider text-amber-700/80 uppercase"
              style={{ fontFamily: "var(--font-inter)" }}
            >
              Pending Orders
            </p>
            <p
              className="text-3xl text-amber-700 font-serif font-normal mt-1"
              style={{ fontFamily: "var(--font-cormorant)" }}
            >
              {pendingOrders}
            </p>
            <p className="text-[11px] text-charcoal/50 mt-0.5" style={{ fontFamily: "var(--font-inter)" }}>
              Awaiting confirmation / action
            </p>
          </div>
          <div className="p-3 rounded-sm bg-amber-50 text-amber-700">
            <Clock size={20} />
          </div>
        </div>

        {/* Completed Orders */}
        <div className="bg-white border border-[#D8C8AF] p-5 rounded-sm shadow-sm flex items-center justify-between">
          <div>
            <p
              className="text-[10px] font-semibold tracking-wider text-emerald-700/80 uppercase"
              style={{ fontFamily: "var(--font-inter)" }}
            >
              Completed Orders
            </p>
            <p
              className="text-3xl text-emerald-700 font-serif font-normal mt-1"
              style={{ fontFamily: "var(--font-cormorant)" }}
            >
              {completedOrders}
            </p>
            <p className="text-[11px] text-charcoal/50 mt-0.5" style={{ fontFamily: "var(--font-inter)" }}>
              Delivered & fulfilled
            </p>
          </div>
          <div className="p-3 rounded-sm bg-emerald-50 text-emerald-700">
            <CheckCircle2 size={20} />
          </div>
        </div>
      </div>

      {/* 2. Orders Table */}
      <div className="bg-white border border-[#D8C8AF] rounded-sm shadow-sm overflow-hidden">
        {orders.length === 0 ? (
          <div className="py-16 text-center space-y-2">
            <ShoppingCart size={32} className="mx-auto text-charcoal/30 mb-2" />
            <p className="opacity-60 text-sm" style={{ fontFamily: "var(--font-inter)" }}>
              No orders placed yet.
            </p>
            <p className="text-xs text-charcoal/40 max-w-sm mx-auto">
              When a customer completes checkout on the storefront, their order will immediately appear here.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-[#D8C8AF40] bg-[#F8F6F0]/60">
                  {["Order #", "Customer", "Date", "Amount", "Payment", "Order Status", "Actions"].map((h) => (
                    <th
                      key={h}
                      className="px-4 py-3.5"
                      style={{
                        fontFamily: "var(--font-inter)",
                        fontSize: "0.5625rem",
                        letterSpacing: "0.16em",
                        textTransform: "uppercase",
                        color: "#172744",
                        opacity: 0.6,
                        fontWeight: 600,
                      }}
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-[#D8C8AF20]">
                {orders.map((order) => {
                  const isUpdating = updatingId === order.id;
                  const currentStatus =
                    order.order_status === "delivered" ? "completed" : order.order_status;

                  return (
                    <tr
                      key={order.id}
                      className="hover:bg-[#F8F6F0]/60 transition-colors"
                      style={{ borderColor: "#D8C8AF20" }}
                    >
                      {/* Order Number */}
                      <td className="px-4 py-3.5">
                        <Link
                          href={`/admin/orders/${order.id}`}
                          className="hover:underline"
                          style={{
                            fontFamily: "var(--font-inter)",
                            fontSize: "0.875rem",
                            fontWeight: 600,
                            color: "#172744",
                          }}
                        >
                          {order.order_number}
                        </Link>
                      </td>

                      {/* Customer */}
                      <td className="px-4 py-3.5">
                        <p
                          className="font-medium text-xs text-[#242424]"
                          style={{ fontFamily: "var(--font-inter)" }}
                        >
                          {order.customer_name}
                        </p>
                        <p className="opacity-50 text-[11px]" style={{ fontFamily: "var(--font-inter)" }}>
                          {order.customer_email}
                        </p>
                        {order.customer_phone && (
                          <p className="opacity-40 text-[10px]" style={{ fontFamily: "var(--font-inter)" }}>
                            {order.customer_phone}
                          </p>
                        )}
                      </td>

                      {/* Date */}
                      <td className="px-4 py-3.5">
                        <span className="opacity-60 text-xs" style={{ fontFamily: "var(--font-inter)" }}>
                          {formatDate(order.created_at)}
                        </span>
                      </td>

                      {/* Amount */}
                      <td className="px-4 py-3.5">
                        <span
                          style={{
                            fontFamily: "var(--font-inter)",
                            fontSize: "0.875rem",
                            fontWeight: 600,
                            color: "#172744",
                          }}
                        >
                          {formatPrice(order.total)}
                        </span>
                      </td>

                      {/* Payment */}
                      <td className="px-4 py-3.5">
                        <OrderStatusBadge status={order.payment_status} type="payment" />
                      </td>

                      {/* Interactive Order Status Dropdown */}
                      <td className="px-4 py-3.5">
                        <div className="flex items-center gap-2">
                          <select
                            value={currentStatus}
                            disabled={isUpdating}
                            onChange={(e) => handleStatusChange(order.id, e.target.value)}
                            className="px-2.5 py-1 text-xs font-medium rounded-sm border border-[#D8C8AF] bg-white text-[#172744] hover:border-[#172744] outline-none transition-colors cursor-pointer disabled:opacity-50"
                            style={{ fontFamily: "var(--font-inter)" }}
                          >
                            {STATUS_OPTIONS.map((opt) => (
                              <option key={opt.value} value={opt.value}>
                                {opt.label}
                              </option>
                            ))}
                            {/* If current status is not in standard list (e.g. cancelled/returned) */}
                            {!STATUS_OPTIONS.some((o) => o.value === currentStatus) && (
                              <option value={order.order_status}>
                                {order.order_status.charAt(0).toUpperCase() + order.order_status.slice(1)}
                              </option>
                            )}
                          </select>
                          {isUpdating && <Loader2 size={13} className="animate-spin text-[#172744]" />}
                        </div>
                      </td>

                      {/* View Link */}
                      <td className="px-4 py-3.5">
                        <Link
                          href={`/admin/orders/${order.id}`}
                          className="opacity-60 hover:opacity-100 transition-opacity font-semibold"
                          style={{
                            fontFamily: "var(--font-inter)",
                            fontSize: "0.6875rem",
                            letterSpacing: "0.12em",
                            textTransform: "uppercase",
                            color: "#172744",
                          }}
                        >
                          VIEW →
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
