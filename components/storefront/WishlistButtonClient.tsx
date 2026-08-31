"use client";

import { Heart } from "lucide-react";
import { useWishlist } from "@/contexts/WishlistContext";
import { cn } from "@/lib/utils/cn";

interface Props {
  productId: string;
  variantId?: string | null;
  className?: string;
}

export default function WishlistButtonClient({ productId, variantId, className }: Props) {
  const { isInWishlist, toggleWishlist } = useWishlist();
  const inWishlist = isInWishlist(productId);

  return (
    <button
      onClick={(e) => {
        e.preventDefault();
        toggleWishlist(productId, variantId);
      }}
      aria-label={inWishlist ? "Remove from wishlist" : "Add to wishlist"}
      className={cn(
        "flex items-center justify-center w-8 h-8 rounded-full transition-colors duration-200",
        inWishlist
          ? "bg-navy text-ivory"
          : "bg-ivory/90 text-charcoal hover:bg-navy hover:text-ivory",
        className
      )}
      style={{ backgroundColor: inWishlist ? "#172744" : undefined }}
    >
      <Heart size={13} fill={inWishlist ? "currentColor" : "none"} />
    </button>
  );
}
