"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  type ReactNode,
} from "react";
import { toast } from "sonner";

interface WishlistItem {
  productId: string;
  variantId: string | null;
}

interface WishlistContextValue {
  items: WishlistItem[];
  isInWishlist: (productId: string) => boolean;
  toggleWishlist: (productId: string, variantId?: string | null) => void;
  itemCount: number;
}

const WishlistContext = createContext<WishlistContextValue | null>(null);
const WISHLIST_KEY = "aurelin_wishlist";

export function WishlistProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<WishlistItem[]>([]);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(WISHLIST_KEY);
      if (saved) setItems(JSON.parse(saved));
    } catch {
      // Ignore
    }
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem(WISHLIST_KEY, JSON.stringify(items));
    } catch {
      // Ignore
    }
  }, [items]);

  const isInWishlist = useCallback(
    (productId: string) => items.some((i) => i.productId === productId),
    [items]
  );

  const toggleWishlist = useCallback(
    (productId: string, variantId: string | null = null) => {
      setItems((prev) => {
        const exists = prev.some((i) => i.productId === productId);
        if (exists) {
          toast.success("Removed from wishlist");
          return prev.filter((i) => i.productId !== productId);
        } else {
          toast.success("Added to wishlist");
          return [...prev, { productId, variantId }];
        }
      });
    },
    []
  );

  return (
    <WishlistContext.Provider
      value={{
        items,
        isInWishlist,
        toggleWishlist,
        itemCount: items.length,
      }}
    >
      {children}
    </WishlistContext.Provider>
  );
}

export function useWishlist(): WishlistContextValue {
  const ctx = useContext(WishlistContext);
  if (!ctx) throw new Error("useWishlist must be used within WishlistProvider");
  return ctx;
}
