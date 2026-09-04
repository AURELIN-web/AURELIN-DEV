import { CURRENCY } from "@/config/site";

export function formatPrice(amount: number, currency = CURRENCY.code): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatDate(date: string | Date): string {
  return new Intl.DateTimeFormat("en-IN", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date(date));
}

export function formatOrderNumber(id: string): string {
  return `#${id.slice(0, 8).toUpperCase()}`;
}

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

export function truncate(text: string, length: number): string {
  if (text.length <= length) return text;
  return text.slice(0, length).trim() + "…";
}

export function getDiscountPercentage(original: number, sale: number): number {
  return Math.round(((original - sale) / original) * 100);
}

/**
 * Injects Cloudinary automatic video compression (q_auto, vc_auto, resolution limits)
 * Prevents video streams from consuming excessive bandwidth on free tier.
 */
export function optimizeCloudinaryVideoUrl(url?: string | null, isMobile = false): string {
  if (!url) return "";
  if (!url.includes("res.cloudinary.com") || url.includes("q_auto")) return url;
  const transform = isMobile ? "q_auto,vc_auto,w_720" : "q_auto,vc_auto,w_1280";
  return url.replace("/video/upload/", `/video/upload/${transform}/`);
}

/**
 * Injects Cloudinary automatic image compression (f_auto, q_auto)
 */
export function optimizeCloudinaryImageUrl(url?: string | null, width?: number): string {
  if (!url) return "";
  if (!url.includes("res.cloudinary.com") || url.includes("f_auto,q_auto")) return url;
  const transform = width ? `f_auto,q_auto,w_${width}` : "f_auto,q_auto";
  return url.replace("/upload/", `/upload/${transform}/`);
}
