"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ChevronRight, MessageCircle, Heart, ShoppingBag, Plus, Minus, Check, ShieldCheck, Truck, RotateCcw, ArrowRight } from "lucide-react";
import { useCart } from "@/contexts/CartContext";
import { useWishlist } from "@/contexts/WishlistContext";
import { formatPrice, getDiscountPercentage } from "@/lib/utils/format";
import { buildWhatsAppUrl } from "@/lib/utils/whatsapp";
import type { Product, ProductVariant, WhatsAppSettings } from "@/types/database";
import { toast } from "sonner";
import { createClient } from "@/utils/supabase/client";

interface Props {
  product: Product;
  whatsappSettings: WhatsAppSettings | null;
}

export default function ProductDetailClient({ product, whatsappSettings }: Props) {
  const isVariantAvailable = (variant: ProductVariant) =>
    variant.is_available !== false || (variant.stock_quantity ?? 0) > 0;

  const firstColourWithStock =
    product.product_variants?.find(
      (v) => v.colour && v.colour.trim() !== "" && isVariantAvailable(v)
    )?.colour ??
    product.product_variants?.find((v) => v.colour && v.colour.trim() !== "")?.colour ??
    null;

  const firstAvailableSizeForColour = (colour: string | null) =>
    product.product_variants?.find(
      (v) =>
        (!colour || v.colour === colour) &&
        v.size &&
        isVariantAvailable(v)
    )?.size ??
    product.product_variants?.find((v) => (!colour || v.colour === colour) && v.size)?.size ??
    null;

  const [selectedColour, setSelectedColour] = useState<string | null>(firstColourWithStock);
  const [selectedSize, setSelectedSize] = useState<string | null>(() => firstAvailableSizeForColour(firstColourWithStock));
  const [quantity, setQuantity] = useState(1);
  const [activeImage, setActiveImage] = useState(0);
  const [expandedSection, setExpandedSection] = useState<string | null>("description");
  const [isAdding, setIsAdding] = useState(false);
  const { addItem, openCart, closeCart } = useCart();
  const { isInWishlist, toggleWishlist } = useWishlist();
  const router = useRouter();

  const resolveColourImage = (colour: string | null) => {
    if (!colour) return null;

    const normalized = colour.trim().toLowerCase();

    const variantImage = product.product_variants?.find(
      (v) => v.colour?.trim().toLowerCase() === normalized && v.image_url
    )?.image_url;

    if (variantImage) return variantImage;

    const productImage = product.product_images?.find((img) => {
      const altText = (img.alt_text || "").toLowerCase();
      return altText.includes(normalized) || altText.includes(normalized.replace(/\s+/g, "-"));
    })?.url;

    return productImage || null;
  };

  const selectedColourImage = resolveColourImage(selectedColour);

  const variantGalleryImages = Array.from(
    new Map(
      (product.product_variants ?? [])
        .filter((v): v is ProductVariant & { image_url: string } => Boolean(v.image_url && v.image_url.trim() !== ""))
        .map((v) => [v.image_url, {
          url: v.image_url,
          alt_text: `${v.colour || product.name} ${v.size || ""}`.trim() || product.name,
          id: `variant-${v.id}`,
          sort_order: 1,
        }])
    ).values()
  );

  useEffect(() => {
    setActiveImage(0);
  }, [selectedColour]);

  useEffect(() => {
    if (!selectedColour) return;
    const nextSize = firstAvailableSizeForColour(selectedColour);
    setSelectedSize((current) => {
      const availableSizes = (product.product_variants ?? [])
        .filter((v) => v.colour === selectedColour && v.size)
        .map((v) => v.size);

      if (current && availableSizes.includes(current)) return current;
      return nextSize;
    });
  }, [selectedColour, product.product_variants]);

  const productImages = [
    ...(selectedColourImage
      ? [{ url: selectedColourImage, alt_text: `${selectedColour} ${product.name}`, id: `colour-${selectedColour}`, sort_order: -1 }]
      : []),
    ...(product.primary_image_url && selectedColourImage !== product.primary_image_url
      ? [{ url: product.primary_image_url, alt_text: product.name, id: "primary", sort_order: 0 }]
      : []),
    ...variantGalleryImages.filter((img) => img.url !== selectedColourImage && img.url !== product.primary_image_url),
    ...(product.product_images?.sort((a, b) => a.sort_order - b.sort_order) || []).filter(
      (img) => img.url !== selectedColourImage && img.url !== product.primary_image_url
    ),
  ];

  const images = productImages
    .map((img) => ({ ...img, alt_text: img.alt_text ?? product.name }))
    .filter((img): img is { url: string; alt_text: string; id: string; sort_order: number } => Boolean(img.url))
    .filter((img, index, arr) => arr.findIndex((candidate) => candidate.url === img.url) === index);

  // Unique colours
  const colours = Array.from(
    new Map(
      product.product_variants?.filter((v) => v.colour).map((v) => [v.colour, v]) ?? []
    ).values()
  );

  // Sizes for selected colour (or all available sizes)
  const colourMatchedSizes = selectedColour
    ? (product.product_variants?.filter((v) => v.colour === selectedColour && v.size) ?? [])
    : [];

  const sizesForColour = colourMatchedSizes.length > 0
    ? colourMatchedSizes
    : (product.product_variants?.filter((v) => v.size) ?? []);

  // Selected variant
  const selectedVariant: ProductVariant | undefined = product.product_variants?.find(
    (v) => (selectedColour ? v.colour === selectedColour : true) && v.size === selectedSize
  ) ||
    product.product_variants?.find((v) => (selectedColour ? v.colour === selectedColour : true) && v.size) ||
    product.product_variants?.find((v) => v.size === selectedSize) ||
    product.product_variants?.[0];

  const displayPrice = selectedVariant?.price ?? product.sale_price ?? product.price;
  const hasDiscount = product.compare_at_price && product.compare_at_price > displayPrice;
  const discountPercent = hasDiscount
    ? getDiscountPercentage(product.compare_at_price!, displayPrice)
    : null;

  const hasAnyAvailableVariant = (product.product_variants ?? []).some((v) => isVariantAvailable(v));

  const isOutOfStock = selectedVariant
    ? !isVariantAvailable(selectedVariant)
    : !hasAnyAvailableVariant && product.stock_quantity === 0;

  const inWishlist = isInWishlist(product.id);

  const handleAddToCart = () => {
    if (sizesForColour.length > 0 && !selectedSize) {
      toast.error("Please select a size");
      return;
    }
    if (isOutOfStock) {
      toast.error("This item is out of stock");
      return;
    }

    setIsAdding(true);
    addItem({
      productId: product.id,
      variantId: selectedVariant?.id ?? null,
      name: product.name,
      slug: product.slug,
      price: displayPrice,
      quantity,
      image: selectedVariant?.image_url || selectedColourImage || product.primary_image_url,
      colour: selectedColour,
      size: selectedSize,
      maxStock: selectedVariant?.stock_quantity ?? product.stock_quantity,
    });

    openCart();

    setTimeout(() => {
      setIsAdding(false);
    }, 600);
  };

  const handleProceedToCheckout = async () => {
    if (sizesForColour.length > 0 && !selectedSize) {
      toast.error("Please select a size");
      return;
    }
    if (isOutOfStock) {
      toast.error("This item is out of stock");
      return;
    }

    try {
      const supabase = createClient();
      await supabase.from("whatsapp_enquiries").insert({
        product_id: product.id,
        variant_id: selectedVariant?.id || null,
        product_name: product.name,
        variant_info: { colour: selectedColour, size: selectedSize },
      });
    } catch { /* ignore */ }

    closeCart();

    addItem({
      productId: product.id,
      variantId: selectedVariant?.id ?? null,
      name: product.name,
      slug: product.slug,
      price: displayPrice,
      quantity,
      image: selectedVariant?.image_url || selectedColourImage || product.primary_image_url,
      colour: selectedColour,
      size: selectedSize,
      maxStock: selectedVariant?.stock_quantity ?? product.stock_quantity,
    });

    router.push("/checkout");
  };

  const toggleSection = (section: string) => {
    setExpandedSection(expandedSection === section ? null : section);
  };

  const sections = [
    {
      key: "description",
      label: "DESCRIPTION & SILHOUETTE",
      content: product.description || product.short_description,
    },
    {
      key: "fabric",
      label: "FABRIC & CRAFTSMANSHIP",
      content: product.fabric
        ? `${product.fabric}${product.material ? `\n\nComposition: ${product.material}` : ""}`
        : product.material,
    },
    {
      key: "fit",
      label: "TAILORING & FIT",
      content: product.fit || "Tailored relaxed European fit. Designed to drape naturally across the shoulders with effortless ease.",
    },
    {
      key: "care",
      label: "CARE INSTRUCTIONS",
      content: product.care_instructions || "Cold gentle machine wash or dry clean. Hang dry in shade. Warm iron inside out while slightly damp.",
    },
    {
      key: "shipping",
      label: "COMPLIMENTARY SHIPPING & RETURNS",
      content: "Complimentary nationwide shipping on all orders.\n\nDelivered within 3–5 business days in our signature luxury atelier packaging.\n\n30-day effortless exchanges.",
    },
  ].filter((s) => s.content);

  return (
    <div className="container-luxury pt-3 md:pt-5 pb-24 md:pb-20">
      {/* Breadcrumb Navigation */}
      <nav className="flex items-center gap-2 mb-3 md:mb-4 text-xs text-charcoal/50" aria-label="Breadcrumb">
        <Link href="/" className="hover:text-[#172744] transition-colors uppercase tracking-wider text-[10px]">HOME</Link>
        <ChevronRight size={11} className="text-charcoal/30" />
        <Link href="/shop" className="hover:text-[#172744] transition-colors uppercase tracking-wider text-[10px]">SHOP</Link>
        <ChevronRight size={11} className="text-charcoal/30" />
        <span className="text-[#172744] uppercase tracking-wider text-[10px] font-medium truncate max-w-[200px] sm:max-w-none">
          {product.name}
        </span>
      </nav>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-14 items-start">
        {/* ——— LEFT: Gallery Column (7 Cols on desktop) ——— */}
        <div className="lg:col-span-7 flex flex-col-reverse md:flex-row gap-4 items-start">
          {/* Thumbnails (Horizontal on mobile, vertical on tablet/desktop) */}
          {images.length > 1 && (
            <div className="flex md:flex-col gap-2.5 overflow-x-auto md:overflow-visible w-full md:w-20 flex-shrink-0 pb-2 md:pb-0 custom-scrollbar">
              {images.map((img, i) => (
                <button
                  key={img.id || i}
                  type="button"
                  onClick={() => setActiveImage(i)}
                  className={`relative aspect-[3/4] w-16 md:w-20 flex-shrink-0 bg-[#F8F6F0] rounded-xs overflow-hidden transition-all duration-200 border ${
                    activeImage === i
                      ? "border-[#172744] ring-1 ring-[#172744]"
                      : "border-[#D8C8AF]/60 opacity-60 hover:opacity-100"
                  }`}
                  aria-label={`View photo ${i + 1}`}
                >
                  <Image
                    src={img.url}
                    alt={img.alt_text || product.name}
                    fill
                    sizes="80px"
                    className="object-cover"
                  />
                </button>
              ))}
            </div>
          )}

          {/* Main Hero Photo */}
          <div className="flex-1 w-full relative aspect-[3/4] bg-[#F8F6F0] rounded-xs overflow-hidden border border-[#D8C8AF]/40">
            {images[activeImage] ? (
              <Image
                src={images[activeImage].url}
                alt={images[activeImage].alt_text || product.name}
                fill
                sizes="(max-width: 1024px) 100vw, 55vw"
                className="object-cover transition-transform duration-500 hover:scale-[1.02]"
                priority
              />
            ) : (
              <div className="absolute inset-0 flex items-center justify-center bg-[#D8C8AF]/20">
                <span className="text-xs uppercase tracking-widest text-[#172744]/40 font-medium">
                  AURELIN & CO.
                </span>
              </div>
            )}

            {/* Badges */}
            <div className="absolute top-3.5 left-3.5 flex flex-col gap-1.5 z-10">
              {product.is_new_arrival && (
                <span className="px-2.5 py-1 bg-[#B9A77A] text-[#F8F6F0] text-[9px] font-bold uppercase tracking-widest rounded-xs shadow-xs">
                  NEW ARRIVAL
                </span>
              )}
              {discountPercent && (
                <span className="px-2.5 py-1 bg-[#991B1B] text-[#F8F6F0] text-[9px] font-bold uppercase tracking-widest rounded-xs shadow-xs">
                  -{discountPercent}%
                </span>
              )}
            </div>
          </div>
        </div>

        {/* ——— RIGHT: Product Info (5 Cols on desktop, Sticky) ——— */}
        <div className="lg:col-span-5 space-y-6 lg:sticky lg:top-24">
          {/* Header & Title */}
          <div className="space-y-2 border-b border-[#D8C8AF40] pb-5">
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#B9A77A]">
              MAISON ATELIER COLLECTION
            </p>
            <h1
              className="text-2xl sm:text-3xl text-[#172744] font-normal leading-tight tracking-tight"
              style={{ fontFamily: "var(--font-cormorant)" }}
            >
              {product.name}
            </h1>

            {/* Price Row */}
            <div className="flex items-baseline gap-3 pt-1">
              <span
                className="text-2xl font-semibold text-[#172744] tracking-tight"
                style={{ fontFamily: "var(--font-inter)" }}
              >
                {formatPrice(displayPrice)}
              </span>
              {hasDiscount && (
                <span
                  className="text-base line-through text-charcoal/40 font-normal"
                  style={{ fontFamily: "var(--font-inter)" }}
                >
                  {formatPrice(product.compare_at_price!)}
                </span>
              )}
            </div>

            {/* Short Tagline */}
            {product.short_description && (
              <p className="text-xs text-charcoal/70 pt-1 leading-relaxed" style={{ fontFamily: "var(--font-inter)" }}>
                {product.short_description}
              </p>
            )}
          </div>

          {/* Colour Swatch Selector */}
          {colours.length > 0 && (
            <div className="space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold uppercase tracking-widest text-[#172744]">
                  COLOUR: <span className="font-normal text-charcoal/60">{selectedColour}</span>
                </span>
              </div>
              <div className="flex flex-wrap gap-2.5">
                {colours.map((v) => (
                  <button
                    key={v.colour}
                    type="button"
                    onClick={() => {
                      setSelectedColour(v.colour);
                    }}
                    title={v.colour || ""}
                    className={`w-8 h-8 rounded-full border-2 transition-all ${
                      selectedColour === v.colour
                        ? "border-[#172744] ring-2 ring-[#172744]/15"
                        : "border-[#D8C8AF] hover:border-[#172744]"
                    }`}
                    style={v.colour_hex ? { backgroundColor: v.colour_hex } : undefined}
                    aria-label={v.colour || "Colour option"}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Size Selector with Live Availability Status */}
          {sizesForColour.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold uppercase tracking-widest text-[#172744] flex items-center">
                  SIZE: <span className="font-semibold text-charcoal ml-1.5">{selectedSize || "Select a size"}</span>
                  {selectedSize && (
                    <span
                      className={`ml-3 px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider ${
                        selectedVariant && isVariantAvailable(selectedVariant)
                          ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
                          : "bg-rose-50 text-rose-700 border border-rose-200"
                      }`}
                    >
                      {selectedVariant && isVariantAvailable(selectedVariant) ? "● In Stock" : "● Stock Out"}
                    </span>
                  )}
                </span>
                <Link
                  href="/size-guide"
                  className="text-[10px] uppercase tracking-wider text-[#172744]/60 hover:text-[#172744] underline transition-colors"
                >
                  Size Guide
                </Link>
              </div>

              <div className="flex flex-wrap gap-2.5">
                {sizesForColour.map((v) => {
                  const unavailable = !isVariantAvailable(v);
                  const isSelected = selectedSize === v.size;

                  return (
                    <button
                      key={v.id || `${v.size}-${v.colour}`}
                      type="button"
                      onClick={() => !unavailable && setSelectedSize(v.size)}
                      disabled={unavailable}
                      title={unavailable ? `${v.size} — Stock Out` : `${v.size} — In Stock`}
                      className={`min-w-[3.25rem] h-12 px-3 flex flex-col items-center justify-center border rounded-xs transition-all ${
                        isSelected
                          ? "border-[#172744] bg-[#172744] text-[#F8F6F0] shadow-sm ring-1 ring-[#172744]"
                          : unavailable
                          ? "border-[#D8C8AF]/40 text-charcoal/30 cursor-not-allowed bg-gray-50/70"
                          : "border-[#D8C8AF] text-[#242424] hover:border-[#172744] bg-white"
                      }`}
                    >
                      <span className={`text-xs font-semibold uppercase tracking-wider ${unavailable ? "line-through opacity-50" : ""}`}>
                        {v.size}
                      </span>
                      <span
                        className={`text-[8px] font-bold tracking-tight uppercase mt-0.5 ${
                          isSelected
                            ? "text-[#F8F6F0]/80"
                            : unavailable
                            ? "text-rose-500 font-semibold"
                            : "text-emerald-700"
                        }`}
                      >
                        {unavailable ? "Stock Out" : "In Stock"}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Quantity & Inventory Stock Note */}
          <div className="flex items-center justify-between pt-1">
            <div className="flex items-center border border-[#D8C8AF] bg-white rounded-xs">
              <button
                type="button"
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                className="w-9 h-9 flex items-center justify-center text-charcoal hover:text-[#172744] transition-colors"
                aria-label="Decrease quantity"
              >
                <Minus size={13} />
              </button>
              <span className="w-9 text-center text-xs font-semibold text-[#172744]">
                {quantity}
              </span>
              <button
                type="button"
                onClick={() => setQuantity(Math.min(10, quantity + 1))}
                className="w-9 h-9 flex items-center justify-center text-charcoal hover:text-[#172744] transition-colors"
                aria-label="Increase quantity"
              >
                <Plus size={13} />
              </button>
            </div>

            {product.stock_quantity <= product.low_stock_threshold && product.stock_quantity > 0 && (
              <span className="text-[10px] font-bold uppercase tracking-widest text-amber-700 bg-amber-50 px-2 py-1 rounded border border-amber-200">
                Only {product.stock_quantity} pieces left
              </span>
            )}
          </div>

          {/* Primary Action Buttons */}
          <div className="space-y-3 pt-2">
            <button
              type="button"
              onClick={handleAddToCart}
              disabled={isOutOfStock || isAdding}
              className="w-full py-4 bg-[#172744] hover:bg-[#101C32] text-[#F8F6F0] flex items-center justify-center gap-2.5 text-xs font-semibold uppercase tracking-[0.18em] rounded-xs shadow-md transition-all disabled:opacity-40"
            >
              {isAdding ? (
                <>
                  <Check size={15} className="text-emerald-400" /> Added to Bag
                </>
              ) : (
                <>
                  <ShoppingBag size={15} /> {isOutOfStock ? "Out of Stock" : "Add to Bag"}
                </>
              )}
            </button>

            <button
              type="button"
              onClick={handleProceedToCheckout}
              disabled={isOutOfStock}
              className="w-full py-3.5 border border-[#172744] text-[#172744] hover:bg-[#172744] hover:text-[#F8F6F0] flex items-center justify-center gap-2 text-xs font-semibold uppercase tracking-[0.16em] rounded-xs transition-all disabled:opacity-40"
            >
              Proceed to Checkout <ArrowRight size={14} />
            </button>

            <button
              type="button"
              onClick={() => toggleWishlist(product.id)}
              className="w-full py-2 flex items-center justify-center gap-2 text-xs text-charcoal/60 hover:text-[#172744] uppercase tracking-wider font-medium transition-colors"
            >
              <Heart size={14} fill={inWishlist ? "currentColor" : "none"} className={inWishlist ? "text-red-500" : ""} />
              {inWishlist ? "Saved to Wishlist" : "Save to Wishlist"}
            </button>
          </div>

          {/* Luxury Atelier Trust Badges */}
          <div className="grid grid-cols-3 gap-2 py-4 border-y border-[#D8C8AF40] text-center">
            <div className="flex flex-col items-center gap-1">
              <Truck size={15} className="text-[#B9A77A]" />
              <span className="text-[10px] uppercase tracking-wider text-[#172744] font-medium">
                Free Shipping
              </span>
            </div>
            <div className="flex flex-col items-center gap-1 border-x border-[#D8C8AF30]">
              <RotateCcw size={15} className="text-[#B9A77A]" />
              <span className="text-[10px] uppercase tracking-wider text-[#172744] font-medium">
                30-Day Returns
              </span>
            </div>
            <div className="flex flex-col items-center gap-1">
              <ShieldCheck size={15} className="text-[#B9A77A]" />
              <span className="text-[10px] uppercase tracking-wider text-[#172744] font-medium">
                Natural Flax
              </span>
            </div>
          </div>

          {/* Expandable Accordions */}
          <div className="space-y-0 divide-y divide-[#D8C8AF30]">
            {sections.map((section) => (
              <div key={section.key} className="py-1">
                <button
                  type="button"
                  onClick={() => toggleSection(section.key)}
                  className="flex items-center justify-between w-full py-3.5 text-left text-[11px] font-bold uppercase tracking-[0.16em] text-[#172744] hover:text-[#B9A77A] transition-colors"
                >
                  <span>{section.label}</span>
                  <span className="text-base font-normal text-charcoal/50">
                    {expandedSection === section.key ? "−" : "+"}
                  </span>
                </button>
                {expandedSection === section.key && (
                  <div className="pb-4 text-xs leading-relaxed text-charcoal/80 whitespace-pre-line font-light">
                    {section.content}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Mobile Sticky Bottom Action Bar (Fixed for phones) */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#F8F6F0]/95 backdrop-blur-md border-t border-[#D8C8AF] px-4 py-3 flex items-center justify-between gap-3 shadow-2xl">
        <div className="min-w-0 flex-1">
          <p className="text-xs font-semibold text-[#172744] truncate">{product.name}</p>
          <p className="text-xs text-[#172744] font-medium">{formatPrice(displayPrice)}</p>
        </div>
        <button
          type="button"
          onClick={handleAddToCart}
          disabled={isOutOfStock}
          className="px-6 py-2.5 bg-[#172744] text-[#F8F6F0] text-xs font-semibold uppercase tracking-wider rounded-xs shadow-sm disabled:opacity-40 flex-shrink-0"
        >
          {isOutOfStock ? "Out of Stock" : "Add to Bag"}
        </button>
      </div>
    </div>
  );
}
