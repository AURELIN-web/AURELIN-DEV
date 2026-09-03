"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/utils/supabase/client";
import { toast } from "sonner";
import { Plus, Save, Trash2, GripVertical } from "lucide-react";
import { slugify } from "@/lib/utils/format";
import type { Category } from "@/types/database";
import DeleteConfirmModal from "@/components/admin/DeleteConfirmModal";

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState({ name: "", slug: "", description: "", is_active: true });
  const [saving, setSaving] = useState(false);
  const [categoryToDelete, setCategoryToDelete] = useState<Category | null>(null);
  const [deleting, setDeleting] = useState(false);

  const load = async () => {
    try {
      const res = await fetch("/api/admin/categories");
      const json = await res.json();
      if (json.success) {
        setCategories((json.data as Category[]) || []);
      } else {
        const supabase = createClient();
        const { data } = await supabase.from("categories").select("*").order("sort_order");
        setCategories((data as Category[]) || []);
      }
    } catch {
      const supabase = createClient();
      const { data } = await supabase.from("categories").select("*").order("sort_order");
      setCategories((data as Category[]) || []);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const handleSave = async () => {
    if (!form.name) { toast.error("Name is required"); return; }
    setSaving(true);
    const payload = {
      ...(editingId ? { id: editingId } : {}),
      name: form.name,
      slug: form.slug || slugify(form.name),
      description: form.description || null,
      is_active: form.is_active,
      sort_order: categories.length,
    };

    try {
      const res = await fetch("/api/admin/categories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const json = await res.json();
      if (json.success) {
        toast.success(editingId ? "Category updated" : "Category created");
        setForm({ name: "", slug: "", description: "", is_active: true });
        setShowForm(false);
        setEditingId(null);
        load();
      } else {
        toast.error(json.error || "Failed to save category");
      }
    } catch {
      toast.error("Failed to save category");
    } finally {
      setSaving(false);
    }
  };

  const confirmDeleteCategory = async () => {
    if (!categoryToDelete) return;
    setDeleting(true);
    try {
      const res = await fetch(`/api/admin/categories?id=${categoryToDelete.id}`, {
        method: "DELETE",
      });
      const json = await res.json();
      if (json.success) {
        toast.success("Category deleted");
        setCategoryToDelete(null);
        load();
      } else {
        toast.error(json.error || "Failed to delete category");
      }
    } catch {
      toast.error("Failed to delete category");
    } finally {
      setDeleting(false);
    }
  };

  const handleEdit = (cat: Category) => {
    setForm({ name: cat.name, slug: cat.slug, description: cat.description || "", is_active: cat.is_active });
    setEditingId(cat.id);
    setShowForm(true);
  };

  const inputStyle = { fontFamily: "var(--font-inter)", fontSize: "0.9375rem", color: "#242424", borderColor: "#D8C8AF" };
  const labelStyle = { fontFamily: "var(--font-inter)", fontSize: "0.5625rem", letterSpacing: "0.16em", textTransform: "uppercase" as const, color: "#172744", opacity: 0.6 };

  return (
    <div className="space-y-6 max-w-3xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 style={{ fontFamily: "var(--font-cormorant)", fontSize: "1.75rem", fontWeight: 400, color: "#172744" }}>Categories</h1>
          <p className="mt-0.5 opacity-50" style={{ fontFamily: "var(--font-inter)", fontSize: "0.8125rem" }}>{categories.length} categories</p>
        </div>
        <button
          onClick={() => { setShowForm(true); setEditingId(null); setForm({ name: "", slug: "", description: "", is_active: true }); }}
          className="flex items-center gap-2 px-5 py-2.5 transition-opacity hover:opacity-80"
          style={{ backgroundColor: "#172744", color: "#F8F6F0", fontFamily: "var(--font-inter)", fontSize: "0.6875rem", letterSpacing: "0.14em", textTransform: "uppercase" }}
        >
          <Plus size={13} /> ADD CATEGORY
        </button>
      </div>

      {showForm && (
        <div style={{ backgroundColor: "#F8F6F0", border: "1px solid #D8C8AF40", padding: "1.5rem" }}>
          <h2 className="mb-5" style={{ fontFamily: "var(--font-inter)", fontSize: "0.6875rem", letterSpacing: "0.16em", textTransform: "uppercase", color: "#172744", fontWeight: 600 }}>
            {editingId ? "EDIT CATEGORY" : "NEW CATEGORY"}
          </h2>
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block mb-1.5" style={labelStyle}>Name *</label>
              <input
                type="text"
                value={form.name}
                onChange={(e) => setForm((f) => ({ ...f, name: e.target.value, slug: editingId ? f.slug : slugify(e.target.value) }))}
                className="w-full px-4 py-3 border outline-none bg-transparent"
                style={inputStyle}
              />
            </div>
            <div>
              <label className="block mb-1.5" style={labelStyle}>Slug</label>
              <input
                type="text"
                value={form.slug}
                onChange={(e) => setForm((f) => ({ ...f, slug: e.target.value }))}
                className="w-full px-4 py-3 border outline-none bg-transparent"
                style={inputStyle}
              />
            </div>
            <div className="col-span-2">
              <label className="block mb-1.5" style={labelStyle}>Description</label>
              <input
                type="text"
                value={form.description}
                onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                className="w-full px-4 py-3 border outline-none bg-transparent"
                style={inputStyle}
              />
            </div>
          </div>
          <label className="flex items-center gap-2 cursor-pointer mb-5">
            <input type="checkbox" checked={form.is_active} onChange={(e) => setForm((f) => ({ ...f, is_active: e.target.checked }))} className="w-4 h-4" />
            <span style={{ fontFamily: "var(--font-inter)", fontSize: "0.875rem" }}>Active</span>
          </label>
          <div className="flex gap-3">
            <button onClick={handleSave} disabled={saving} className="flex items-center gap-2 px-6 py-2.5 transition-opacity hover:opacity-80 disabled:opacity-50" style={{ backgroundColor: "#172744", color: "#F8F6F0", fontFamily: "var(--font-inter)", fontSize: "0.6875rem", letterSpacing: "0.14em", textTransform: "uppercase" }}>
              <Save size={13} /> {saving ? "SAVING..." : "SAVE"}
            </button>
            <button onClick={() => { setShowForm(false); setEditingId(null); }} className="px-5 py-2.5 border transition-colors hover:border-navy" style={{ borderColor: "#D8C8AF", fontFamily: "var(--font-inter)", fontSize: "0.6875rem", letterSpacing: "0.12em", textTransform: "uppercase" }}>
              CANCEL
            </button>
          </div>
        </div>
      )}

      <div style={{ backgroundColor: "#F8F6F0", border: "1px solid #D8C8AF40" }}>
        {loading ? (
          <div className="py-10 text-center opacity-40" style={{ fontFamily: "var(--font-inter)" }}>Loading...</div>
        ) : categories.length === 0 ? (
          <div className="py-12 text-center opacity-40" style={{ fontFamily: "var(--font-inter)", fontSize: "0.875rem" }}>No categories yet.</div>
        ) : (
          <ul className="divide-y" style={{ borderColor: "#D8C8AF20" }}>
            {categories.map((cat) => (
              <li key={cat.id} className="flex items-center gap-4 px-5 py-4">
                <GripVertical size={14} className="opacity-30 cursor-grab" />
                <div className="flex-1">
                  <p style={{ fontFamily: "var(--font-inter)", fontSize: "0.875rem", fontWeight: 500, color: "#172744" }}>{cat.name}</p>
                  <p className="opacity-40" style={{ fontFamily: "var(--font-inter)", fontSize: "0.75rem" }}>/shop/{cat.slug}</p>
                </div>
                <span
                  className="px-2 py-0.5 rounded-full"
                  style={{ fontFamily: "var(--font-inter)", fontSize: "0.5625rem", letterSpacing: "0.1em", textTransform: "uppercase", backgroundColor: cat.is_active ? "#17274415" : "#D8C8AF30", color: "#172744" }}
                >
                  {cat.is_active ? "Active" : "Inactive"}
                </span>
                <div className="flex items-center gap-3">
                  <button onClick={() => handleEdit(cat)} className="opacity-50 hover:opacity-100 transition-opacity" style={{ fontFamily: "var(--font-inter)", fontSize: "0.6875rem", letterSpacing: "0.12em", textTransform: "uppercase", color: "#172744" }}>
                    EDIT
                  </button>
                  <button
                    onClick={() => setCategoryToDelete(cat)}
                    className="opacity-30 hover:opacity-80 hover:text-red-500 transition-all p-1"
                    title="Delete Category"
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
        isOpen={!!categoryToDelete}
        onClose={() => setCategoryToDelete(null)}
        onConfirm={confirmDeleteCategory}
        title="Delete Category"
        description="Are you sure you want to delete this category? Products currently assigned to this category will remain, but may lose category filtering."
        itemName={categoryToDelete?.name}
        isDeleting={deleting}
      />
    </div>
  );
}
