"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/utils/supabase/client";
import { toast } from "sonner";
import { Plus, Save, Trash2, Upload } from "lucide-react";
import { slugify } from "@/lib/utils/format";
import type { JournalPost } from "@/types/database";
import { uploadToCloudinary } from "@/lib/upload";
import DeleteConfirmModal from "@/components/admin/DeleteConfirmModal";

export default function AdminJournalPage() {
  const [posts, setPosts] = useState<JournalPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState({
    title: "",
    slug: "",
    excerpt: "",
    content: "",
    author: "AURELIN Atelier",
    cover_image_url: "",
    status: "published" as "published" | "draft",
  });
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [articleToDelete, setArticleToDelete] = useState<JournalPost | null>(null);
  const [deleting, setDeleting] = useState(false);

  const load = async () => {
    try {
      const res = await fetch("/api/admin/journal");
      const json = await res.json();
      if (json.success) setPosts(json.data || []);
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
    const result = await uploadToCloudinary(file, "journal");
    if (result.success && result.url) {
      setForm((f) => ({ ...f, cover_image_url: result.url! }));
      toast.success("Cover image uploaded to Cloudinary");
    } else {
      toast.error(result.error || "Upload failed");
    }
    setUploading(false);
  };

  const handleSave = async () => {
    if (!form.title) {
      toast.error("Title is required");
      return;
    }
    setSaving(true);

    try {
      const payload = {
        id: editingId,
        title: form.title,
        slug: form.slug || slugify(form.title),
        excerpt: form.excerpt || null,
        content: form.content || "",
        author: form.author || "AURELIN Atelier",
        cover_image_url: form.cover_image_url || null,
        status: form.status,
      };

      const res = await fetch("/api/admin/journal", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const json = await res.json();

      if (json.success) {
        toast.success(editingId ? "Article updated" : "Article published");
        setForm({ title: "", slug: "", excerpt: "", content: "", author: "AURELIN Atelier", cover_image_url: "", status: "published" });
        setShowForm(false);
        setEditingId(null);
        load();
      } else {
        toast.error(json.error || "Failed to save article");
      }
    } catch {
      toast.error("Failed to save article");
    } finally {
      setSaving(false);
    }
  };

  const confirmDeleteArticle = async () => {
    if (!articleToDelete) return;
    setDeleting(true);
    try {
      const res = await fetch(`/api/admin/journal?id=${articleToDelete.id}`, { method: "DELETE" });
      const json = await res.json();
      if (json.success) {
        toast.success("Article deleted");
        setArticleToDelete(null);
        load();
      } else {
        toast.error(json.error || "Failed to delete");
      }
    } catch {
      toast.error("Failed to delete");
    } finally {
      setDeleting(false);
    }
  };

  const handleEdit = (post: JournalPost) => {
    setForm({
      title: post.title,
      slug: post.slug,
      excerpt: post.excerpt || "",
      content: post.content || "",
      author: post.author || "AURELIN Atelier",
      cover_image_url: post.cover_image_url || "",
      status: post.status,
    });
    setEditingId(post.id);
    setShowForm(true);
  };

  const inputStyle = { fontFamily: "var(--font-inter)", fontSize: "0.9375rem", color: "#242424", borderColor: "#D8C8AF" };
  const labelStyle = { fontFamily: "var(--font-inter)", fontSize: "0.5625rem", letterSpacing: "0.16em", textTransform: "uppercase" as const, color: "#172744", opacity: 0.6 };

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 style={{ fontFamily: "var(--font-cormorant)", fontSize: "1.75rem", fontWeight: 400, color: "#172744" }}>
            Journal CMS
          </h1>
          <p className="mt-0.5 opacity-50" style={{ fontFamily: "var(--font-inter)", fontSize: "0.8125rem" }}>
            {posts.length} stories & essays
          </p>
        </div>
        <button
          onClick={() => {
            setShowForm(true);
            setEditingId(null);
            setForm({ title: "", slug: "", excerpt: "", content: "", author: "AURELIN Atelier", cover_image_url: "", status: "published" });
          }}
          className="flex items-center gap-2 px-5 py-2.5 bg-navy text-ivory label-uppercase text-xs tracking-wider hover:opacity-80"
        >
          <Plus size={13} /> WRITE STORY
        </button>
      </div>

      {showForm && (
        <div className="p-6 bg-ivory border border-beige/40">
          <h2 className="label-uppercase text-navy text-xs font-semibold tracking-wider mb-5">
            {editingId ? "EDIT STORY" : "NEW STORY"}
          </h2>
          <div className="space-y-4 mb-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block mb-1.5" style={labelStyle}>Title *</label>
                <input
                  type="text"
                  value={form.title}
                  onChange={(e) => setForm((f) => ({ ...f, title: e.target.value, slug: editingId ? f.slug : slugify(e.target.value) }))}
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
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block mb-1.5" style={labelStyle}>Author</label>
                <input
                  type="text"
                  value={form.author}
                  onChange={(e) => setForm((f) => ({ ...f, author: e.target.value }))}
                  className="w-full px-4 py-3 border outline-none bg-transparent"
                  style={inputStyle}
                />
              </div>
              <div>
                <label className="block mb-1.5" style={labelStyle}>Status</label>
                <select
                  value={form.status}
                  onChange={(e) => setForm((f) => ({ ...f, status: e.target.value as any }))}
                  className="w-full px-4 py-3 border border-beige outline-none bg-transparent text-sm"
                >
                  <option value="published">Published</option>
                  <option value="draft">Draft</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block mb-1.5" style={labelStyle}>Excerpt / Summary</label>
              <textarea
                value={form.excerpt}
                onChange={(e) => setForm((f) => ({ ...f, excerpt: e.target.value }))}
                rows={2}
                className="w-full px-4 py-3 border outline-none bg-transparent resize-none"
                style={inputStyle}
              />
            </div>

            <div>
              <label className="block mb-1.5" style={labelStyle}>Story Content</label>
              <textarea
                value={form.content}
                onChange={(e) => setForm((f) => ({ ...f, content: e.target.value }))}
                rows={8}
                className="w-full px-4 py-3 border outline-none bg-transparent"
                style={inputStyle}
              />
            </div>

            <div>
              <label className="block mb-1.5" style={labelStyle}>Cover Image</label>
              <div className="flex items-center gap-4">
                {form.cover_image_url && (
                  <img src={form.cover_image_url} alt="Cover" className="w-24 h-16 object-cover border border-beige/40" />
                )}
                <label className="flex items-center gap-2 px-4 py-2.5 border border-beige cursor-pointer hover:border-navy text-xs tracking-wider label-uppercase text-navy">
                  <Upload size={13} /> {uploading ? "UPLOADING..." : "UPLOAD COVER"}
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

          <div className="flex gap-3">
            <button
              onClick={handleSave}
              disabled={saving}
              className="flex items-center gap-2 px-6 py-2.5 bg-navy text-ivory label-uppercase text-xs tracking-wider hover:opacity-80"
            >
              <Save size={13} /> {saving ? "SAVING..." : "SAVE STORY"}
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
        ) : posts.length === 0 ? (
          <div className="py-12 text-center opacity-40 text-sm">No stories published yet.</div>
        ) : (
          <ul className="divide-y divide-beige/20">
            {posts.map((post) => (
              <li key={post.id} className="flex items-center gap-4 px-5 py-4">
                {post.cover_image_url && (
                  <img src={post.cover_image_url} alt={post.title} className="w-14 h-10 object-cover border border-beige/30" />
                )}
                <div className="flex-1">
                  <p className="font-medium text-navy text-sm" style={{ fontFamily: "var(--font-inter)" }}>{post.title}</p>
                  <p className="opacity-40 text-xs" style={{ fontFamily: "var(--font-inter)" }}>/journal/{post.slug} · By {post.author}</p>
                </div>
                <span className="px-2 py-0.5 rounded-full text-xs font-semibold tracking-wider uppercase bg-navy/10 text-navy">
                  {post.status}
                </span>
                <div className="flex items-center gap-3">
                  <button onClick={() => handleEdit(post)} className="opacity-60 hover:opacity-100 text-xs tracking-wider uppercase text-navy font-semibold">
                    EDIT
                  </button>
                  <button
                    onClick={() => setArticleToDelete(post)}
                    className="opacity-30 hover:opacity-80 hover:text-red-500 p-1 transition-all"
                    title="Delete Article"
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
        isOpen={!!articleToDelete}
        onClose={() => setArticleToDelete(null)}
        onConfirm={confirmDeleteArticle}
        title="Delete Journal Article"
        description="Are you sure you want to delete this editorial piece? It will be removed immediately from the AURELIN Journal."
        itemName={articleToDelete?.title}
        isDeleting={deleting}
      />
    </div>
  );
}
