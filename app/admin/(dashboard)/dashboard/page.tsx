import { adminGetDashboardStats } from "@/lib/queries";
import { formatPrice, formatDate } from "@/lib/utils/format";
import Link from "next/link";
import { TrendingUp, ShoppingCart, Package, AlertTriangle, ArrowUpRight, Plus, Film, Image as ImageIcon, Sparkles, Home, Grid3X3, FolderOpen, BookOpen, Settings } from "lucide-react";
import OrderStatusBadge from "@/components/admin/OrderStatusBadge";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function AdminDashboard() {
  const stats = await adminGetDashboardStats();

  const statCards = [
    {
      label: "TOTAL REVENUE",
      value: formatPrice(stats.totalRevenue),
      icon: TrendingUp,
      change: "+18.2%",
      color: "text-emerald-700",
      bg: "bg-emerald-50/50",
    },
    {
      label: "TOTAL ORDERS",
      value: stats.orderCount.toString(),
      icon: ShoppingCart,
      change: "Active",
      color: "text-navy",
      bg: "bg-navy/5",
    },
    {
      label: "ACTIVE PRODUCTS",
      value: stats.productCount.toString(),
      icon: Package,
      change: "In Catalog",
      color: "text-navy",
      bg: "bg-navy/5",
    },
  ];

  return (
    <div className="space-y-8 pb-12">
      {/* Top Banner / Welcome */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-[#D8C8AF40]">
        <div>
          <h1
            style={{
              fontFamily: "var(--font-cormorant)",
              fontSize: "2.25rem",
              fontWeight: 400,
              color: "#172744",
              letterSpacing: "-0.01em",
            }}
          >
            Maison Overview
          </h1>
          <p className="text-xs text-charcoal/60 mt-0.5" style={{ fontFamily: "var(--font-inter)" }}>
            Real-time store telemetry, sales metrics and inventory tracking.
          </p>
        </div>

        {/* Quick Action Buttons */}
        <div className="flex items-center gap-3">
          <Link
            href="/admin/products/new"
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-[#172744] text-[#F8F6F0] hover:bg-[#101C32] transition-colors text-xs font-medium uppercase tracking-wider rounded-sm shadow-sm"
            style={{ fontFamily: "var(--font-inter)" }}
          >
            <Plus size={14} /> New Product
          </Link>
          <Link
            href="/admin/homepage"
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-white border border-[#D8C8AF] text-[#172744] hover:border-[#172744] transition-colors text-xs font-medium uppercase tracking-wider rounded-sm shadow-sm"
            style={{ fontFamily: "var(--font-inter)" }}
          >
            <Home size={14} /> Homepage CMS
          </Link>
          <Link
            href="/admin/hero"
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-white border border-[#D8C8AF] text-[#172744] hover:border-[#172744] transition-colors text-xs font-medium uppercase tracking-wider rounded-sm shadow-sm"
            style={{ fontFamily: "var(--font-inter)" }}
          >
            <Film size={14} /> Edit Hero
          </Link>
        </div>
      </div>

      {/* 1. Stat Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {statCards.map((card) => {
          const Icon = card.icon;
          return (
            <div
              key={card.label}
              className="bg-white border border-[#D8C8AF] p-5 rounded-sm shadow-sm flex flex-col justify-between hover:border-[#172744] transition-colors"
            >
              <div className="flex items-start justify-between mb-3">
                <span
                  className="text-[10px] font-semibold tracking-wider text-[#172744]/60 uppercase"
                  style={{ fontFamily: "var(--font-inter)" }}
                >
                  {card.label}
                </span>
                <div className={`p-2 rounded-sm ${card.bg}`}>
                  <Icon size={14} className={card.color} />
                </div>
              </div>

              <div>
                <p
                  className="text-2xl text-[#172744] font-serif font-normal leading-none mb-2"
                  style={{ fontFamily: "var(--font-cormorant)" }}
                >
                  {card.value}
                </p>
                <span className="text-[11px] text-charcoal/50" style={{ fontFamily: "var(--font-inter)" }}>
                  {card.change}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* 2. Main Content Grid: Recent Orders & Inventory Alerts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left 2 Cols: Recent Orders */}
        <div className="lg:col-span-2 bg-white border border-[#D8C8AF] rounded-sm p-6 shadow-sm">
          <div className="flex items-center justify-between mb-5 pb-3 border-b border-[#D8C8AF30]">
            <div>
              <h2 className="text-xs font-semibold tracking-widest text-[#172744] uppercase" style={{ fontFamily: "var(--font-inter)" }}>
                RECENT ORDERS
              </h2>
              <p className="text-[11px] text-charcoal/50 mt-0.5">Latest client purchases requiring fulfillment</p>
            </div>
            <Link
              href="/admin/orders"
              className="text-xs text-[#172744] hover:text-[#B9A77A] flex items-center gap-1 uppercase tracking-wider font-semibold"
              style={{ fontFamily: "var(--font-inter)" }}
            >
              View All <ArrowUpRight size={13} />
            </Link>
          </div>

          {stats.recentOrders.length === 0 ? (
            <div className="py-14 text-center text-charcoal/40 text-xs uppercase tracking-wider">
              No orders placed yet.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-[#D8C8AF30] text-[10px] uppercase tracking-wider text-[#172744]/60 font-semibold">
                    <th className="pb-2.5">Order</th>
                    <th className="pb-2.5">Client</th>
                    <th className="pb-2.5">Total</th>
                    <th className="pb-2.5">Status</th>
                    <th className="pb-2.5 text-right">Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#D8C8AF20] text-sm" style={{ fontFamily: "var(--font-inter)" }}>
                  {stats.recentOrders.map((order: any) => (
                    <tr key={order.id} className="hover:bg-[#F8F6F0]/80 transition-colors">
                      <td className="py-3 font-medium text-[#172744]">
                        <Link href={`/admin/orders/${order.id}`} className="hover:underline">
                          {order.order_number}
                        </Link>
                      </td>
                      <td className="py-3 text-xs text-charcoal/80">
                        {order.customer_name}
                      </td>
                      <td className="py-3 font-medium text-[#172744] text-xs">
                        {formatPrice(order.total)}
                      </td>
                      <td className="py-3">
                        <OrderStatusBadge status={order.order_status} type="order" />
                      </td>
                      <td className="py-3 text-right text-xs text-charcoal/50">
                        {formatDate(order.created_at)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Right 1 Col: Low Stock & Quick Links */}
        <div className="space-y-6">
          {/* Low Stock Alerts */}
          <div className="bg-white border border-[#D8C8AF] rounded-sm p-6 shadow-sm">
            <div className="flex items-center gap-2 mb-4 pb-3 border-b border-[#D8C8AF30]">
              <AlertTriangle size={15} className="text-amber-600" />
              <h2 className="text-xs font-semibold tracking-widest text-[#172744] uppercase" style={{ fontFamily: "var(--font-inter)" }}>
                INVENTORY WATCH ({stats.lowStockProducts.length})
              </h2>
            </div>

            {stats.lowStockProducts.length === 0 ? (
              <div className="py-8 text-center text-xs text-charcoal/50">
                All garments have sufficient inventory.
              </div>
            ) : (
              <div className="divide-y divide-[#D8C8AF20] space-y-2">
                {stats.lowStockProducts.slice(0, 5).map((p: any) => (
                  <div key={p.id} className="pt-2 flex items-center justify-between text-xs">
                    <div>
                      <p className="font-medium text-[#172744]">{p.name}</p>
                      <p className="text-[10px] text-charcoal/40">SKU: {p.sku || "N/A"}</p>
                    </div>
                    <span className="px-2 py-0.5 bg-amber-50 text-amber-700 font-semibold rounded text-[11px]">
                      {p.stock_quantity} left
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Quick CMS Shortcuts */}
          <div className="bg-white border border-[#D8C8AF] rounded-sm p-6 shadow-sm space-y-3">
            <h2 className="text-xs font-semibold tracking-widest text-[#172744] uppercase mb-2 pb-2 border-b border-[#D8C8AF30]" style={{ fontFamily: "var(--font-inter)" }}>
              QUICK EDITORS
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs" style={{ fontFamily: "var(--font-inter)" }}>
              <Link href="/admin/homepage" className="p-3 bg-[#F8F6F0] rounded hover:bg-[#172744] hover:text-white transition-colors flex flex-col items-center text-center gap-1 font-medium">
                <Home size={14} />
                <span>Homepage CMS</span>
              </Link>
              <Link href="/admin/hero" className="p-3 bg-[#F8F6F0] rounded hover:bg-[#172744] hover:text-white transition-colors flex flex-col items-center text-center gap-1 font-medium">
                <Film size={14} />
                <span>Hero Video</span>
              </Link>
              <Link href="/admin/collections" className="p-3 bg-[#F8F6F0] rounded hover:bg-[#172744] hover:text-white transition-colors flex flex-col items-center text-center gap-1 font-medium">
                <Grid3X3 size={14} />
                <span>Collections</span>
              </Link>
              <Link href="/admin/categories" className="p-3 bg-[#F8F6F0] rounded hover:bg-[#172744] hover:text-white transition-colors flex flex-col items-center text-center gap-1 font-medium">
                <FolderOpen size={14} />
                <span>Categories</span>
              </Link>
              <Link href="/admin/journal" className="p-3 bg-[#F8F6F0] rounded hover:bg-[#172744] hover:text-white transition-colors flex flex-col items-center text-center gap-1 font-medium">
                <BookOpen size={14} />
                <span>Maison Journal</span>
              </Link>
              <Link href="/admin/settings" className="p-3 bg-[#F8F6F0] rounded hover:bg-[#172744] hover:text-white transition-colors flex flex-col items-center text-center gap-1 font-medium">
                <Settings size={14} />
                <span>Site Settings</span>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
