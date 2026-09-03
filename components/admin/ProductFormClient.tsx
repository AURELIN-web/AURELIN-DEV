"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { slugify } from "@/lib/utils/format";
import {
  Plus,
  Trash2,
  Upload,
  Save,
  ArrowLeft,
  Loader2,
  Image as ImageIcon,
  Check,
  Star,
  Sparkles,
} from "lucide-react";
import { uploadToCloudinary } from "@/lib/upload";
import Link from "next/link";
import ProductDeleteButton from "./ProductDeleteButton";

const STANDARD_SIZES = ["XS", "S", "M", "L", "XL", "XXL"];

const POPULAR_COLOURS = [
  { name: "Natural White", hex: "#F8F6F0" },
  { name: "Deep Navy", hex: "#172744" },
  { name: "Oatmeal Beige", hex: "#D8C8AF" },
  { name: "Olive Green", hex: "#556B2F" },
  { name: "Sage", hex: "#9CAF88" },
  { name: "Terracotta", hex: "#C86D51" },
  { name: "Charcoal Black", hex: "#242424" },
];

interface Variant {
  id?: string;
  size: string;
  colour: string;
  colour_hex?: string;
  price: string;
  stock_quantity: number;
  sku?: string;
  is_available: boolean;
  image_url?: string;
  show_on_storefront?: boolean;
}

