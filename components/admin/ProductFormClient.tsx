"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { slugify } from "@/lib/utils/format";
import { Plus, Trash2, Upload, Save, ArrowLeft, Loader2, Image as ImageIcon } from "lucide-react";
import { uploadToCloudinary } from "@/lib/upload";
import Link from "next/link";
import ProductDeleteButton from "./ProductDeleteButton";

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
  image_url?: string;
  show_on_storefront?: boolean;
}

interface SizeEntry {
  id?: string;
  size: string;
  price: string;
  sku: string;
  is_available: boolean;
  stock_quantity: number;
  image_url?: string;
}

interface ColorGroup {
  id: string;
  colour: string;
  colour_hex: string;
  image_urls: string[];
  show_on_storefront: boolean;
  sizes: SizeEntry[];
}

const makeId = () => `id-${Date.now()}-${Math.random().toString(16).slice(2)}`;

const createColorGroups = (existingVariants: Variant[]): ColorGroup[] => {
  const groups = new Map<string, ColorGroup>();

  existingVariants.forEach((variant, index) => {
    const colourName = (variant.colour || "Standard").trim() || "Standard";
    const key = colourName.toLowerCase();

    if (!groups.has(key)) {
      groups.set(key, {
        id: `color-${index}-${key}`,
        colour: colourName,
        colour_hex: variant.colour_hex || "#D8C8AF",
        image_urls: variant.image_url ? [variant.image_url] : [],
        show_on_storefront: !!variant.show_on_storefront,
        sizes: [],
      });
    }

    const group = groups.get(key)!;
    const sizeName = (variant.size || "ONE SIZE").trim() || "ONE SIZE";

    group.sizes.push({
      id: variant.id || makeId(),
      size: sizeName,
      price: variant.price?.toString() || "",
      sku: variant.sku || "",
      is_available: variant.is_available !== false,
      stock_quantity: variant.stock_quantity ?? (variant.is_available !== false ? 1 : 0),
      image_url: variant.image_url || group.image_urls[0] || "",
    });
  });

  return Array.from(groups.values());
};

