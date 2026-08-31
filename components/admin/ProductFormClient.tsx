"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { slugify } from "@/lib/utils/format";
import { Plus, Trash2, Upload, Save, ArrowLeft, Loader2, Image as ImageIcon } from "lucide-react";
import { uploadToCloudinary } from "@/lib/upload";
import Link from "next/link";

const PRODUCT_SIZES = ["XS", "S", "M", "L", "XL", "XXL"];

interface Variant {
  id?: string;
  size: string;
  colour: string;
  colour_hex: string;
  price: string;
  stock_quantity: number;
  sku: string;
  is_available: boolean;
}

interface FormData {
  name: string;
  slug: string;
  sku: string;
  short_description: string;
  description: string;
  price: string;
  compare_at_price: string;
  sale_price: string;
  status: "draft" | "published" | "archived";
  is_featured: boolean;
  is_new_arrival: boolean;
  is_best_seller: boolean;
  stock_quantity: number;
  low_stock_threshold: number;
  material: string;
  fabric: string;
  fit: string;
  care_instructions: string;
  seo_title: string;
  seo_description: string;
  seo_keywords: string;
}

const defaultForm: FormData = {
  name: "",
  slug: "",
  sku: "",
  short_description: "",
  description: "",
  price: "",
  compare_at_price: "",
  sale_price: "",
  status: "published",
  is_featured: false,
  is_new_arrival: true,
  is_best_seller: false,
  stock_quantity: 15,
  low_stock_threshold: 3,
  material: "100% European Flax Linen",
  fabric: "Lightweight Breathable Linen (160 GSM)",
  fit: "Relaxed European Tailored Fit",
  care_instructions: "Cold gentle machine wash. Hang dry in shade. Warm iron inside out.",
  seo_title: "",
  seo_description: "",
  seo_keywords: "",
};

