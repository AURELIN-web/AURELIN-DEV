"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import type { Category } from "@/types/database";
import { SlidersHorizontal, X, Check } from "lucide-react";

interface Props {
  categories: Category[];
  totalProducts?: number;
}

export default function ShopFilters({ categories, totalProducts = 0 }: Props) {
  const pathname = usePathname();
  const [isMobileDrawerOpen, setIsMobileDrawerOpen] = useState(false);

  // Close on Escape or Route Change
  useEffect(() => {
    setIsMobileDrawerOpen(false);
  }, [pathname]);

  // Lock scroll when mobile drawer is open
  useEffect(() => {
    if (isMobileDrawerOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isMobileDrawerOpen]);

  const activeCategoryName = categories.find((c) => pathname === `/shop/${c.slug}`)?.name || "All Garments";

  const filterContent = (
    <div className="space-y-7">
      {/* Categories */}
      <div>
        <h3
          className="text-[11px] font-bold tracking-[0.2em] uppercase text-[#172744] pb-2 border-b border-[#D8C8AF40] flex items-center justify-between"
          style={{ fontFamily: "var(--font-inter)" }}
        >
          <span>CATEGORY</span>
        </h3>
        <ul className="space-y-2 pt-3">
          <li>
            <Link
              href="/shop"
              className={`flex items-center justify-between text-xs py-1 transition-colors ${
                pathname === "/shop"
                  ? "font-bold text-[#172744]"
                  : "text-charcoal/70 hover:text-[#172744]"
              }`}
              style={{ fontFamily: "var(--font-inter)" }}
            >
              <span>All Products</span>
              {pathname === "/shop" && <Check size={12} className="text-[#172744]" />}
            </Link>
          </li>
          {categories.map((cat) => {
            const isActive = pathname === `/shop/${cat.slug}`;
            return (
              <li key={cat.id}>
                <Link
                  href={`/shop/${cat.slug}`}
                  className={`flex items-center justify-between text-xs py-1 transition-colors ${
                    isActive
                      ? "font-bold text-[#172744]"
                      : "text-charcoal/60 hover:text-[#172744]"
                  }`}
                  style={{ fontFamily: "var(--font-inter)" }}
                >
                  <span>{cat.name}</span>
                  {isActive && <Check size={12} className="text-[#172744]" />}
                </Link>
              </li>
            );
          })}
        </ul>
      </div>

      {/* Size Filter */}
      <div>
        <h3
          className="text-[11px] font-bold tracking-[0.2em] uppercase text-[#172744] pb-2 border-b border-[#D8C8AF40] flex items-center justify-between"
          style={{ fontFamily: "var(--font-inter)" }}
        >
          <span>SIZE</span>
        </h3>
        <div className="grid grid-cols-3 gap-1.5 pt-3">
          {["XS", "S", "M", "L", "XL", "XXL"].map((size) => (
            <button
              key={size}
              type="button"
              className="py-2 border border-[#D8C8AF]/60 text-charcoal/80 text-[11px] font-medium hover:border-[#172744] hover:text-[#172744] hover:bg-white transition-all rounded-xs"
              style={{ fontFamily: "var(--font-inter)" }}
            >
              {size}
            </button>
          ))}
        </div>
      </div>

      {/* Sort By */}
      <div>
        <h3
          className="text-[11px] font-bold tracking-[0.2em] uppercase text-[#172744] pb-2 border-b border-[#D8C8AF40] flex items-center justify-between"
          style={{ fontFamily: "var(--font-inter)" }}
        >
          <span>SORT BY</span>
        </h3>
        <ul className="space-y-2 pt-3">
          {[
            { label: "Featured", value: "featured" },
            { label: "Newest Arrivals", value: "newest" },
            { label: "Price: Low to High", value: "price_asc" },
            { label: "Price: High to Low", value: "price_desc" },
            { label: "Best Selling", value: "best_selling" },
          ].map((opt) => (
            <li key={opt.value}>
              <button
                type="button"
                className="w-full text-left text-xs py-1 text-charcoal/60 hover:text-[#172744] transition-colors"
                style={{ fontFamily: "var(--font-inter)" }}
              >
                {opt.label}
              </button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );

  return (
    <>
      {/* ——— MOBILE ONLY: Filter Bar & Floating Trigger ——— */}
      <div className="md:hidden flex items-center justify-between py-3 px-1 border-b border-[#D8C8AF40] mb-6">
        <div className="text-xs text-charcoal/70 font-medium">
          <span>{activeCategoryName}</span>
          {totalProducts > 0 && (
            <span className="text-charcoal/40 ml-1.5">({totalProducts})</span>
          )}
        </div>

        <button
          type="button"
          onClick={() => setIsMobileDrawerOpen(true)}
          className="inline-flex items-center gap-2 px-3.5 py-1.5 border border-[#172744] bg-white text-[#172744] text-xs font-semibold uppercase tracking-wider rounded-xs shadow-2xs"
        >
          <SlidersHorizontal size={13} />
          <span>Filter & Sort</span>
        </button>
      </div>

      {/* ——— MOBILE BOTTOM SHEET POPUP MODAL ——— */}
      {isMobileDrawerOpen && (
        <div className="md:hidden fixed inset-0 z-50 flex flex-col justify-end">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-[#101C32]/60 backdrop-blur-xs transition-opacity"
            onClick={() => setIsMobileDrawerOpen(false)}
          />

          {/* Slide-Up Bottom Sheet Card */}
          <div className="relative z-10 w-full max-h-[85vh] bg-[#F8F6F0] rounded-t-xl shadow-2xl flex flex-col overflow-hidden border-t border-[#D8C8AF]">
            {/* Sheet Handle */}
            <div className="w-12 h-1 bg-[#D8C8AF] rounded-full mx-auto mt-3 mb-1" />

            {/* Header */}
            <div className="flex items-center justify-between px-6 py-3.5 border-b border-[#D8C8AF40]">
              <div className="flex items-center gap-2">
                <SlidersHorizontal size={15} className="text-[#172744]" />
                <h2
                  className="text-xs font-bold uppercase tracking-[0.2em] text-[#172744]"
                  style={{ fontFamily: "var(--font-inter)" }}
                >
                  FILTER & REFINE
                </h2>
              </div>
              <button
                type="button"
                onClick={() => setIsMobileDrawerOpen(false)}
                className="p-1.5 text-charcoal/60 hover:text-[#172744]"
                aria-label="Close filters"
              >
                <X size={18} />
              </button>
            </div>

            {/* Scrollable Filters Content */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {filterContent}
            </div>

            {/* Sticky Bottom Actions */}
            <div className="p-4 bg-white border-t border-[#D8C8AF40] flex items-center gap-3">
              <Link
                href="/shop"
                onClick={() => setIsMobileDrawerOpen(false)}
                className="flex-1 py-3 text-center border border-[#D8C8AF] text-[#172744] text-xs font-semibold uppercase tracking-wider rounded-xs"
              >
                Clear All
              </Link>
              <button
                type="button"
                onClick={() => setIsMobileDrawerOpen(false)}
                className="flex-1 py-3 bg-[#172744] text-[#F8F6F0] text-xs font-semibold uppercase tracking-wider rounded-xs shadow-sm"
              >
                Apply Filters
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ——— DESKTOP ONLY: Sticky Left Sidebar ——— */}
      <div className="hidden md:block sticky top-[72px]">
        {filterContent}
      </div>
    </>
  );
}