const flattenColorGroups = (
  groups: ColorGroup[],
  fallbackPrice: string,
  fallbackSku: string,
  totalStockEnabled: boolean
): Variant[] =>
  groups.flatMap((group) =>
    group.sizes.map((sizeEntry) => {
      const isAvailable = totalStockEnabled ? sizeEntry.is_available : false;
      const stockQuantity = totalStockEnabled ? Number(sizeEntry.stock_quantity || 0) : 0;

      return {
        id: sizeEntry.id,
        size: sizeEntry.size,
        colour: group.colour,
        colour_hex: group.colour_hex,
        price: sizeEntry.price || fallbackPrice || "149",
        stock_quantity: stockQuantity,
        sku:
          sizeEntry.sku ||
          (fallbackSku ? `${fallbackSku}-${group.colour}-${sizeEntry.size}` : `${group.colour}-${sizeEntry.size}`),
        is_available: isAvailable,
        image_url: group.image_urls[0] || sizeEntry.image_url || "",
        show_on_storefront: group.show_on_storefront,
      };
    })
  );

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

  const [selectedBadge, setSelectedBadge] = useState<"none" | "new" | "best_seller" | "low_stock" | "sold_out">(getInitialBadge());
  const [colorGroups, setColorGroups] = useState<ColorGroup[]>(createColorGroups(initialProduct?.variants || []));
  const [customSizeInputs, setCustomSizeInputs] = useState<Record<string, string>>({});
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

  useEffect(() => {
    const loadCategories = async () => {
      try {
        const res = await fetch("/api/admin/categories");
        const data = await res.json();
        if (res.ok && Array.isArray(data?.data)) {
          setCategories(data.data);
        }
      } catch {
        // ignore category load failure
      }
    };

    loadCategories();
  }, []);

  const totalStockEnabled = Number(form.stock_quantity) > 0;

  const variants = useMemo(
    () => flattenColorGroups(colorGroups, form.price || "149", form.sku || "", totalStockEnabled),
    [colorGroups, form.price, form.sku, totalStockEnabled]
  );

  const colorGalleryImages = useMemo(
    () =>
      colorGroups.flatMap((group) =>
        group.image_urls.map((url, index) => ({
          url,
          alt_text: `${group.colour} ${index + 1}`,
        }))
      ),
    [colorGroups]
  );

  const primaryProductImage = useMemo(
    () => colorGalleryImages[0]?.url || images[0]?.url || initialProduct?.primary_image_url || null,
    [colorGalleryImages, images, initialProduct?.primary_image_url]
  );

  const updateField = <K extends keyof FormData>(key: K, value: FormData[K]) => {
    setForm((prev) => ({
      ...prev,
      [key]: value,
      ...(key === "name" && !initialProduct ? { slug: slugify(value as string) } : {}),
    }));
  };

  const addColorGroup = (colourName?: string) => {
    const nextColour = colourName || `Color ${colorGroups.length + 1}`;
    const isDuplicate = colorGroups.some((group) => group.colour.toLowerCase() === nextColour.toLowerCase());

    if (isDuplicate) {
      toast.info(`Color ${nextColour} already exists`);
      return;
    }

    setColorGroups((prev) => [
      ...prev,
      {
        id: makeId(),
        colour: nextColour,
        colour_hex: "#D8C8AF",
        image_urls: [],
        show_on_storefront: prev.length === 0,
        sizes: [],
      },
    ]);
  };

  const addSizeToColour = (colourName: string, sizeName: string) => {
    const normalizedSize = sizeName.trim();
    if (!normalizedSize) return;

    setColorGroups((prev) => {
      const groupIndex = prev.findIndex((group) => group.colour.toLowerCase() === colourName.toLowerCase());

      if (groupIndex >= 0) {
        const existingGroup = prev[groupIndex];
        const hasSize = existingGroup.sizes.some((sizeEntry) => sizeEntry.size.toUpperCase() === normalizedSize.toUpperCase());

        if (hasSize) {
          toast.info(`${colourName} already contains size ${normalizedSize}`);
          return prev;
        }

        return prev.map((group, index) =>
          index === groupIndex
            ? {
                ...group,
                sizes: [
                  ...group.sizes,
                  {
                    id: makeId(),
                    size: normalizedSize.toUpperCase(),
                    price: form.price || "149",
                    sku: form.sku ? `${form.sku}-${colourName}-${normalizedSize}` : "",
                    is_available: true,
                    stock_quantity: 1,
                  },
                ],
              }
            : group
        );
      }

      return [
        ...prev,
        {
          id: makeId(),
          colour: colourName,
          colour_hex: "#D8C8AF",
          image_urls: [],
          show_on_storefront: prev.length === 0,
          sizes: [
            {
              id: makeId(),
              size: normalizedSize.toUpperCase(),
              price: form.price || "149",
              sku: form.sku ? `${form.sku}-${colourName}-${normalizedSize}` : "",
              is_available: true,
              stock_quantity: 1,
            },
          ],
        },
      ];
    });

    toast.success(`${colourName} - ${normalizedSize.toUpperCase()} added`);
  };

  const addAllStandardSizesToColour = (colourName: string) => {
    setColorGroups((prev) => {
      const groupIndex = prev.findIndex((group) => group.colour.toLowerCase() === colourName.toLowerCase());

      if (groupIndex >= 0) {
        const existingSizes = new Set(prev[groupIndex].sizes.map((sizeEntry) => sizeEntry.size.toUpperCase()));
        const sizesToAdd = PRODUCT_SIZES.filter((size) => !existingSizes.has(size));

        if (sizesToAdd.length === 0) {
          toast.info(`All standard sizes already added for ${colourName}`);
          return prev;
        }

        return prev.map((group, index) =>
          index === groupIndex
            ? {
                ...group,
                sizes: [
                  ...group.sizes,
                  ...sizesToAdd.map((size) => ({
                    id: makeId(),
                    size,
                    price: form.price || "149",
                    sku: form.sku ? `${form.sku}-${colourName}-${size}` : "",
                    is_available: true,
                    stock_quantity: 1,
                  })),
                ],
              }
            : group
        );
      }

      return [
        ...prev,
        {
          id: makeId(),
          colour: colourName,
          colour_hex: "#D8C8AF",
          image_urls: [],
          show_on_storefront: prev.length === 0,
          sizes: PRODUCT_SIZES.map((size) => ({
            id: makeId(),
            size,
            price: form.price || "149",
            sku: form.sku ? `${form.sku}-${colourName}-${size}` : "",
            is_available: true,
            stock_quantity: 1,
          })),
        },
      ];
    });

    toast.success(`Added standard sizes for ${colourName}`);
  };

  const updateSizeEntry = (groupId: string, sizeId: string, key: keyof SizeEntry, value: string | number | boolean) => {
    setColorGroups((prev) =>
      prev.map((group) =>
        group.id === groupId
          ? {
              ...group,
              sizes: group.sizes.map((sizeEntry) =>
                sizeEntry.id === sizeId ? { ...sizeEntry, [key]: value } : sizeEntry
              ),
            }
          : group
      )
    );
  };

  const removeSizeFromColour = (groupId: string, sizeId: string) => {
    setColorGroups((prev) =>
      prev
        .map((group) =>
          group.id === groupId
            ? { ...group, sizes: group.sizes.filter((sizeEntry) => sizeEntry.id !== sizeId) }
            : group
        )
        .filter((group) => group.sizes.length > 0)
    );
  };

  const removeColorGroup = (groupId: string) => {
    setColorGroups((prev) => {
      const filtered = prev.filter((group) => group.id !== groupId);
      if (filtered.length > 0 && !filtered.some((group) => group.show_on_storefront)) {
        filtered[0].show_on_storefront = true;
      }
      return filtered;
    });
  };

  const setStorefrontColor = (groupId: string) => {
    setColorGroups((prev) =>
      prev.map((group) => ({
        ...group,
        show_on_storefront: group.id === groupId,
      }))
    );
  };

  const uploadColorImages = async (groupId: string, files: FileList | null) => {
    if (!files || files.length === 0) return;

    const uploadedUrls: string[] = [];

    for (const file of Array.from(files)) {
      const result = await uploadToCloudinary(file, "products", () => undefined);
      if (result.success && result.url) {
        uploadedUrls.push(result.url);
      } else {
        toast.error(result.error || "Color image upload failed");
      }
    }

    if (uploadedUrls.length === 0) return;

    setColorGroups((prev) =>
      prev.map((group) =>
        group.id === groupId ? { ...group, image_urls: [...group.image_urls, ...uploadedUrls] } : group
      )
    );
    toast.success(`${uploadedUrls.length} color image${uploadedUrls.length > 1 ? "s" : ""} uploaded`);
  };

  const removeColorImage = (groupId: string, imageUrl: string) => {
    setColorGroups((prev) =>
      prev.map((group) =>
        group.id === groupId ? { ...group, image_urls: group.image_urls.filter((url) => url !== imageUrl) } : group
      )
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
        category_id: selectedCategoryId || null,
        primary_image_url: primaryProductImage,
        images: colorGalleryImages.length > 0 ? colorGalleryImages : images,
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
     

          {initialProduct?.id && (
            <ProductDeleteButton
              productId={initialProduct.id}
              productName={form.name || "Garment"}
              variant="button"
            />
          )}

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

          <div>
            <label className={labelClass}>Category</label>
            <select
              value={selectedCategoryId}
              onChange={(e) => setSelectedCategoryId(e.target.value)}
              className={inputClass}
            >
              <option value="">Select a category</option>
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
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
            <label className="flex items-center gap-3 px-4 py-3 bg-[#F8F6F0] border border-[#D8C8AF] rounded-sm cursor-pointer w-full min-h-[48px]">
              <input
                type="checkbox"
                checked={Number(form.stock_quantity) > 0}
                onChange={(e) => updateField("stock_quantity", e.target.checked ? 1 : 0)}
                className="w-4 h-4 accent-[#172744] rounded"
              />
              <span className="text-sm font-medium text-[#242424]">
                {Number(form.stock_quantity) > 0 ? "In Stock" : "Out of Stock"}
              </span>
            </label>
          </div>
        </div>

        {/* Storefront Badge Selector */}
        <div className="pt-6 border-t border-[#D8C8AF40] space-y-4">
          <div>
            <label className={labelClass}>Storefront Display Badge</label>
            <p className="text-[11px] text-charcoal/60 mb-3">
              Select which promotional badge to display on this product across the shop and product details.
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
              {[
                { id: "none", label: "No Badge", desc: "Clean photo (Default)", badgeClass: "border-[#D8C8AF] bg-white text-charcoal" },
                { id: "new", label: "NEW", desc: "Gold 'NEW' badge", badgeClass: "border-[#B9A77A] bg-[#B9A77A]/10 text-[#B9A77A]" },
                { id: "best_seller", label: "BEST SELLER", desc: "Navy signature badge", badgeClass: "border-[#172744] bg-[#172744]/10 text-[#172744]" },
                { id: "low_stock", label: "LOW STOCK", desc: "Beige urgency badge", badgeClass: "border-amber-600 bg-amber-50 text-amber-900" },
                { id: "sold_out", label: "SOLD OUT", desc: "Dark archive badge", badgeClass: "border-neutral-700 bg-neutral-100 text-neutral-800" },
              ].map((badge) => (
                <button
                  key={badge.id}
                  type="button"
                  onClick={() => {
                    setSelectedBadge(badge.id as any);
                    if (badge.id === "new") {
                      updateField("is_new_arrival", true);
                      updateField("is_best_seller", false);
                      updateField("stock_quantity", 50);
                      updateField("low_stock_threshold", 0);
                    } else if (badge.id === "best_seller") {
                      updateField("is_new_arrival", false);
                      updateField("is_best_seller", true);
                      updateField("stock_quantity", 50);
                      updateField("low_stock_threshold", 0);
                    } else if (badge.id === "low_stock") {
                      updateField("is_new_arrival", false);
                      updateField("is_best_seller", false);
                      updateField("stock_quantity", 2);
                      updateField("low_stock_threshold", 5);
                    } else if (badge.id === "sold_out") {
                      updateField("is_new_arrival", false);
                      updateField("is_best_seller", false);
                      updateField("stock_quantity", 0);
                      updateField("low_stock_threshold", 0);
                    } else {
                      updateField("is_new_arrival", false);
                      updateField("is_best_seller", false);
                      updateField("stock_quantity", 50);
                      updateField("low_stock_threshold", 0);
                    }
                  }}
                  className={`p-3 border rounded-sm text-left transition-all cursor-pointer ${
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
          </div>

          <div className="pt-3 flex items-center gap-2 cursor-pointer">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={form.is_featured}
                onChange={(e) => updateField("is_featured", e.target.checked)}
                className="w-4 h-4 accent-[#172744] rounded"
              />
              <span className="text-xs font-semibold text-[#172744]">Featured on Homepage Curated Showcase</span>
            </label>
          </div>
        </div>
      </section>

      {/* 4. Color + Size + Stock Availability Management */}
      <section className="bg-white border border-[#D8C8AF] rounded-sm p-6 md:p-8 shadow-sm space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-[#D8C8AF30]">
          <div>
            <h2 className="text-xs font-semibold tracking-widest text-[#172744] uppercase">
              4. COLOR + SIZE + STOCK
            </h2>
            <p className="text-[11px] text-charcoal/50 mt-0.5">
              Add multiple colours, assign sizes to each colour, and manage availability independently for every colour and size combination.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => addColorGroup()}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#172744] text-[#F8F6F0] text-xs font-semibold uppercase tracking-wider rounded-sm hover:bg-[#101C32] transition-colors"
            >
              <Plus size={13} /> Add Color
            </button>
          </div>
        </div>

        {colorGroups.length === 0 ? (
          <div className="p-8 bg-[#F8F6F0] border border-dashed border-[#D8C8AF] rounded text-center space-y-3">
            <p className="text-xs text-charcoal/60">No colours added yet for this product.</p>
            <button
              type="button"
              onClick={() => addColorGroup()}
              className="px-4 py-2 bg-[#172744] text-[#F8F6F0] text-xs font-semibold uppercase tracking-wider rounded-sm hover:bg-[#101C32] transition-colors"
            >
              + Add First Color
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {colorGroups.map((group) => (
              <div key={group.id} className="rounded-sm border border-[#D8C8AF] bg-[#F8F6F0]/60 p-4 space-y-4">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                  <div className="flex items-center gap-3 w-full md:max-w-sm">
                    <input
                      type="text"
                      value={group.colour}
                      onChange={(e) =>
                        setColorGroups((prev) =>
                          prev.map((item) =>
                            item.id === group.id ? { ...item, colour: e.target.value } : item
                          )
                        )
                      }
                      placeholder="Colour name"
                      className="w-full px-3 py-2 bg-white border border-[#D8C8AF] text-sm rounded-sm"
                    />
                    <label className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-wider text-[#172744]">
                      <span>Hex</span>
                      <input
                        type="color"
                        value={group.colour_hex}
                        onChange={(e) =>
                          setColorGroups((prev) =>
                            prev.map((item) =>
                              item.id === group.id ? { ...item, colour_hex: e.target.value } : item
                            )
                          )
                        }
                        className="w-10 h-10 rounded-sm cursor-pointer"
                      />
                    </label>
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    <label className="inline-flex items-center gap-2 px-2.5 py-1.5 bg-white border border-[#D8C8AF] rounded-sm cursor-pointer text-[10px] font-semibold uppercase tracking-wider text-[#172744] hover:border-[#172744]">
                      <input
                        type="checkbox"
                        checked={group.show_on_storefront}
                        onChange={() => setStorefrontColor(group.id)}
                        className="w-3.5 h-3.5 accent-[#172744] rounded"
                      />
                      Card color
                    </label>

                    <label className="relative inline-flex items-center gap-2 px-2.5 py-1.5 bg-white border border-[#D8C8AF] rounded-sm cursor-pointer text-[10px] font-semibold uppercase tracking-wider text-[#172744] hover:border-[#172744]">
                      {group.image_urls.length > 0 ? "Upload More" : "Upload Images"}
                      <Upload size={12} />
                      <input
                        type="file"
                        accept="image/*"
                        multiple
                        className="hidden"
                        onChange={(e) => uploadColorImages(group.id, e.target.files)}
                      />
                    </label>
                    <button
                      type="button"
                      onClick={() => addAllStandardSizesToColour(group.colour)}
                      className="px-2.5 py-1.5 bg-white border border-[#D8C8AF] text-[#172744] text-[10px] font-semibold uppercase tracking-wider rounded-sm hover:border-[#172744]"
                    >
                      + All Sizes
                    </button>
                    <button
                      type="button"
                      onClick={() => removeColorGroup(group.id)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-sm transition-colors"
                      title="Remove colour"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                </div>

                <div className="space-y-3">
                  {group.image_urls.length > 0 ? (
                    <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-3">
                      {group.image_urls.map((imageUrl, index) => (
                        <div key={`${group.id}-${index}`} className="relative aspect-[3/4] overflow-hidden rounded-sm border border-[#D8C8AF] bg-[#F8F6F0]">
                          <img src={imageUrl} alt={`${group.colour} uploaded ${index + 1}`} className="w-full h-full object-cover" />
                          <button
                            type="button"
                            onClick={() => removeColorImage(group.id, imageUrl)}
                            className="absolute top-1.5 right-1.5 p-1 bg-white/90 text-red-600 rounded-sm shadow-sm hover:bg-white"
                            title="Remove image"
                          >
                            <Trash2 size={12} />
                          </button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="rounded-sm border border-dashed border-[#D8C8AF] bg-[#F8F6F0] p-4 text-center text-[11px] text-charcoal/60">
                      No color photos uploaded yet.
                    </div>
                  )}
                </div>

                <div className="p-3 bg-white border border-[#D8C8AF]/80 rounded-sm space-y-3">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[#172744]/70 mr-1">
                      Quick Add Size:
                    </span>
                    {PRODUCT_SIZES.map((size) => (
                      <button
                        key={size}
                        type="button"
                        onClick={() => addSizeToColour(group.colour, size)}
                        className="px-2.5 py-1 bg-[#F8F6F0] border border-[#D8C8AF] text-[#172744] hover:bg-[#172744] hover:text-[#F8F6F0] font-semibold text-[10px] rounded-sm transition-colors"
                      >
                        + {size}
                      </button>
                    ))}
                    <div className="flex items-center gap-1.5 ml-auto min-w-[180px]">
                      <input
                        type="text"
                        value={customSizeInputs[group.id] || ""}
                        onChange={(e) =>
                          setCustomSizeInputs((prev) => ({
                            ...prev,
                            [group.id]: e.target.value,
                          }))
                        }
                        onKeyDown={(e) => {
                          if (e.key === "Enter" && (customSizeInputs[group.id] || "").trim()) {
                            e.preventDefault();
                            addSizeToColour(group.colour, customSizeInputs[group.id]);
                            setCustomSizeInputs((prev) => ({ ...prev, [group.id]: "" }));
                          }
                        }}
                        placeholder="Custom size"
                        className="flex-1 px-2.5 py-1.5 text-xs border border-[#D8C8AF] bg-white rounded-sm outline-none"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          const value = (customSizeInputs[group.id] || "").trim();
                          if (!value) return;
                          addSizeToColour(group.colour, value);
                          setCustomSizeInputs((prev) => ({ ...prev, [group.id]: "" }));
                        }}
                        className="px-3 py-1.5 bg-[#172744] text-white text-[10px] font-semibold uppercase tracking-wider rounded-sm disabled:opacity-40"
                      >
                        Add
                      </button>
                    </div>
                  </div>

                  {group.sizes.length === 0 ? (
                    <div className="rounded-sm border border-dashed border-[#D8C8AF] bg-[#F8F6F0] p-4 text-center text-[11px] text-charcoal/60">
                      No sizes added for this colour yet.
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {group.sizes.map((sizeEntry) => (
                        <div
                          key={sizeEntry.id}
                          className={`grid grid-cols-1 md:grid-cols-[1fr_1fr_auto] gap-3 items-center p-3 rounded-sm  ${
                            sizeEntry.is_available
                              ? "border-gray-100"
                              : "border-gray-100"
                          }`}
                        >
                          <div>
                            <label className="text-[10px] font-bold uppercase tracking-wider text-[#172744] block mb-1">
                              Size
                            </label>
                            <input
                              type="text"
                              value={sizeEntry.size}
                              onChange={(e) =>
                                updateSizeEntry(group.id, sizeEntry.id || "", "size", e.target.value.toUpperCase())
                              }
                              className="w-full px-2.5 py-1.5 bg-white border border-[#D8C8AF] text-xs font-semibold uppercase rounded-sm"
                            />
                          </div>

                          <div>
                            <label className="text-[10px] font-bold uppercase tracking-wider text-[#172744] block mb-1">
                              Availability
                            </label>
                            <label
                              className={`flex items-center gap-2 px-3 py-2 rounded-sm border cursor-pointer select-none transition-colors ${
                                sizeEntry.is_available
                                  ? "bg-emerald-50 border-emerald-300 text-emerald-800"
                                  : "bg-rose-50 border-rose-300 text-rose-800"
                              }`}
                            >
                              <input
                                type="checkbox"
                                checked={sizeEntry.is_available}
                                onChange={(e) =>
                                  updateSizeEntry(group.id, sizeEntry.id || "", "is_available", e.target.checked)
                                }
                                className="w-4 h-4 accent-[#172744] rounded cursor-pointer"
                              />
                              <span className="text-xs font-semibold tracking-wide">
                                {sizeEntry.is_available ? "In Stock" : "Out of Stock"}
                              </span>
                            </label>
                          </div>

                          <div className="flex justify-end">
                            <button
                              type="button"
                              onClick={() => removeSizeFromColour(group.id, sizeEntry.id || "")}
                              className="p-2 text-red-600 hover:bg-red-50 rounded-sm transition-colors"
                              title="Remove size"
                            >
                              <Trash2 size={15} />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
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
      <div className="flex flex-wrap items-center justify-between gap-4 p-6 bg-white border border-[#D8C8AF] rounded-sm shadow-sm">
        <div className="flex items-center gap-3">
          <Link
            href="/admin/products"
            className="px-6 py-2.5 border border-[#D8C8AF] text-[#172744] text-xs font-semibold uppercase tracking-wider rounded-sm hover:bg-[#F8F6F0] transition-colors"
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