export default function ProductFormClient({
  initialProduct,
}: {
  initialProduct?: FormData & {
    id?: string;
    variants?: Variant[];
    images?: { url: string; alt_text?: string }[];
    primary_image_url?: string;
  };
}) {
  const [form, setForm] = useState<FormData>(initialProduct || defaultForm);
  const [variants, setVariants] = useState<Variant[]>(initialProduct?.variants || []);
  const [images, setImages] = useState<{ url: string; alt_text?: string }[]>(
    initialProduct?.images && initialProduct.images.length > 0
      ? initialProduct.images
      : initialProduct?.primary_image_url
      ? [{ url: initialProduct.primary_image_url, alt_text: initialProduct.name }]
      : []
  );
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<number | null>(null);
  const [saving, setSaving] = useState(false);
  const router = useRouter();

  const updateField = <K extends keyof FormData>(key: K, value: FormData[K]) => {
    setForm((prev) => ({
      ...prev,
      [key]: value,
      ...(key === "name" && !initialProduct ? { slug: slugify(value as string) } : {}),
    }));
  };

  const addVariant = () => {
    setVariants((prev) => [
      ...prev,
      {
        size: "M",
        colour: "Sand Beige",
        colour_hex: "#D8C8AF",
        price: form.price || "149",
        stock_quantity: 10,
        sku: form.sku ? `${form.sku}-M` : "",
        is_available: true,
      },
    ]);
  };

  const removeVariant = (index: number) => {
    setVariants((prev) => prev.filter((_, i) => i !== index));
  };

  const updateVariant = (index: number, key: keyof Variant, value: string | number | boolean) => {
    setVariants((prev) =>
      prev.map((v, i) => (i === index ? { ...v, [key]: value } : v))
    );
  };

  const handleImageUpload = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    setUploading(true);
    setUploadProgress(0);

    for (const file of Array.from(files)) {
      const result = await uploadToCloudinary(file, "products", (percent) => {
        setUploadProgress(percent);
      });

      if (result.success && result.url) {
        setImages((prev) => [...prev, { url: result.url!, alt_text: form.name }]);
        toast.success("Image uploaded to Cloudinary");
      } else {
        toast.error(result.error || "Upload failed");
      }
    }
    setUploading(false);
    setUploadProgress(null);
  };

  const setPrimaryImage = (index: number) => {
    setImages((prev) => {
      const copy = [...prev];
      const [selected] = copy.splice(index, 1);
      return [selected, ...copy];
    });
    toast.success("Set as primary photo");
  };

  const removeImage = (index: number) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSave = async () => {
    if (!form.name || !form.price) {
      toast.error("Garment name and price are required");
      return;
    }

    setSaving(true);

    try {
      const payload = {
        ...form,
        id: initialProduct?.id,
        primary_image_url: images[0]?.url || null,
        images,
        variants,
      };

      const res = await fetch("/api/admin/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to save product");
      }

      toast.success(initialProduct ? "Product updated successfully" : "Product published to storefront");
      router.push("/admin/products");
      router.refresh();
    } catch (err: any) {
      toast.error(err.message || "Failed to save product");
    } finally {
      setSaving(false);
    }
  };

  const inputClass = "w-full px-4 py-2.5 bg-white border border-[#D8C8AF] focus:border-[#172744] focus:ring-1 focus:ring-[#172744] outline-none text-sm text-[#242424] transition-all rounded-sm";
  const labelClass = "block mb-1.5 text-[11px] font-semibold tracking-wider text-[#172744]/70 uppercase";

  return (
    <div className="space-y-8 max-w-5xl pb-16">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#D8C8AF40]">
        <div className="flex items-center gap-3">
          <Link
            href="/admin/products"
            className="p-2 text-[#172744]/60 hover:text-[#172744] hover:bg-white rounded border border-[#D8C8AF] transition-colors"
            title="Back to Products"
          >
            <ArrowLeft size={16} />
          </Link>
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
              {initialProduct ? `Edit Garment: ${form.name}` : "Add New Garment"}
            </h1>
            <p className="text-xs text-charcoal/60 mt-0.5" style={{ fontFamily: "var(--font-inter)" }}>
              Manage pricing, Cloudinary imagery, sizes, colours, and inventory.
            </p>
          </div>
        </div>

        {/* Top Actions: Status + Save Button */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Clean Status Pill Selector (No Emojis) */}
          <div className="flex items-center p-1 bg-white border border-[#D8C8AF] rounded-sm">
            {[
              { value: "published", label: "Published" },
              { value: "draft", label: "Draft" },
              { value: "archived", label: "Archived" },
            ].map((s) => (
              <button
                key={s.value}
                type="button"
                onClick={() => updateField("status", s.value as any)}
                className={`px-3 py-1.5 text-xs font-semibold rounded-sm transition-colors ${
                  form.status === s.value
                    ? "bg-[#172744] text-[#F8F6F0] shadow-xs"
                    : "text-charcoal/60 hover:text-[#172744]"
                }`}
              >
                {s.label}
              </button>
            ))}
          </div>

          <button
            type="button"
            onClick={handleSave}
            disabled={saving}
            className="inline-flex items-center gap-2 px-6 py-2.5 bg-[#172744] text-[#F8F6F0] hover:bg-[#101C32] text-xs font-semibold uppercase tracking-widest rounded-sm shadow-sm disabled:opacity-50"
          >
            {saving ? (
              <>
                <Loader2 size={13} className="animate-spin" /> Saving...
              </>
            ) : (
              <>
                <Save size={13} /> {initialProduct ? "Update Garment" : "Publish Product"}
              </>
            )}
          </button>
        </div>
      </div>

      {/* 1. Core Garment Info */}
      <section className="bg-white border border-[#D8C8AF] rounded-sm p-6 md:p-8 shadow-sm space-y-6">
        <h2 className="text-xs font-semibold tracking-widest text-[#172744] uppercase pb-2 border-b border-[#D8C8AF30]">
          1. BASIC DETAILS
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2">
            <label className={labelClass}>Garment Name *</label>
            <input
              type="text"
              value={form.name}
              onChange={(e) => updateField("name", e.target.value)}
              placeholder="e.g. The Riviera Linen Overshirt"
              className={inputClass}
              required
            />
          </div>

          <div>
            <label className={labelClass}>SKU / Model Code</label>
            <input
              type="text"
              value={form.sku}
              onChange={(e) => updateField("sku", e.target.value)}
              placeholder="e.g. AUR-LIN-001"
              className={inputClass}
            />
          </div>

          <div className="md:col-span-3">
            <label className={labelClass}>URL Slug</label>
            <input
              type="text"
              value={form.slug}
              onChange={(e) => updateField("slug", e.target.value)}
              placeholder="riviera-linen-overshirt"
              className={`${inputClass} font-mono text-xs`}
            />
          </div>

          <div className="md:col-span-3">
            <label className={labelClass}>Short Tagline / Brief Description</label>
            <input
              type="text"
              value={form.short_description}
              onChange={(e) => updateField("short_description", e.target.value)}
              placeholder="e.g. Pure European flax tailored for warm coastal evenings."
              className={inputClass}
            />
          </div>

          <div className="md:col-span-3">
            <label className={labelClass}>Full Product Narrative</label>
            <textarea
              rows={4}
              value={form.description}
              onChange={(e) => updateField("description", e.target.value)}
              placeholder="Describe the silhouette, fabric heritage, and craftsmanship story..."
              className={`${inputClass} resize-none`}
            />
          </div>
        </div>
      </section>

      {/* 2. Pricing & Inventory */}
      <section className="bg-white border border-[#D8C8AF] rounded-sm p-6 md:p-8 shadow-sm space-y-6">
        <h2 className="text-xs font-semibold tracking-widest text-[#172744] uppercase pb-2 border-b border-[#D8C8AF30]">
          2. PRICING & INVENTORY
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div>
            <label className={labelClass}>Retail Price ($) *</label>
            <input
              type="number"
              step="0.01"
              value={form.price}
              onChange={(e) => updateField("price", e.target.value)}
              placeholder="185.00"
              className={inputClass}
              required
            />
          </div>

          <div>
            <label className={labelClass}>Original / Compare Price ($)</label>
            <input
              type="number"
              step="0.01"
              value={form.compare_at_price}
              onChange={(e) => updateField("compare_at_price", e.target.value)}
              placeholder="220.00 (optional)"
              className={inputClass}
            />
          </div>

          <div>
            <label className={labelClass}>Sale / Promo Price ($)</label>
            <input
              type="number"
              step="0.01"
              value={form.sale_price}
              onChange={(e) => updateField("sale_price", e.target.value)}
              placeholder="Optional discount price"
              className={inputClass}
            />
          </div>

          <div>
            <label className={labelClass}>Total Stock Inventory</label>
            <input
              type="number"
              value={form.stock_quantity}
              onChange={(e) => updateField("stock_quantity", parseInt(e.target.value, 10) || 0)}
              className={inputClass}
            />
          </div>
        </div>

        {/* Feature Badges (No Emojis) */}
        <div className="pt-4 border-t border-[#D8C8AF30] flex flex-wrap gap-6">
          {[
            { key: "is_new_arrival" as const, label: "New Arrival Badge" },
            { key: "is_featured" as const, label: "Featured on Homepage" },
            { key: "is_best_seller" as const, label: "Best Seller Badge" },
          ].map((b) => (
            <label key={b.key} className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={form[b.key]}
                onChange={(e) => updateField(b.key, e.target.checked)}
                className="w-4 h-4 accent-[#172744] rounded"
              />
              <span className="text-xs font-medium text-[#242424]">{b.label}</span>
            </label>
          ))}
        </div>
      </section>

      {/* 3. Visual Imagery (Cloudinary) */}
      <section className="bg-white border border-[#D8C8AF] rounded-sm p-6 md:p-8 shadow-sm space-y-6">
        <div className="flex items-center justify-between pb-2 border-b border-[#D8C8AF30]">
          <h2 className="text-xs font-semibold tracking-widest text-[#172744] uppercase">
            3. GARMENT PHOTOS ({images.length})
          </h2>
          <span className="text-[11px] text-charcoal/50">First image is the primary storefront cover</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-4">
          {images.map((img, i) => (
            <div
              key={img.url}
              className={`relative aspect-[3/4] bg-[#F8F6F0] rounded border overflow-hidden group ${
                i === 0 ? "border-[#172744] ring-2 ring-[#172744]/20" : "border-[#D8C8AF]"
              }`}
            >
              <img src={img.url} alt={img.alt_text || "Garment photo"} className="w-full h-full object-cover" />

              {/* Primary badge */}
              {i === 0 && (
                <span className="absolute top-1.5 left-1.5 px-1.5 py-0.5 bg-[#172744] text-[#F8F6F0] text-[9px] font-bold uppercase tracking-wider rounded-xs shadow">
                  PRIMARY
                </span>
              )}

              {/* Hover actions */}
              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-1.5 p-2">
                {i !== 0 && (
                  <button
                    type="button"
                    onClick={() => setPrimaryImage(i)}
                    className="px-2 py-1 bg-white text-[#172744] text-[10px] font-semibold rounded shadow hover:bg-[#F8F6F0]"
                  >
                    Make Primary
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => removeImage(i)}
                  className="p-1 bg-red-600 text-white rounded hover:bg-red-700"
                >
                  <Trash2 size={13} />
                </button>
              </div>
            </div>
          ))}

          {/* Upload Dropzone Tile */}
          <label className="relative aspect-[3/4] border-2 border-dashed border-[#D8C8AF] hover:border-[#172744] bg-[#F8F6F0]/50 rounded flex flex-col items-center justify-center cursor-pointer transition-colors p-3 text-center">
            {uploading ? (
              <div className="space-y-1 text-center">
                <Loader2 size={20} className="animate-spin text-[#172744] mx-auto" />
                <span className="text-[10px] text-charcoal/70">
                  {uploadProgress !== null ? `${uploadProgress}%` : "Uploading..."}
                </span>
              </div>
            ) : (
              <>
                <Upload size={20} className="text-[#172744]/60 mb-1" />
                <span className="text-[11px] font-semibold text-[#172744] uppercase tracking-wider">
                  + Add Photos
                </span>
                <span className="text-[9px] text-charcoal/40 mt-0.5">JPG, PNG, WebP</span>
              </>
            )}
            <input
              type="file"
              multiple
              accept="image/*"
              className="hidden"
              disabled={uploading}
              onChange={(e) => handleImageUpload(e.target.files)}
            />
          </label>
        </div>
      </section>

      {/* 4. Sizes & Colour Swatches */}
      <section className="bg-white border border-[#D8C8AF] rounded-sm p-6 md:p-8 shadow-sm space-y-6">
        <div className="flex items-center justify-between pb-2 border-b border-[#D8C8AF30]">
          <div>
            <h2 className="text-xs font-semibold tracking-widest text-[#172744] uppercase">
              4. SIZES & COLOUR SWATCHES
            </h2>
            <p className="text-[11px] text-charcoal/50 mt-0.5">Define size and colour options for clients</p>
          </div>
          <button
            type="button"
            onClick={addVariant}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#172744] text-[#F8F6F0] text-xs font-semibold uppercase tracking-wider rounded-sm hover:bg-[#101C32]"
          >
            <Plus size={13} /> Add Variant Option
          </button>
        </div>

        {variants.length === 0 ? (
          <div className="p-6 bg-[#F8F6F0] border border-dashed border-[#D8C8AF] rounded text-center space-y-2">
            <p className="text-xs text-charcoal/60">No specific variant breakdown added.</p>
            <button
              type="button"
              onClick={addVariant}
              className="px-4 py-2 bg-white border border-[#172744] text-[#172744] text-xs font-semibold uppercase tracking-wider rounded-sm hover:bg-[#172744] hover:text-white transition-colors"
            >
              + Create Size & Colour Options
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {variants.map((v, index) => (
              <div
                key={index}
                className="grid grid-cols-1 sm:grid-cols-6 gap-3 items-center p-3.5 bg-[#F8F6F0] border border-[#D8C8AF]/60 rounded-sm"
              >
                {/* Size */}
                <div>
                  <label className="text-[10px] font-bold text-[#172744] uppercase tracking-wider block mb-1">
                    Size
                  </label>
                  <select
                    value={v.size}
                    onChange={(e) => updateVariant(index, "size", e.target.value)}
                    className="w-full px-2.5 py-2 bg-white border border-[#D8C8AF] text-xs font-medium rounded-sm"
                  >
                    {PRODUCT_SIZES.map((sz) => (
                      <option key={sz} value={sz}>
                        {sz}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Colour Name */}
                <div className="sm:col-span-2">
                  <label className="text-[10px] font-bold text-[#172744] uppercase tracking-wider block mb-1">
                    Colour Name
                  </label>
                  <input
                    type="text"
                    value={v.colour}
                    onChange={(e) => updateVariant(index, "colour", e.target.value)}
                    placeholder="e.g. Navy Blue, Olive, Sand"
                    className="w-full px-3 py-2 bg-white border border-[#D8C8AF] text-xs rounded-sm"
                  />
                </div>

                {/* Colour Swatch Hex */}
                <div>
                  <label className="text-[10px] font-bold text-[#172744] uppercase tracking-wider block mb-1">
                    Swatch
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={v.colour_hex || "#D8C8AF"}
                      onChange={(e) => updateVariant(index, "colour_hex", e.target.value)}
                      className="w-8 h-8 p-0 border border-[#D8C8AF] rounded cursor-pointer"
                    />
                    <span className="text-[11px] font-mono">{v.colour_hex}</span>
                  </div>
                </div>

                {/* Stock */}
                <div>
                  <label className="text-[10px] font-bold text-[#172744] uppercase tracking-wider block mb-1">
                    Stock Qty
                  </label>
                  <input
                    type="number"
                    value={v.stock_quantity}
                    onChange={(e) => updateVariant(index, "stock_quantity", parseInt(e.target.value, 10) || 0)}
                    className="w-full px-3 py-2 bg-white border border-[#D8C8AF] text-xs rounded-sm"
                  />
                </div>

                {/* Remove button */}
                <div className="flex justify-end pt-4 sm:pt-0">
                  <button
                    type="button"
                    onClick={() => removeVariant(index)}
                    className="p-2 text-red-600 hover:bg-red-50 rounded"
                    title="Remove variant"
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* 5. Luxury Attributes */}
      <section className="bg-white border border-[#D8C8AF] rounded-sm p-6 md:p-8 shadow-sm space-y-6">
        <h2 className="text-xs font-semibold tracking-widest text-[#172744] uppercase pb-2 border-b border-[#D8C8AF30]">
          5. FABRIC & CARE SPECIFICATIONS
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <label className={labelClass}>Material Composition</label>
            <input
              type="text"
              value={form.material}
              onChange={(e) => updateField("material", e.target.value)}
              placeholder="e.g. 100% French Linen"
              className={inputClass}
            />
          </div>

          <div>
            <label className={labelClass}>Fabric Weight / Weave</label>
            <input
              type="text"
              value={form.fabric}
              onChange={(e) => updateField("fabric", e.target.value)}
              placeholder="e.g. 180 GSM Herringbone Weave"
              className={inputClass}
            />
          </div>

          <div>
            <label className={labelClass}>Tailoring Fit</label>
            <input
              type="text"
              value={form.fit}
              onChange={(e) => updateField("fit", e.target.value)}
              placeholder="e.g. Relaxed Riviera Fit"
              className={inputClass}
            />
          </div>

          <div className="md:col-span-3">
            <label className={labelClass}>Care Instructions</label>
            <textarea
              rows={2}
              value={form.care_instructions}
              onChange={(e) => updateField("care_instructions", e.target.value)}
              placeholder="e.g. Dry clean recommended or machine wash cold gentle cycle..."
              className={`${inputClass} resize-none`}
            />
          </div>
        </div>
      </section>

      {/* Bottom Action Bar (In Normal Flow - NEVER Covers Content) */}
      <div className="flex items-center justify-between p-6 bg-white border border-[#D8C8AF] rounded-sm shadow-sm">
        <Link
          href="/admin/products"
          className="px-6 py-2.5 border border-[#D8C8AF] text-[#172744] text-xs font-semibold uppercase tracking-wider rounded-sm hover:bg-[#F8F6F0] transition-colors"
        >
          Cancel
        </Link>
        <button
          type="button"
          onClick={handleSave}
          disabled={saving}
          className="inline-flex items-center gap-2 px-8 py-3 bg-[#172744] text-[#F8F6F0] hover:bg-[#101C32] text-xs font-semibold uppercase tracking-widest rounded-sm shadow-sm disabled:opacity-50"
        >
          {saving ? (
            <>
              <Loader2 size={14} className="animate-spin" /> Saving...
            </>
          ) : (
            <>
              <Save size={14} /> {initialProduct ? "Update Garment" : "Publish Product"}
            </>
          )}
        </button>
      </div>
    </div>
  );
}
