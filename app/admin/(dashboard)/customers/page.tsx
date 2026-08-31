import { createClient } from "@/utils/supabase/server";
import { formatDate } from "@/lib/utils/format";

export default async function AdminCustomersPage() {
  const supabase = await createClient();
  const { data: customers } = await supabase
    .from("profiles")
    .select("*")
    .eq("role", "customer")
    .order("created_at", { ascending: false });

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 style={{ fontFamily: "var(--font-cormorant)", fontSize: "1.75rem", fontWeight: 400, color: "#172744" }}>
          Customers
        </h1>
        <p className="mt-0.5 opacity-50" style={{ fontFamily: "var(--font-inter)", fontSize: "0.8125rem" }}>
          {customers?.length || 0} registered clients
        </p>
      </div>

      <div className="bg-ivory border border-beige/40">
        {!customers || customers.length === 0 ? (
          <div className="py-16 text-center opacity-40 text-sm">No registered customers yet.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-beige/40">
                  {["Name", "Email", "Phone", "Joined"].map((h) => (
                    <th
                      key={h}
                      className="text-left px-4 py-3 label-uppercase text-xs tracking-wider text-navy/60 font-semibold"
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-beige/20">
                {customers.map((c) => (
                  <tr key={c.id} className="hover:bg-beige/10 transition-colors">
                    <td className="px-4 py-3.5 font-medium text-navy text-sm" style={{ fontFamily: "var(--font-inter)" }}>
                      {c.full_name || "—"}
                    </td>
                    <td className="px-4 py-3.5 text-sm opacity-80" style={{ fontFamily: "var(--font-inter)" }}>
                      {c.email}
                    </td>
                    <td className="px-4 py-3.5 text-sm opacity-80" style={{ fontFamily: "var(--font-inter)" }}>
                      {c.phone || "—"}
                    </td>
                    <td className="px-4 py-3.5 text-xs opacity-50" style={{ fontFamily: "var(--font-inter)" }}>
                      {formatDate(c.created_at)}
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
