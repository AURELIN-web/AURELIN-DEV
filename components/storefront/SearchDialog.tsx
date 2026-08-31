"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { X, Search } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { createClient } from "@/utils/supabase/client";
import { formatPrice } from "@/lib/utils/format";
import type { Product } from "@/types/database";

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export default function SearchDialog({ isOpen, onClose }: Props) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 100);
      document.body.style.overflow = "hidden";
    } else {
      setQuery("");
      setResults([]);
      document.body.style.overflow = "";
    }
    return () => { document.body.style.overflow = ""; };
  }, [isOpen]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  const search = useCallback(async (q: string) => {
    if (q.trim().length < 2) {
      setResults([]);
      return;
    }
    setLoading(true);
    const supabase = createClient();
    const { data } = await supabase
      .from("products")
      .select("id, name, slug, price, sale_price, primary_image_url, status")
      .eq("status", "published")
      .or(`name.ilike.%${q}%,description.ilike.%${q}%,fabric.ilike.%${q}%`)
      .limit(8);

    setResults((data as Product[]) || []);
    setLoading(false);
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setQuery(val);
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => search(val), 300);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[70]" role="dialog" aria-modal="true" aria-label="Search">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-charcoal/20 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Search Panel */}
      <div
        className="relative z-10 mx-auto mt-16 md:mt-24 max-w-2xl px-4"
      >
        <div
          className="w-full shadow-2xl overflow-hidden"
          style={{ backgroundColor: "#F8F6F0" }}
        >
          {/* Search Input */}
          <div
            className="flex items-center gap-4 px-6 py-5 border-b"
            style={{ borderColor: "#D8C8AF40" }}
          >
            <Search size={18} className="text-charcoal opacity-50 flex-shrink-0" />
            <input
              ref={inputRef}
              type="search"
              value={query}
              onChange={handleChange}
              placeholder="Search products, collections..."
              className="flex-1 bg-transparent text-charcoal placeholder-charcoal/40 outline-none"
              style={{
                fontFamily: "var(--font-inter)",
                fontSize: "1rem",
                fontWeight: 300,
              }}
              autoComplete="off"
            />
            <button
              onClick={onClose}
              aria-label="Close search"
              className="text-charcoal opacity-40 hover:opacity-80 transition-opacity"
            >
              <X size={18} />
            </button>
          </div>

          {/* Results */}
          {query.length >= 2 && (
            <div className="max-h-[60vh] overflow-y-auto">
              {loading ? (
                <div className="flex items-center justify-center py-12">
                  <div
                    className="w-5 h-5 border-2 border-beige border-t-navy rounded-full animate-spin"
                  />
                </div>
              ) : results.length > 0 ? (
                <ul>
                  {results.map((product) => (
                    <li key={product.id}>
                      <Link
                        href={`/product/${product.slug}`}
                        onClick={onClose}
                        className="flex items-center gap-4 px-6 py-4 hover:bg-beige/10 transition-colors border-b"
                        style={{ borderColor: "#D8C8AF20" }}
                      >
                        {/* Thumbnail */}
                        <div
                          className="relative w-14 h-16 flex-shrink-0 overflow-hidden"
                          style={{ backgroundColor: "#D8C8AF30" }}
                        >
                          {product.primary_image_url && (
                            <Image
                              src={product.primary_image_url}
                              alt={product.name}
                              fill
                              sizes="56px"
                              className="object-cover"
                            />
                          )}
                        </div>

                        {/* Info */}
                        <div className="flex-1 min-w-0">
                          <p
                            className="text-charcoal truncate"
                            style={{ fontFamily: "var(--font-inter)", fontSize: "0.875rem" }}
                          >
                            {product.name}
                          </p>
                          <p
                            className="text-charcoal opacity-50 mt-0.5"
                            style={{ fontFamily: "var(--font-inter)", fontSize: "0.8125rem" }}
                          >
                            {formatPrice(product.sale_price ?? product.price)}
                          </p>
                        </div>
                      </Link>
                    </li>
                  ))}
                </ul>
              ) : (
                <div className="flex flex-col items-center py-12 gap-3">
                  <p
                    className="text-charcoal opacity-40"
                    style={{ fontFamily: "var(--font-inter)", fontSize: "0.875rem" }}
                  >
                    No results for &ldquo;{query}&rdquo;
                  </p>
                  <Link
                    href="/shop"
                    onClick={onClose}
                    className="label-uppercase text-navy"
                    style={{ fontSize: "0.6875rem", letterSpacing: "0.16em" }}
                  >
                    EXPLORE ALL PRODUCTS →
                  </Link>
                </div>
              )}
            </div>
          )}

          {/* Suggestions when empty */}
          {query.length < 2 && (
            <div className="px-6 py-5">
              <p
                className="label-uppercase text-charcoal opacity-40 mb-4"
                style={{ fontSize: "0.625rem", letterSpacing: "0.16em" }}
              >
                POPULAR SEARCHES
              </p>
              <div className="flex flex-wrap gap-2">
                {["Linen Shirt", "Signature Shirt", "Summer Edit", "New Arrivals"].map((s) => (
                  <button
                    key={s}
                    onClick={() => {
                      setQuery(s);
                      search(s);
                    }}
                    className="px-3 py-1.5 border border-beige/60 text-charcoal hover:border-navy hover:text-navy transition-colors"
                    style={{ fontFamily: "var(--font-inter)", fontSize: "0.75rem" }}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