interface ColourItem {
  id: string;
  name: string;
  hex: string;
  image_url?: string;
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
  is_new_arrival: false,
  is_best_seller: false,
  stock_quantity: 50,
  low_stock_threshold: 0,
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
    category_id?: string;
    show_on_storefront?: boolean;
  };
}) {
  const [form, setForm] = useState<FormData>(initialProduct || defaultForm);
  const [categories, setCategories] = useState<Array<{ id: string; name: string }>>([]);
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>(initialProduct?.category_id || "");

  // Media state
  const [images, setImages] = useState<{ url: string; alt_text?: string }[]>(
    initialProduct?.images && initialProduct.images.length > 0
      ? initialProduct.images
      : initialProduct?.primary_image_url
      ? [{ url: initialProduct.primary_image_url, alt_text: initialProduct.name }]
      : []
  );
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<string | null>(null);

  // Colours state
  const initialColours: ColourItem[] = useMemo(() => {
    if (!initialProduct?.variants || initialProduct.variants.length === 0) {
      return [{ id: "c-1", name: "Natural White", hex: "#F8F6F0" }];
    }
    const map = new Map<string, ColourItem>();
    initialProduct.variants.forEach((v, idx) => {
      const col = v.colour || "Standard";
      if (!map.has(col.toLowerCase())) {
        map.set(col.toLowerCase(), {
          id: `c-${idx}-${col}`,
          name: col,
          hex: v.colour_hex || "#D8C8AF",
          image_url: v.image_url,
        });
      }
    });
    return Array.from(map.values());
  }, [initialProduct]);

  const [colours, setColours] = useState<ColourItem[]>(initialColours);
  const [newColourInput, setNewColourInput] = useState("");

  // Sizes state
  const initialSelectedSizes = useMemo(() => {
    if (!initialProduct?.variants || initialProduct.variants.length === 0) {
      return ["S", "M", "L", "XL"];
    }
    const set = new Set<string>();
    initialProduct.variants.forEach((v) => {
      if (v.size) set.add(v.size);
    });
    return Array.from(set);
  }, [initialProduct]);

  const [selectedSizes, setSelectedSizes] = useState<string[]>(initialSelectedSizes);
  const [customSizeInput, setCustomSizeInput] = useState("");
  const [inStock, setInStock] = useState<boolean>(
    initialProduct ? Number(initialProduct.stock_quantity) > 0 : true
  );

  // Badge state
  const getInitialBadge = () => {
    if (initialProduct?.is_new_arrival) return "new";
    if (initialProduct?.is_best_seller) return "best_seller";
    if (initialProduct?.stock_quantity === 0) return "sold_out";
    if (
      (initialProduct?.low_stock_threshold ?? 0) > 0 &&
      (initialProduct?.stock_quantity ?? 0) <= (initialProduct?.low_stock_threshold ?? 0)
    ) {
      return "low_stock";
    }
    return "none";
  };

  const [selectedBadge, setSelectedBadge] = useState<"none" | "new" | "best_seller" | "low_stock" | "sold_out">(
    getInitialBadge()
  );

  const [saving, setSaving] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const loadCategories = async () => {
      try {
        const res = await fetch("/api/admin/categories");
        const data = await res.json();
        if (res.ok && Array.isArray(data?.data)) {
          setCategories(data.data);
        }
      } catch {
        // ignore
      }
    };
    loadCategories();
  }, []);

  const updateField = (field: keyof FormData, value: any) => {
    setForm((prev) => {
      const next = { ...prev, [field]: value };
      if (field === "name" && !initialProduct) {
        next.slug = slugify(value);
      }
      return next;
    });
  };

  // Image Upload handler
  const handleImageUpload = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    setUploading(true);
    const newImgs: { url: string; alt_text: string }[] = [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      setUploadProgress(`Uploading photo ${i + 1} of ${files.length}...`);
      try {
        const res = await uploadToCloudinary(file, "products");
        if (res.success && res.url) {
          newImgs.push({ url: res.url, alt_text: form.name || file.name });
        }
      } catch (err: any) {
        toast.error(`Failed to upload ${file.name}: ${err.message}`);
      }
    }

    if (newImgs.length > 0) {
      setImages((prev) => [...prev, ...newImgs]);
      toast.success(`Successfully uploaded ${newImgs.length} image${newImgs.length > 1 ? "s" : ""}`);
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
    toast.success("Set as primary display photo");
  };

  const removeImage = (index: number) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
  };

  // Colour handlers
  const addColour = (name: string, hex = "#D8C8AF") => {
    const trimmed = name.trim();
    if (!trimmed) return;
    if (colours.some((c) => c.name.toLowerCase() === trimmed.toLowerCase())) {
      toast.error(`Colour "${trimmed}" already added`);
      return;
    }
    setColours((prev) => [
      ...prev,
      { id: `c-${Date.now()}-${Math.random().toString(16).slice(2)}`, name: trimmed, hex },
    ]);
  };

  const removeColour = (id: string) => {
    if (colours.length <= 1) {
      toast.error("At least one colour is required");
      return;
    }
    setColours((prev) => prev.filter((c) => c.id !== id));
  };

  // Size handlers
  const toggleSize = (size: string) => {
    setSelectedSizes((prev) =>
      prev.includes(size) ? prev.filter((s) => s !== size) : [...prev, size]
    );
  };

  const addCustomSize = () => {
    const trimmed = customSizeInput.trim().toUpperCase();
    if (!trimmed) return;
    if (!selectedSizes.includes(trimmed)) {
      setSelectedSizes((prev) => [...prev, trimmed]);
    }
    setCustomSizeInput("");
  };

  // Save handler
  const handleSave = async () => {
    if (!form.name || !form.price) {
      toast.error("Garment name and price are required");
      return;
    }

    if (images.length === 0) {
      toast.error("Please upload at least one product photo");
      return;
    }

    if (selectedSizes.length === 0) {
      toast.error("Please select at least one available size");
      return;
    }

    setSaving(true);

    try {
      // Build variants combination from colours and selected sizes
      const variants: Variant[] = [];
      colours.forEach((col, cIdx) => {
        selectedSizes.forEach((sz) => {
          variants.push({
            size: sz,
            colour: col.name,
            colour_hex: col.hex,
            price: form.price,
            stock_quantity: inStock ? 25 : 0,
            sku: form.sku ? `${form.sku}-${col.name.slice(0, 3).toUpperCase()}-${sz}` : `${col.name}-${sz}`,
            is_available: inStock,
            image_url: col.image_url || images[0]?.url || "",
            show_on_storefront: cIdx === 0,
          });
        });
      });

      const payload = {
        ...form,
        id: initialProduct?.id,
        category_id: selectedCategoryId || null,
        primary_image_url: images[0]?.url || null,
        stock_quantity: inStock ? (selectedBadge === "low_stock" ? 2 : 50) : 0,
        low_stock_threshold: selectedBadge === "low_stock" ? 5 : 0,
        is_new_arrival: selectedBadge === "new",
        is_best_seller: selectedBadge === "best_seller",
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

  const inputClass =
    "w-full px-4 py-2.5 bg-white border border-[#D8C8AF] focus:border-[#172744] focus:ring-1 focus:ring-[#172744] outline-none text-sm text-[#242424] transition-all rounded-xs";
  const labelClass =
    "block mb-1.5 text-[11px] font-semibold tracking-wider text-[#172744] uppercase";

  return (
    <div className="space-y-8 max-w-4xl pb-20">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#D8C8AF40]">
        <div className="flex items-center gap-3">
          <Link
            href="/admin/products"
            className="p-2 text-[#172744]/60 hover:text-[#172744] hover:bg-white rounded-xs border border-[#D8C8AF] transition-colors"
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
              }}
            >
              {initialProduct ? `Edit Garment: ${form.name}` : "Add New Garment"}
            </h1>
            <p className="text-xs text-charcoal/60 mt-0.5">
              Easily manage photos, prices, colours, sizes, and storefront badges.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/admin/products"
            className="px-5 py-2.5 border border-[#D8C8AF] text-[#172744] text-xs font-semibold uppercase tracking-wider rounded-xs hover:bg-[#F8F6F0] transition-colors"
          >
            Cancel
          </Link>
          <button
            type="button"
            onClick={handleSave}
            disabled={saving}
            className="inline-flex items-center gap-2 px-6 py-2.5 bg-[#172744] text-[#F8F6F0] hover:bg-[#101C32] text-xs font-semibold uppercase tracking-widest rounded-xs shadow-sm disabled:opacity-50 transition-all"
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

      {/* 1. Basic Information */}
      <section className="bg-white border border-[#D8C8AF] rounded-xs p-6 md:p-8 shadow-2xs space-y-6">
        <h2 className="text-xs font-bold tracking-widest text-[#172744] uppercase pb-2 border-b border-[#D8C8AF30]">
          1. Basic Details & Pricing
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
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
            <label className={labelClass}>Category</label>
            <select
              value={selectedCategoryId}
              onChange={(e) => setSelectedCategoryId(e.target.value)}
              className={inputClass}
            >
              <option value="">Select a category</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className={labelClass}>Selling Price (₹) *</label>
            <input
              type="number"
              value={form.price}
              onChange={(e) => updateField("price", e.target.value)}
              placeholder="4999"
              className={inputClass}
              required
            />
          </div>

          <div>
            <label className={labelClass}>Compare / Original Price (₹)</label>
            <input
              type="number"
              value={form.compare_at_price}
              onChange={(e) => updateField("compare_at_price", e.target.value)}
              placeholder="6499 (Shows discount if higher)"
              className={inputClass}
            />
          </div>

          <div>
            <label className={labelClass}>SKU / Item Code</label>
            <input
              type="text"
              value={form.sku}
              onChange={(e) => updateField("sku", e.target.value)}
              placeholder="AUR-LIN-01"
              className={inputClass}
            />
          </div>

          <div className="md:col-span-3">
            <label className={labelClass}>Short Tagline</label>
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
              rows={3}
              value={form.description}
              onChange={(e) => updateField("description", e.target.value)}
              placeholder="Describe the silhouette, fabric heritage, and craftsmanship story..."
              className={`${inputClass} resize-none`}
            />
          </div>
        </div>
      </section>

      {/* 2. Product Imagery (Cloudinary Upload) */}
      <section className="bg-white border border-[#D8C8AF] rounded-xs p-6 md:p-8 shadow-2xs space-y-6">
        <div className="flex items-center justify-between pb-2 border-b border-[#D8C8AF30]">
          <div>
            <h2 className="text-xs font-bold tracking-widest text-[#172744] uppercase">
              2. Product Photos & Gallery ({images.length})
            </h2>
            <p className="text-[11px] text-charcoal/60 mt-0.5">
              Upload high-resolution editorial photos. The first image will be the primary storefront cover.
            </p>
          </div>
        </div>

        {/* Upload Dropzone */}
        <label className="relative flex flex-col items-center justify-center p-8 border-2 border-dashed border-[#D8C8AF] hover:border-[#172744] bg-[#F8F6F0]/50 hover:bg-[#F8F6F0] rounded-xs cursor-pointer transition-colors group text-center">
          <div className="w-12 h-12 rounded-full bg-white border border-[#D8C8AF] flex items-center justify-center text-[#172744] group-hover:scale-110 transition-transform mb-3 shadow-2xs">
            {uploading ? <Loader2 size={20} className="animate-spin" /> : <Upload size={20} />}
          </div>
          <p className="text-xs font-bold uppercase tracking-wider text-[#172744] mb-1">
            {uploading ? uploadProgress : "Click to Upload Photos or Drag & Drop"}
          </p>
          <p className="text-[11px] text-charcoal/60">
            JPG, PNG, WebP supported • Direct Cloudinary CDN optimization
          </p>
          <input
            type="file"
            accept="image/*"
            multiple
            disabled={uploading}
            onChange={(e) => handleImageUpload(e.target.files)}
            className="hidden"
          />
        </label>

        {/* Image Grid */}
        {images.length > 0 && (
          <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 gap-3 pt-2">
            {images.map((img, idx) => (
              <div
                key={img.url}
                className={`group relative aspect-[3/4] rounded-xs overflow-hidden border bg-[#F8F6F0] shadow-2xs ${
                  idx === 0 ? "border-[#B9A77A] ring-2 ring-[#B9A77A]/40" : "border-[#D8C8AF]"
                }`}
              >
                <img
                  src={img.url}
                  alt={img.alt_text || `Product photo ${idx + 1}`}
                  className="w-full h-full object-cover"
                />

                {/* Primary Photo Badge */}
                {idx === 0 && (
                  <div className="absolute top-2 left-2 bg-[#B9A77A] text-[#F8F6F0] text-[9px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-2xs shadow-xs flex items-center gap-1">
                    <Star size={10} fill="currentColor" /> Primary
                  </div>
                )}

                {/* Hover Actions */}
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-between p-2">
                  <div className="flex justify-end">
                    <button
                      type="button"
                      onClick={() => removeImage(idx)}
                      className="p-1.5 bg-white/90 hover:bg-white text-rose-600 rounded-xs shadow-xs transition-colors"
                      title="Delete photo"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>

                  {idx !== 0 && (
                    <button
                      type="button"
                      onClick={() => setPrimaryImage(idx)}
                      className="w-full py-1.5 bg-white/90 hover:bg-white text-[#172744] text-[10px] font-bold uppercase tracking-wider rounded-xs shadow-xs transition-colors"
                    >
                      Set as Primary
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* 3. Garment Colours */}
      <section className="bg-white border border-[#D8C8AF] rounded-xs p-6 md:p-8 shadow-2xs space-y-6">
        <div>
          <h2 className="text-xs font-bold tracking-widest text-[#172744] uppercase pb-1">
            3. Garment Colours ({colours.length})
          </h2>
          <p className="text-[11px] text-charcoal/60">
            Add the available colour variations for this piece.
          </p>
        </div>

        {/* Quick Add Buttons */}
        <div className="space-y-2">
          <p className="text-[10px] font-bold uppercase tracking-wider text-[#172744]/70">
            Quick Add Common Linen Shades:
          </p>
          <div className="flex flex-wrap gap-2">
            {POPULAR_COLOURS.map((col) => {
              const alreadyAdded = colours.some(
                (c) => c.name.toLowerCase() === col.name.toLowerCase()
              );
              return (
                <button
                  key={col.name}
                  type="button"
                  onClick={() => addColour(col.name, col.hex)}
                  disabled={alreadyAdded}
                  className={`inline-flex items-center gap-2 px-3 py-1.5 text-xs font-medium rounded-xs border transition-colors ${
                    alreadyAdded
                      ? "border-[#D8C8AF]/40 bg-[#F8F6F0] text-charcoal/40 cursor-not-allowed"
                      : "border-[#D8C8AF] bg-white text-[#172744] hover:border-[#172744] hover:bg-[#F8F6F0]"
                  }`}
                >
                  <span
                    className="w-3 h-3 rounded-full border border-black/10"
                    style={{ backgroundColor: col.hex }}
                  />
                  <span>+ {col.name}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Custom Colour Input */}
        <div className="flex items-center gap-2 max-w-md">
          <input
            type="text"
            value={newColourInput}
            onChange={(e) => setNewColourInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && newColourInput.trim()) {
                e.preventDefault();
                addColour(newColourInput);
                setNewColourInput("");
              }
            }}
            placeholder="Type custom colour (e.g. Amber Gold)..."
            className={inputClass}
          />
          <button
            type="button"
            onClick={() => {
              if (newColourInput.trim()) {
                addColour(newColourInput);
                setNewColourInput("");
              }
            }}
            className="px-4 py-2.5 bg-[#172744] text-[#F8F6F0] text-xs font-bold uppercase tracking-wider rounded-xs hover:bg-[#101C32] transition-colors flex-shrink-0"
          >
            Add Colour
          </button>
        </div>

        {/* Added Colours List */}
        <div className="space-y-3 pt-2">
          <p className="text-[10px] font-bold uppercase tracking-wider text-[#172744]/70">
            Active Garment Colours:
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            {colours.map((c) => (
              <div
                key={c.id}
                className="flex items-center justify-between gap-3 p-3 bg-[#F8F6F0]/40 border border-[#D8C8AF] rounded-xs"
              >
                <div className="flex items-center gap-2.5">
                  <input
                    type="color"
                    value={c.hex}
                    onChange={(e) => {
                      const newHex = e.target.value;
                      setColours((prev) =>
                        prev.map((item) => (item.id === c.id ? { ...item, hex: newHex } : item))
                      );
                    }}
                    className="w-7 h-7 rounded-xs cursor-pointer border border-black/10"
                    title="Change swatch color"
                  />
                  <span className="text-xs font-semibold text-[#172744]">{c.name}</span>
                </div>

                <button
                  type="button"
                  onClick={() => removeColour(c.id)}
                  className="p-1.5 text-charcoal/40 hover:text-rose-600 transition-colors"
                  title="Remove colour"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 4. Sizes & Stock Availability */}
      <section className="bg-white border border-[#D8C8AF] rounded-xs p-6 md:p-8 shadow-2xs space-y-6">
        <div>
          <h2 className="text-xs font-bold tracking-widest text-[#172744] uppercase pb-1">
            4. Available Sizes & Inventory Status
          </h2>
          <p className="text-[11px] text-charcoal/60">
            Click to toggle which sizes are available for this garment.
          </p>
        </div>

        {/* Size Pills Toggle */}
        <div className="space-y-3">
          <p className="text-[10px] font-bold uppercase tracking-wider text-[#172744]/70">
            Select Available Sizes:
          </p>
          <div className="flex flex-wrap gap-2.5">
            {STANDARD_SIZES.map((sz) => {
              const isSelected = selectedSizes.includes(sz);
              return (
                <button
                  key={sz}
                  type="button"
                  onClick={() => toggleSize(sz)}
                  className={`min-w-[54px] py-2.5 px-4 text-xs font-bold tracking-wider rounded-xs border transition-all flex items-center justify-center gap-1.5 ${
                    isSelected
                      ? "bg-[#172744] text-[#F8F6F0] border-[#172744] shadow-xs"
                      : "bg-[#F8F6F0]/50 text-charcoal/60 border-[#D8C8AF] hover:border-[#172744] hover:bg-white"
                  }`}
                >
                  {isSelected && <Check size={12} />}
                  <span>{sz}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Custom Size Input */}
        <div className="flex items-center gap-2 max-w-xs pt-2">
          <input
            type="text"
            value={customSizeInput}
            onChange={(e) => setCustomSizeInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && customSizeInput.trim()) {
                e.preventDefault();
                addCustomSize();
              }
            }}
            placeholder="Custom size (e.g. 38, Free Size)..."
            className={inputClass}
          />
          <button
            type="button"
            onClick={addCustomSize}
            className="px-3.5 py-2.5 bg-[#172744] text-[#F8F6F0] text-xs font-bold uppercase tracking-wider rounded-xs hover:bg-[#101C32] transition-colors flex-shrink-0"
          >
            + Add
          </button>
        </div>

        {/* Inventory Master Switch */}
        <div className="pt-4 border-t border-[#D8C8AF30]">
          <label className="flex items-center justify-between p-4 bg-[#F8F6F0]/60 border border-[#D8C8AF] rounded-xs cursor-pointer select-none">
            <div>
              <p className="text-xs font-bold text-[#172744] uppercase tracking-wider">
                Overall Stock Availability
              </p>
              <p className="text-[11px] text-charcoal/60 mt-0.5">
                {inStock
                  ? "Garment is in stock and available for clients to add to bag."
                  : "Garment is marked as Sold Out."}
              </p>
            </div>
            <input
              type="checkbox"
              checked={inStock}
              onChange={(e) => setInStock(e.target.checked)}
              className="w-5 h-5 accent-[#172744] rounded cursor-pointer"
            />
          </label>
        </div>
      </section>

      {/* 5. Storefront Promotional Badge */}
      <section className="bg-white border border-[#D8C8AF] rounded-xs p-6 md:p-8 shadow-2xs space-y-6">
        <div>
          <h2 className="text-xs font-bold tracking-widest text-[#172744] uppercase pb-1">
            5. Storefront Badge & Highlight
          </h2>
          <p className="text-[11px] text-charcoal/60">
            Select a promotional tag to display on this garment in product grids.
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
          {[
            {
              id: "none",
              label: "No Badge",
              desc: "Clean photo (Default)",
              badgeClass: "border-[#D8C8AF] bg-white text-charcoal",
            },
            {
              id: "new",
              label: "NEW",
              desc: "Gold 'NEW' badge",
              badgeClass: "border-[#B9A77A] bg-[#B9A77A]/10 text-[#B9A77A]",
            },
            {
              id: "best_seller",
              label: "BEST SELLER",
              desc: "Navy signature badge",
              badgeClass: "border-[#172744] bg-[#172744]/10 text-[#172744]",
            },
            {
              id: "low_stock",
              label: "LOW STOCK",
              desc: "Beige urgency badge",
              badgeClass: "border-amber-600 bg-amber-50 text-amber-900",
            },
            {
              id: "sold_out",
              label: "SOLD OUT",
              desc: "Dark archive badge",
              badgeClass: "border-neutral-700 bg-neutral-100 text-neutral-800",
            },
          ].map((badge) => (
            <button
              key={badge.id}
              type="button"
              onClick={() => {
                setSelectedBadge(badge.id as any);
                if (badge.id === "sold_out") {
                  setInStock(false);
                } else if (!inStock) {
                  setInStock(true);
                }
              }}
              className={`p-3.5 border rounded-xs text-left transition-all cursor-pointer ${
                selectedBadge === badge.id
                  ? "ring-2 ring-[#172744] font-semibold " + badge.badgeClass
                  : "border-[#D8C8AF]/60 hover:border-[#172744] bg-[#F8F6F0]/30"
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-bold uppercase tracking-wider">{badge.label}</span>
                {selectedBadge === badge.id && <span className="w-2 h-2 rounded-full bg-[#172744]" />}
              </div>
              <p className="text-[10px] text-charcoal/60">{badge.desc}</p>
            </button>
          ))}
        </div>

        <div className="pt-4 border-t border-[#D8C8AF30]">
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={form.is_featured}
              onChange={(e) => updateField("is_featured", e.target.checked)}
              className="w-4 h-4 accent-[#172744] rounded"
            />
            <div>
              <span className="text-xs font-semibold text-[#172744]">Featured on Homepage Curated Showcase</span>
              <p className="text-[10px] text-charcoal/50">
                Display this garment in the Signature / Featured pieces gallery on the main storefront.
              </p>
            </div>
          </label>
        </div>
      </section>

      {/* 6. Fabric & Care Specifications */}
      <section className="bg-white border border-[#D8C8AF] rounded-xs p-6 md:p-8 shadow-2xs space-y-6">
        <h2 className="text-xs font-bold tracking-widest text-[#172744] uppercase pb-2 border-b border-[#D8C8AF30]">
          6. Fabric & Care Details (Optional)
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <div>
            <label className={labelClass}>Material Composition</label>
            <input
              type="text"
              value={form.material}
              onChange={(e) => updateField("material", e.target.value)}
              placeholder="e.g. 100% French Flax Linen"
              className={inputClass}
            />
          </div>

          <div>
            <label className={labelClass}>Fabric Weight / Weave</label>
            <input
              type="text"
              value={form.fabric}
              onChange={(e) => updateField("fabric", e.target.value)}
              placeholder="e.g. 180 GSM Breathable Weave"
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
              placeholder="e.g. Cold gentle machine wash. Hang dry in shade..."
              className={`${inputClass} resize-none`}
            />
          </div>
        </div>
      </section>

      {/* Bottom Save Action Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 p-6 bg-white border border-[#D8C8AF] rounded-xs shadow-sm">
        <div className="flex items-center gap-3">
          <Link
            href="/admin/products"
            className="px-6 py-2.5 border border-[#D8C8AF] text-[#172744] text-xs font-semibold uppercase tracking-wider rounded-xs hover:bg-[#F8F6F0] transition-colors"
          >
            Cancel
          </Link>
          {initialProduct?.id && (
            <ProductDeleteButton
              productId={initialProduct.id}
              productName={form.name || "Garment"}
              variant="button"
            />
          )}
        </div>

        <button
          type="button"
          onClick={handleSave}
          disabled={saving}
          className="inline-flex items-center gap-2 px-8 py-3 bg-[#172744] text-[#F8F6F0] hover:bg-[#101C32] text-xs font-semibold uppercase tracking-widest rounded-xs shadow-sm disabled:opacity-50 transition-all"
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
