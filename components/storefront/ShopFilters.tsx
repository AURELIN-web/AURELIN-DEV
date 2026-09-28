"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import type { Category } from "@/types/database";
import { SlidersHorizontal, X, Check, RotateCcw } from "lucide-react";

interface Props {
  categories: Category[];
  totalProducts?: number;
  currentSort?: string;
  currentSize?: string;
}

const SIZES = ["XS", "S", "M", "L", "XL", "XXL", "Oversized"];

const SORT_OPTIONS = [
  { label: "Featured", value: "featured" },
  { label: "Newest Arrivals", value: "newest" },
  { label: "Price: Low to High", value: "price_asc" },
  { label: "Price: High to Low", value: "price_desc" },
  { label: "Best Selling", value: "best_selling" },
];

export default function ShopFilters({
  categories,
  totalProducts = 0,
  currentSort,
  currentSize,
}: Props) {
  const pathname = usePathname();
  const [isMobileDrawerOpen, setIsMobileDrawerOpen] = useState(false);

  // Close on Route Change
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

  const activeCategory = categories.find((c) => pathname === `/shop/${c.slug}`);
  const activeCategoryName = activeCategory?.name || (pathname === "/shop" ? "All Products" : "Garments");

  const buildFilterUrl = (opts: {
    categoryPath?: string;
    sort?: string | null;
    size?: string | null;
    resetAll?: boolean;
  }) => {
    if (opts.resetAll) {
      return opts.categoryPath || pathname;
    }
    const path = opts.categoryPath !== undefined ? opts.categoryPath : pathname;
    const sp = new URLSearchParams();

    const sortVal = opts.sort !== undefined ? opts.sort : currentSort;
    const sizeVal = opts.size !== undefined ? opts.size : currentSize;

    if (sortVal && sortVal !== "featured") {
      sp.set("sort", sortVal);
    }
    if (sizeVal) {
      sp.set("size", sizeVal);
    }

    const qs = sp.toString();
    return qs ? `${path}?${qs}` : path;
  };

  const hasActiveFilters = Boolean(
    currentSize || (currentSort && currentSort !== "featured")
  );

  const activeSortLabel =
    SORT_OPTIONS.find((s) => s.value === (currentSort || "featured"))?.label ||
    "Featured";

  const filterContent = (
    <div className="space-y-7">
      {/* Active Filter Badges (if any applied) */}
      {hasActiveFilters && (
        <div className="p-3 bg-[#172744]/5 border border-[#172744]/15 rounded-xs space-y-2">
          <div className="flex items-center justify-between">
            <span
              className="text-[10px] font-bold uppercase tracking-[0.16em] text-[#172744]"
              style={{ fontFamily: "var(--font-inter)" }}
            >
              Active Filters
            </span>
            <Link
              href={pathname}
              scroll={false}
              className="inline-flex items-center gap-1 text-[10px] text-charcoal/60 hover:text-[#172744] transition-colors"
              style={{ fontFamily: "var(--font-inter)" }}
            >
              <RotateCcw size={10} />
              <span>Reset</span>
            </Link>
          </div>
          <div className="flex flex-wrap gap-1.5 pt-1">
            {currentSize && (
              <Link
                href={buildFilterUrl({ size: null })}
                scroll={false}
                className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-[#172744] text-[#F8F6F0] text-[11px] rounded-xs font-medium hover:bg-[#101C32] transition-colors"
              >
                <span>Size: {currentSize}</span>
                <X size={11} />
              </Link>
            )}
            {currentSort && currentSort !== "featured" && (
              <Link
                href={buildFilterUrl({ sort: null })}
                scroll={false}
                className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-[#172744] text-[#F8F6F0] text-[11px] rounded-xs font-medium hover:bg-[#101C32] transition-colors"
              >
                <span>Sort: {activeSortLabel}</span>
                <X size={11} />
              </Link>
            )}
          </div>
        </div>
      )}

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
              href={buildFilterUrl({ categoryPath: "/shop" })}
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
                  href={buildFilterUrl({ categoryPath: `/shop/${cat.slug}` })}
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
          {currentSize && (
            <Link
              href={buildFilterUrl({ size: null })}
              scroll={false}
              className="text-[10px] text-[#B9A77A] hover:underline font-normal capitalize"
            >
              clear
            </Link>
          )}
        </h3>
        <div className="grid grid-cols-3 gap-1.5 pt-3">
          {SIZES.map((size) => {
            const isSelected = currentSize?.toLowerCase() === size.toLowerCase();
            const nextUrl = isSelected
              ? buildFilterUrl({ size: null })
              : buildFilterUrl({ size });

            return (
              <Link
                key={size}
                href={nextUrl}
                scroll={false}
                className={`py-2 text-center text-[11px] font-medium transition-all rounded-xs border ${
                  isSelected
                    ? "bg-[#172744] text-[#F8F6F0] border-[#172744] shadow-xs font-semibold"
                    : "border-[#D8C8AF]/60 text-charcoal/80 hover:border-[#172744] hover:text-[#172744] hover:bg-white"
                }`}
                style={{ fontFamily: "var(--font-inter)" }}
              >
                {size}
              </Link>
            );
          })}
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
        <ul className="space-y-1.5 pt-3">
          {SORT_OPTIONS.map((opt) => {
            const isSortActive = (currentSort || "featured") === opt.value;
            const nextUrl = buildFilterUrl({
              sort: opt.value === "featured" ? null : opt.value,
            });

            return (
              <li key={opt.value}>
                <Link
                  href={nextUrl}
                  scroll={false}
                  className={`w-full flex items-center justify-between text-xs py-1.5 transition-colors ${
                    isSortActive
                      ? "font-bold text-[#172744]"
                      : "text-charcoal/60 hover:text-[#172744]"
                  }`}
                  style={{ fontFamily: "var(--font-inter)" }}
                >
                  <span>{opt.label}</span>
                  {isSortActive && <Check size={12} className="text-[#172744]" />}
                </Link>
              </li>
            );
          })}
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
          {hasActiveFilters && (
            <span className="ml-2 inline-block w-2 h-2 rounded-full bg-[#B9A77A]" />
          )}
        </div>

        <button
          type="button"
          onClick={() => setIsMobileDrawerOpen(true)}
          className="inline-flex items-center gap-2 px-3.5 py-1.5 border border-[#172744] bg-white text-[#172744] text-xs font-semibold uppercase tracking-wider rounded-xs shadow-2xs"
        >
          <SlidersHorizontal size={13} />
          <span>Filter & Sort {hasActiveFilters ? "•" : ""}</span>
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
                href={pathname}
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
                Done ({totalProducts})
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
