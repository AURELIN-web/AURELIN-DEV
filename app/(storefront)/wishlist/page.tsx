"use client";

import { useEffect, useState } from "react";
import { useWishlist } from "@/contexts/WishlistContext";
import { createClient } from "@/utils/supabase/client";
import ProductGrid from "@/components/storefront/ProductGrid";
import Link from "next/link";
import { Heart } from "lucide-react";
import type { Product } from "@/types/database";

export default function WishlistPage() {
  const { items } = useWishlist();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadWishlistProducts() {
      if (items.length === 0) {
        setProducts([]);
        setLoading(false);
        return;
      }

      setLoading(true);
      const supabase = createClient();
      const productIds = items.map((i) => i.productId);

      const { data } = await supabase
        .from("products")
        .select("*, product_variants(*)")
        .in("id", productIds)
        .eq("status", "published");

      setProducts((data as Product[]) || []);
      setLoading(false);
    }

    loadWishlistProducts();
  }, [items]);

  return (
    <div className="container-luxury py-12 md:py-10">
      <div className="text-center mb-10 md:mb-14">
        <p
          className="mb-3"
          style={{
            fontFamily: "var(--font-inter)",
            fontSize: "0.625rem",
            letterSpacing: "0.22em",
            textTransform: "uppercase",
            color: "#B9A77A",
          }}
        >
          SAVED ITEMS
        </p>
        <h1
          style={{
            fontFamily: "var(--font-cormorant)",
            fontSize: "clamp(2rem, 4vw, 3rem)",
            fontWeight: 400,
            color: "#172744",
          }}
        >
          Your Wishlist
        </h1>
      </div>

      {loading ? (
        <div className="py-20 text-center opacity-50" style={{ fontFamily: "var(--font-inter)" }}>
          Loading saved pieces...
        </div>
      ) : products.length === 0 ? (
        <div className="py-20 text-center max-w-sm mx-auto">
          <Heart size={40} className="mx-auto mb-4 opacity-30 text-navy" />
          <p
            className="text-lg text-navy mb-2"
            style={{ fontFamily: "var(--font-cormorant)" }}
          >
            Your wishlist is empty
          </p>
          <p
            className="opacity-60 text-sm mb-6"
            style={{ fontFamily: "var(--font-inter)" }}
          >
            Save items you love by clicking the heart icon on any product.
          </p>
          <Link
            href="/shop"
            className="inline-block px-8 py-3.5 bg-navy text-ivory label-uppercase"
            style={{ fontSize: "0.6875rem", letterSpacing: "0.16em" }}
          >
            EXPLORE THE COLLECTION
          </Link>
        </div>
      ) : (
        <ProductGrid products={products} columns={4} />
      )}
    </div>
  );
}
