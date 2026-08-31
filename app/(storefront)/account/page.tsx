import { redirect } from "next/navigation";
import { createClient } from "@/utils/supabase/server";
import { formatPrice, formatDate } from "@/lib/utils/format";
import Link from "next/link";
import OrderStatusBadge from "@/components/admin/OrderStatusBadge";
import AccountSignOutButton from "@/components/storefront/AccountSignOutButton";

export default async function AccountPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login?next=/account");
  }

  const [{ data: profile }, { data: orders }] = await Promise.all([
    supabase.from("profiles").select("*").eq("id", user.id).single(),
    supabase
      .from("orders")
      .select("*, order_items(*)")
      .eq("customer_email", user.email || "")
      .order("created_at", { ascending: false }),
  ]);

  return (
    <div className="container-luxury py-12 md:py-16">
      <div className="flex flex-col md:flex-row items-start justify-between gap-4 mb-10 pb-6 border-b border-beige/40">
        <div>
          <p
            className="mb-1 opacity-60"
            style={{
              fontFamily: "var(--font-inter)",
              fontSize: "0.625rem",
              letterSpacing: "0.2em",
              textTransform: "uppercase",
              color: "#B9A77A",
            }}
          >
            CLIENT PORTAL
          </p>
          <h1
            style={{
              fontFamily: "var(--font-cormorant)",
              fontSize: "clamp(2rem, 4vw, 2.75rem)",
              fontWeight: 400,
              color: "#172744",
            }}
          >
            Welcome, {profile?.full_name || user.email?.split("@")[0]}
          </h1>
        </div>
        <AccountSignOutButton />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Profile Card */}
        <div className="p-6 border border-beige/40 bg-ivory/50">
          <h2
            className="mb-4"
            style={{
              fontFamily: "var(--font-inter)",
              fontSize: "0.6875rem",
              letterSpacing: "0.18em",
              textTransform: "uppercase",
              color: "#172744",
              fontWeight: 600,
            }}
          >
            PROFILE DETAILS
          </h2>
          <div className="space-y-3 opacity-80" style={{ fontFamily: "var(--font-inter)", fontSize: "0.875rem" }}>
            <div>
              <p className="text-xs opacity-50 uppercase tracking-wider">Name</p>
              <p className="font-medium text-navy">{profile?.full_name || "—"}</p>
            </div>
            <div>
              <p className="text-xs opacity-50 uppercase tracking-wider">Email</p>
              <p className="font-medium text-navy">{user.email}</p>
            </div>
            <div>
              <p className="text-xs opacity-50 uppercase tracking-wider">Phone</p>
              <p className="font-medium text-navy">{profile?.phone || "—"}</p>
            </div>
          </div>
        </div>

        {/* Orders List */}
        <div className="lg:col-span-2 p-6 border border-beige/40 bg-ivory">
          <h2
            className="mb-6"
            style={{
              fontFamily: "var(--font-inter)",
              fontSize: "0.6875rem",
              letterSpacing: "0.18em",
              textTransform: "uppercase",
              color: "#172744",
              fontWeight: 600,
            }}
          >
            ORDER HISTORY ({orders?.length || 0})
          </h2>

          {!orders || orders.length === 0 ? (
            <div className="py-12 text-center">
              <p
                className="opacity-50 mb-4"
                style={{ fontFamily: "var(--font-inter)", fontSize: "0.875rem" }}
              >
                You haven&apos;t placed any orders yet.
              </p>
              <Link
                href="/shop"
                className="inline-block px-6 py-3 border border-navy text-navy hover:bg-navy hover:text-ivory transition-colors"
                style={{
                  fontFamily: "var(--font-inter)",
                  fontSize: "0.6875rem",
                  letterSpacing: "0.16em",
                  textTransform: "uppercase",
                }}
              >
                DISCOVER OUR PIECES
              </Link>
            </div>
          ) : (
            <div className="divide-y divide-beige/30">
              {orders.map((order) => (
                <div key={order.id} className="py-4 flex flex-col md:flex-row justify-between gap-3">
                  <div>
                    <p className="font-medium text-navy" style={{ fontFamily: "var(--font-inter)", fontSize: "0.9375rem" }}>
                      {order.order_number}
                    </p>
                    <p className="opacity-50 text-xs" style={{ fontFamily: "var(--font-inter)" }}>
                      {formatDate(order.created_at)} · {order.order_items?.length || 0} item(s)
                    </p>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="font-medium text-navy" style={{ fontFamily: "var(--font-inter)", fontSize: "0.9375rem" }}>
                      {formatPrice(order.total)}
                    </span>
                    <OrderStatusBadge status={order.order_status} type="order" />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
