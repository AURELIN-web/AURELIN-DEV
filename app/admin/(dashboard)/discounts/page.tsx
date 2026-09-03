"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/utils/supabase/client";
import { toast } from "sonner";
import { Plus, Save, Trash2 } from "lucide-react";
import { formatPrice } from "@/lib/utils/format";
import type { Discount } from "@/types/database";
import DeleteConfirmModal from "@/components/admin/DeleteConfirmModal";

export default function AdminDiscountsPage() {
  const [discounts, setDiscounts] = useState<Discount[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    code: "",
    type: "percentage" as "percentage" | "fixed",
    value: "10",
    min_order_amount: "",
    is_active: true,
  });
  const [saving, setSaving] = useState(false);
  const [discountToDelete, setDiscountToDelete] = useState<Discount | null>(null);
  const [deleting, setDeleting] = useState(false);

  const load = async () => {
    try {
      const res = await fetch("/api/admin/discounts");
      const json = await res.json();
      if (json.success) {
        setDiscounts((json.data as Discount[]) || []);
      } else {
        const supabase = createClient();
        const { data } = await supabase.from("discounts").select("*").order("created_at", { ascending: false });
        setDiscounts((data as Discount[]) || []);
      }
    } catch {
      const supabase = createClient();
      const { data } = await supabase.from("discounts").select("*").order("created_at", { ascending: false });
      setDiscounts((data as Discount[]) || []);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const handleSave = async () => {
    if (!form.code) {
      toast.error("Code is required");
      return;
    }
    setSaving(true);
    const payload = {
      code: form.code.toUpperCase().trim(),
      type: form.type,
      value: parseFloat(form.value) || 0,
      min_order_amount: form.min_order_amount ? parseFloat(form.min_order_amount) : null,
      is_active: form.is_active,
    };

    try {
      const res = await fetch("/api/admin/discounts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const json = await res.json();
      if (json.success) {
        toast.success("Discount code created");
        setForm({ code: "", type: "percentage", value: "10", min_order_amount: "", is_active: true });
        setShowForm(false);
        load();
      } else {
        toast.error(json.error || "Failed to create discount");
      }
    } catch {
      toast.error("Failed to create discount");
    } finally {
      setSaving(false);
    }
  };

  const confirmDeleteDiscount = async () => {
    if (!discountToDelete) return;
    setDeleting(true);
    try {
      const res = await fetch(`/api/admin/discounts?id=${discountToDelete.id}`, {
        method: "DELETE",
      });
      const json = await res.json();
      if (json.success) {
        toast.success("Discount code deleted");
        setDiscountToDelete(null);
        load();
      } else {
        toast.error(json.error || "Failed to delete discount code");
      }
    } catch {
      toast.error("Failed to delete discount code");
    } finally {
      setDeleting(false);
    }
  };

  const inputStyle = { fontFamily: "var(--font-inter)", fontSize: "0.9375rem", color: "#242424", borderColor: "#D8C8AF" };
  const labelStyle = { fontFamily: "var(--font-inter)", fontSize: "0.5625rem", letterSpacing: "0.16em", textTransform: "uppercase" as const, color: "#172744", opacity: 0.6 };

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 style={{ fontFamily: "var(--font-cormorant)", fontSize: "1.75rem", fontWeight: 400, color: "#172744" }}>
            Discount Codes
          </h1>
          <p className="mt-0.5 opacity-50" style={{ fontFamily: "var(--font-inter)", fontSize: "0.8125rem" }}>
            Create promotional codes and VIP incentives.
          </p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center gap-2 px-5 py-2.5 bg-navy text-ivory label-uppercase text-xs tracking-wider hover:opacity-80"
        >
          <Plus size={13} /> ADD DISCOUNT
        </button>
      </div>

      {showForm && (
        <div className="p-6 bg-ivory border border-beige/40">
          <h2 className="label-uppercase text-navy text-xs font-semibold tracking-wider mb-5">
            NEW DISCOUNT CODE
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block mb-1.5" style={labelStyle}>Discount Code *</label>
              <input
                type="text"
                placeholder="GENTLEMAN10"
                value={form.code}
                onChange={(e) => setForm((f) => ({ ...f, code: e.target.value }))}
                className="w-full px-4 py-3 border outline-none bg-transparent uppercase"
                style={inputStyle}
              />
            </div>
            <div>
              <label className="block mb-1.5" style={labelStyle}>Discount Type</label>
              <select
                value={form.type}
                onChange={(e) => setForm((f) => ({ ...f, type: e.target.value as any }))}
                className="w-full px-4 py-3 border border-beige outline-none bg-transparent text-sm"
              >
                <option value="percentage">Percentage (%)</option>
                <option value="fixed">Fixed Amount (₹)</option>
              </select>
            </div>
            <div>
              <label className="block mb-1.5" style={labelStyle}>
                {form.type === "percentage" ? "Percentage Off (%)" : "Amount Off (₹)"} *
              </label>
              <input
                type="number"
                value={form.value}
                onChange={(e) => setForm((f) => ({ ...f, value: e.target.value }))}
                className="w-full px-4 py-3 border outline-none bg-transparent"
                style={inputStyle}
              />
            </div>
            <div>
              <label className="block mb-1.5" style={labelStyle}>Minimum Order Amount (₹)</label>
              <input
                type="number"
                placeholder="Optional"
                value={form.min_order_amount}
                onChange={(e) => setForm((f) => ({ ...f, min_order_amount: e.target.value }))}
                className="w-full px-4 py-3 border outline-none bg-transparent"
                style={inputStyle}
              />
            </div>
          </div>

          <label className="flex items-center gap-2 cursor-pointer mb-5">
            <input
              type="checkbox"
              checked={form.is_active}
              onChange={(e) => setForm((f) => ({ ...f, is_active: e.target.checked }))}
              className="w-4 h-4 accent-navy"
            />
            <span style={{ fontFamily: "var(--font-inter)", fontSize: "0.875rem" }}>Active</span>
          </label>

          <div className="flex gap-3">
            <button
              onClick={handleSave}
              disabled={saving}
              className="flex items-center gap-2 px-6 py-2.5 bg-navy text-ivory label-uppercase text-xs tracking-wider hover:opacity-80"
            >
              <Save size={13} /> {saving ? "SAVING..." : "CREATE CODE"}
            </button>
            <button
              onClick={() => setShowForm(false)}
              className="px-5 py-2.5 border border-beige label-uppercase text-xs tracking-wider"
            >
              CANCEL
            </button>
          </div>
        </div>
      )}

      <div className="bg-ivory border border-beige/40">
        {loading ? (
          <div className="py-10 text-center opacity-40">Loading...</div>
        ) : discounts.length === 0 ? (
          <div className="py-12 text-center opacity-40 text-sm">No discount codes created yet.</div>
        ) : (
          <ul className="divide-y divide-beige/20">
            {discounts.map((d) => (
              <li key={d.id} className="flex items-center justify-between px-5 py-4">
                <div>
                  <p className="font-semibold text-navy text-sm tracking-wider" style={{ fontFamily: "var(--font-inter)" }}>
                    {d.code}
                  </p>
                  <p className="opacity-60 text-xs" style={{ fontFamily: "var(--font-inter)" }}>
                    {d.type === "percentage" ? `${d.value}% Off` : `${formatPrice(d.value)} Off`}
                    {d.min_order_amount && ` · Min order: ${formatPrice(d.min_order_amount)}`}
                    {` · Used ${d.used_count || 0} times`}
                  </p>
                </div>
                <div className="flex items-center gap-4">
                  <span className="px-2 py-0.5 rounded-full text-xs font-semibold tracking-wider uppercase bg-navy/10 text-navy">
                    {d.is_active ? "Active" : "Inactive"}
                  </span>
                  <button
                    onClick={() => setDiscountToDelete(d)}
                    className="opacity-30 hover:opacity-80 hover:text-red-500 p-1 transition-all"
                    title="Delete Discount Code"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      <DeleteConfirmModal
        isOpen={!!discountToDelete}
        onClose={() => setDiscountToDelete(null)}
        onConfirm={confirmDeleteDiscount}
        title="Delete Discount Code"
        description="Are you sure you want to delete this discount code? Once deleted, customers will no longer be able to use it at checkout."
        itemName={discountToDelete?.code}
        isDeleting={deleting}
      />
    </div>
  );
}
