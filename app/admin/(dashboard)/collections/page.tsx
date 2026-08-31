"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/utils/supabase/client";
import { toast } from "sonner";
import { Plus, Save, Trash2, Upload, Image as ImageIcon } from "lucide-react";
import { slugify } from "@/lib/utils/format";
import type { Collection } from "@/types/database";
import { uploadToCloudinary } from "@/lib/upload";

export default function AdminCollectionsPage() {
  const [collections, setCollections] = useState<Collection[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState({
    name: "",
    slug: "",
    description: "",
    hero_image_url: "",
    is_active: true,
  });
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  const load = async () => {
    try {
      const res = await fetch("/api/admin/collections");
      const json = await res.json();
      if (json.success) setCollections(json.data || []);
    } catch (e) {
      console.error(e);
    }
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, []);

  const handleImageUpload = async (file: File) => {
    setUploading(true);
    const result = await uploadToCloudinary(file, "collections");
    if (result.success && result.url) {
      setForm((f) => ({ ...f, hero_image_url: result.url! }));
      toast.success("Hero image uploaded to Cloudinary");
    } else {
      toast.error(result.error || "Upload failed");
    }
    setUploading(false);
  };

  const handleSave = async () => {
    if (!form.name) {
      toast.error("Name is required");
      return;
    }
    setSaving(true);

    try {
      const payload = {
        id: editingId,
        name: form.name,
        slug: form.slug || slugify(form.name),
        description: form.description || null,
        hero_image_url: form.hero_image_url || null,
        is_active: form.is_active,
        sort_order: collections.length,
      };

      const res = await fetch("/api/admin/collections", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const json = await res.json();

      if (json.success) {
        toast.success(editingId ? "Collection updated" : "Collection created");
        setForm({ name: "", slug: "", description: "", hero_image_url: "", is_active: true });
        setShowForm(false);
        setEditingId(null);
        load();
      } else {
        toast.error(json.error || "Failed to save collection");
      }
    } catch {
      toast.error("Failed to save collection");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this collection?")) return;
    try {
      const res = await fetch(`/api/admin/collections?id=${id}`, { method: "DELETE" });
      const json = await res.json();
      if (json.success) {
        toast.success("Collection deleted");
        load();
      } else {
        toast.error(json.error || "Failed to delete");
      }
    } catch {
      toast.error("Failed to delete");
    }
  };

  const handleEdit = (col: Collection) => {
    setForm({
      name: col.name,
      slug: col.slug,
      description: col.description || "",
      hero_image_url: col.hero_image_url || "",
      is_active: col.is_active,
    });
    setEditingId(col.id);
    setShowForm(true);
  };

  const inputStyle = { fontFamily: "var(--font-inter)", fontSize: "0.9375rem", color: "#242424", borderColor: "#D8C8AF" };
  const labelStyle = { fontFamily: "var(--font-inter)", fontSize: "0.5625rem", letterSpacing: "0.16em", textTransform: "uppercase" as const, color: "#172744", opacity: 0.6 };

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 style={{ fontFamily: "var(--font-cormorant)", fontSize: "1.75rem", fontWeight: 400, color: "#172744" }}>
            Collections
          </h1>
          <p className="mt-0.5 opacity-50" style={{ fontFamily: "var(--font-inter)", fontSize: "0.8125rem" }}>
            {collections.length} collections
          </p>
        </div>
        <button
          onClick={() => {
            setShowForm(true);
            setEditingId(null);
            setForm({ name: "", slug: "", description: "", hero_image_url: "", is_active: true });
          }}
          className="flex items-center gap-2 px-5 py-2.5 bg-navy text-ivory label-uppercase text-xs tracking-wider transition-opacity hover:opacity-80"
        >
          <Plus size={13} /> ADD COLLECTION
        </button>
      </div>

      {showForm && (
        <div className="p-6 bg-ivory border border-beige/40">
          <h2 className="label-uppercase text-navy text-xs font-semibold tracking-wider mb-5">
            {editingId ? "EDIT COLLECTION" : "NEW COLLECTION"}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
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
            <div className="md:col-span-2">
              <label className="block mb-1.5" style={labelStyle}>Description</label>
              <input
                type="text"
                value={form.description}
                onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                className="w-full px-4 py-3 border outline-none bg-transparent"
                style={inputStyle}
              />
            </div>

            {/* Hero Image */}
            <div className="md:col-span-2">
              <label className="block mb-1.5" style={labelStyle}>Hero Cover Image</label>
              <div className="flex items-center gap-4">
                {form.hero_image_url && (
                  <img src={form.hero_image_url} alt="Cover" className="w-24 h-16 object-cover border border-beige/40" />
                )}
                <label className="flex items-center gap-2 px-4 py-2.5 border border-beige cursor-pointer hover:border-navy text-xs tracking-wider label-uppercase text-navy">
                  <Upload size={13} /> {uploading ? "UPLOADING..." : "UPLOAD HERO"}
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    disabled={uploading}
                    onChange={(e) => e.target.files?.[0] && handleImageUpload(e.target.files[0])}
                  />
                </label>
              </div>
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
              <Save size={13} /> {saving ? "SAVING..." : "SAVE"}
            </button>
            <button
              onClick={() => { setShowForm(false); setEditingId(null); }}
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
        ) : collections.length === 0 ? (
          <div className="py-12 text-center opacity-40 text-sm">No collections yet.</div>
        ) : (
          <ul className="divide-y divide-beige/20">
            {collections.map((col) => (
              <li key={col.id} className="flex items-center gap-4 px-5 py-4">
                {col.hero_image_url ? (
                  <img src={col.hero_image_url} alt={col.name} className="w-12 h-12 object-cover border border-beige/30" />
                ) : (
                  <div className="w-12 h-12 bg-beige/20 flex items-center justify-center text-navy/40">
                    <ImageIcon size={16} />
                  </div>
                )}
                <div className="flex-1">
                  <p className="font-medium text-navy text-sm" style={{ fontFamily: "var(--font-inter)" }}>{col.name}</p>
                  <p className="opacity-40 text-xs" style={{ fontFamily: "var(--font-inter)" }}>/collections/{col.slug}</p>
                </div>
                <span className="px-2 py-0.5 rounded-full text-xs font-semibold tracking-wider uppercase bg-navy/10 text-navy">
                  {col.is_active ? "Active" : "Inactive"}
                </span>
                <div className="flex items-center gap-3">
                  <button onClick={() => handleEdit(col)} className="opacity-60 hover:opacity-100 text-xs tracking-wider uppercase text-navy font-semibold">
                    EDIT
                  </button>
                  <button onClick={() => handleDelete(col.id)} className="opacity-30 hover:opacity-80 hover:text-red-500">
                    <Trash2 size={13} />
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
