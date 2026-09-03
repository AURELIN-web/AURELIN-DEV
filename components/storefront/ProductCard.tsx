"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { formatPrice, getDiscountPercentage } from "@/lib/utils/format";
import type { Product } from "@/types/database";
import { ShoppingBag, Check } from "lucide-react";
import { useCart } from "@/contexts/CartContext";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import WishlistButtonClient from "./WishlistButtonClient";

interface Props {
  product: Product;
  priority?: boolean;
}

export default function ProductCard({ product, priority = false }: Props) {
  const [isAdding, setIsAdding] = useState(false);
  const { addItem, openCart } = useCart();
  const router = useRouter();

  const displayPrice = product.sale_price ?? product.price;
  const hasDiscount = product.sale_price && product.sale_price < product.price;
  const discount = hasDiscount
    ? getDiscountPercentage(product.price, product.sale_price!)
    : null;
  const isLowStock =
    product.low_stock_threshold > 0 &&
    product.stock_quantity <= product.low_stock_threshold &&
    product.stock_quantity > 0;
  const isOutOfStock = product.stock_quantity === 0;

  const storefrontVariant =
    product.product_variants?.find((v) => v.show_on_storefront && v.image_url) ||
    product.product_variants?.find((v) => v.image_url) ||
    null;
  const storefrontImage = storefrontVariant?.image_url || product.primary_image_url;

  const hoverImage = product.hover_image_url ||
    (product.product_images && product.product_images.length > 1 ? product.product_images[1].url : null);
  const hasHoverImage = !!hoverImage && hoverImage !== product.primary_image_url;

  const handleQuickAdd = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (isOutOfStock) {
      toast.error("This garment is sold out");
      return;
    }

    const availableVariants = product.product_variants?.filter((v) => v.is_available && v.stock_quantity > 0) || [];
    if (availableVariants.length > 1) {
      router.push(`/product/${product.slug}`);
      return;
    }

    setIsAdding(true);
    const selectedVariant = availableVariants[0];

    addItem({
      productId: product.id,
      variantId: selectedVariant?.id ?? null,
      name: product.name,
      slug: product.slug,
      price: selectedVariant?.price ?? displayPrice,
      quantity: 1,
      image: product.primary_image_url,
      colour: selectedVariant?.colour ?? null,
      size: selectedVariant?.size ?? null,
      maxStock: selectedVariant?.stock_quantity ?? product.stock_quantity,
    });

    openCart();

    setTimeout(() => {
      setIsAdding(false);
    }, 800);
  };

  return (
    <article className="group relative flex flex-col">
      {/* Image Container */}
      <div className="relative block overflow-hidden aspect-[3/4] bg-[#D8C8AF]/20">
        <Link href={`/product/${product.slug}`} className="absolute inset-0 block">
          {/* Primary Image */}
          {storefrontImage ? (
            <Image
              src={storefrontImage}
              alt={product.name}
              fill
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
              className={`object-cover transition-all duration-700 ${
                hasHoverImage ? "group-hover:opacity-0" : "group-hover:scale-[1.03]"
              }`}
              priority={priority}
            />
          ) : (
            <div
              className="absolute inset-0 flex items-center justify-center"
              style={{ backgroundColor: "#D8C8AF" }}
            >
              <span
                className="label-uppercase opacity-40"
                style={{ fontSize: "0.625rem", color: "#172744" }}
              >
                AURELIN & CO.
              </span>
            </div>
          )}

          {/* Hover Image */}
          {hasHoverImage && (
            <Image
              src={hoverImage!}
              alt={`${product.name} — alternate view`}
              fill
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
              className="object-cover absolute inset-0 opacity-0 transition-opacity duration-700 group-hover:opacity-100 group-hover:scale-[1.03]"
            />
          )}
        </Link>

        {/* Top-Left Badges Stack (Never overlaps) */}
        <div className="absolute top-3 left-3 z-10 flex flex-wrap items-center gap-1.5 pointer-events-none">
          {product.is_new_arrival && (
            <span
              className="label-uppercase px-2 py-1 shadow-xs"
              style={{
                fontSize: "0.5625rem",
                backgroundColor: "#B9A77A",
                color: "#F8F6F0",
                letterSpacing: "0.12em",
              }}
            >
              NEW
            </span>
          )}

          {product.is_best_seller && (
            <span
              className="label-uppercase px-2 py-1 shadow-xs"
              style={{
                fontSize: "0.5625rem",
                backgroundColor: "#172744",
                color: "#F8F6F0",
                letterSpacing: "0.12em",
              }}
            >
              BEST SELLER
            </span>
          )}

          {discount && (
            <span
              className="label-uppercase px-2 py-1 shadow-xs"
              style={{
                fontSize: "0.5625rem",
                backgroundColor: "#172744",
                color: "#F8F6F0",
                letterSpacing: "0.12em",
              }}
            >
              -{discount}%
            </span>
          )}

          {isOutOfStock ? (
            <span
              className="label-uppercase px-2 py-1 shadow-xs"
              style={{
                fontSize: "0.5625rem",
                backgroundColor: "#242424",
                color: "#F8F6F0",
                letterSpacing: "0.12em",
              }}
            >
              SOLD OUT
            </span>
          ) : isLowStock ? (
            <span
              className="label-uppercase px-2 py-1 shadow-xs"
              style={{
                fontSize: "0.5625rem",
                backgroundColor: "#D8C8AF",
                color: "#172744",
                letterSpacing: "0.12em",
              }}
            >
              LOW STOCK
            </span>
          ) : null}
        </div>

        {/* Wishlist Button on Hover */}
        <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10">
          <WishlistButtonClient productId={product.id} />
        </div>

        {/* Slide-Up ADD TO CART Button on Hover */}
        <div className="absolute bottom-0 left-0 right-0 z-20 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out">
          <button
            type="button"
            onClick={handleQuickAdd}
            disabled={isOutOfStock}
            className="w-full py-3 bg-[#101C32]/95 hover:bg-[#172744] text-[#F8F6F0] flex items-center justify-center gap-2 text-[11px] font-semibold uppercase tracking-widest transition-colors shadow-md disabled:opacity-50"
          >
            {isAdding ? (
              <>
                <Check size={13} className="text-emerald-400" /> ADDED
              </>
            ) : (
              <>
                <ShoppingBag size={13} /> {isOutOfStock ? "SOLD OUT" : "ADD TO CART"}
              </>
            )}
          </button>
        </div>
      </div>

      {/* Product Info (Centered Standard Luxury Look) */}
      <div className="pt-3.5 pb-2 flex flex-col items-center text-center gap-1.5">
        {/* Colour swatches */}
        {product.product_variants && product.product_variants.length > 0 && (
          <div className="flex items-center justify-center gap-1.5 py-0.5">
            {Array.from(
              new Map(
                product.product_variants
                  .filter((v) => v.colour_hex)
                  .map((v) => [v.colour, v])
              ).values()
            )
              .slice(0, 5)
              .map((v) => (
                <div
                  key={v.id}
                  title={v.colour || ""}
                  className="w-2.5 h-2.5 rounded-full border border-beige/40 shadow-2xs"
                  style={{ backgroundColor: v.colour_hex || "#ccc" }}
                />
              ))}
          </div>
        )}

        <Link href={`/product/${product.slug}`} className="block max-w-full px-2">
          <h3
            className="text-[#242424] hover:text-[#172744] transition-colors leading-snug truncate"
            style={{
              fontFamily: "var(--font-inter)",
              fontSize: "0.8125rem",
              fontWeight: 400,
              letterSpacing: "0.02em",
            }}
            title={product.name}
          >
            {product.name}
          </h3>
        </Link>

        {/* Enhanced Centered Price */}
        <div className="flex items-center justify-center gap-2 pt-0.5">
          <span
            className="text-sm font-semibold text-[#172744] tracking-tight"
            style={{ fontFamily: "var(--font-inter)" }}
          >
            {formatPrice(displayPrice)}
          </span>
          {hasDiscount && (
            <span
              className="text-xs line-through text-[#172744]/40 font-normal"
              style={{ fontFamily: "var(--font-inter)" }}
            >
              {formatPrice(product.price)}
            </span>
          )}
        </div>
      </div>
    </article>
  );
}
