export const SITE_NAME = "AURELIN & CO.";
export const SITE_TAGLINE = "MAISON DE L'HOMME";
export const SITE_URL =
  process.env.NODE_ENV === "production"
    ? process.env.NEXT_PUBLIC_SITE_URL && !process.env.NEXT_PUBLIC_SITE_URL.includes("localhost")
      ? process.env.NEXT_PUBLIC_SITE_URL.replace(/\/$/, "")
      : "https://aurelinco.com"
    : (process.env.NEXT_PUBLIC_SITE_URL || "https://aurelinco.com").replace(/\/$/, "");
export const SITE_DESCRIPTION =
  "A modern luxury menswear maison shaped by timeless silhouettes, 100% pure European linen, and the belief that true elegance is never excessive. Discover our signature shirts, relaxed tailoring, and limited atelier editions.";

export const DEFAULT_WHATSAPP_NUMBER = process.env.WHATSAPP_NUMBER || "919645032855";
export const DEFAULT_WHATSAPP_DISPLAY = "+91 96450 32855";

export const BRAND_COLORS = {
  navy: "#172744",
  deepNavy: "#101C32",
  beige: "#D8C8AF",
  ivory: "#F8F6F0",
  champagne: "#B9A77A",
  charcoal: "#242424",
  white: "#FFFFFF",
} as const;

export const CURRENCY = {
  code: "INR",
  symbol: "₹",
} as const;

export const NAV_LINKS = {
  shop: [
    { label: "New Arrivals", href: "/shop/new-arrivals" },
    { label: "Best Sellers", href: "/shop/best-sellers" },
    { label: "Shirts", href: "/shop/shirts" },
    { label: "Linen Shirts", href: "/shop/linen-shirts" },
    { label: "Trousers", href: "/shop/trousers" },
    { label: "T-Shirts", href: "/shop/t-shirts" },
    { label: "All Products", href: "/shop" },
  ],
  collections: [
    { label: "The Gentleman's Collections", href: "/collections/the-gentleman-s-collections" },
    { label: "Linen Essentials", href: "/collections/linen-essentials" },
    { label: "T-Shirts", href: "/collections/t-shirts" },
    { label: "Summer Edit", href: "/collections/summer-edit" },
  ],
  about: [
    { label: "Our Story", href: "/about" },
    { label: "Craftsmanship", href: "/about#craftsmanship" },
    { label: "Fabric & Care", href: "/care-guide" },
  ],
};

export const FOOTER_LINKS = {
  shop: [
    { label: "New Arrivals", href: "/new-arrivals" },
    { label: "Shirts", href: "/shop/shirts" },
    { label: "Linen Collection", href: "/shop/linen-shirts" },
    { label: "All Collections", href: "/collections" },
  ],
  about: [
    { label: "Our Story", href: "/about" },
    { label: "Craftsmanship", href: "/about#craftsmanship" },
    { label: "Fabric & Care", href: "/care-guide" },
  ],
  clientServices: [
    { label: "Contact", href: "/contact" },
    { label: "WhatsApp Concierge", href: "#whatsapp" },
    { label: "Shipping", href: "/shipping" },
    { label: "Returns", href: "/returns" },
    { label: "FAQ", href: "/faq" },
    { label: "Size Guide", href: "/size-guide" },
  ],
};

export const ORDER_STATUSES = [
  "pending",
  "processing",
  "shipped",
  "delivered",
  "completed",
  "confirmed",
  "packed",
  "cancelled",
  "returned",
] as const;

export type OrderStatus = (typeof ORDER_STATUSES)[number];

export const PAYMENT_STATUSES = ["pending", "paid", "failed", "refunded"] as const;
export type PaymentStatus = (typeof PAYMENT_STATUSES)[number];

export const PRODUCT_SIZES = ["XS", "S", "M", "L", "XL", "XXL"] as const;

export const STORAGE_BUCKETS = {
  products: "products",
  hero: "hero",
  collections: "collections",
  homepage: "homepage",
  journal: "journal",
  brand: "brand",
  banners: "banners",
} as const;
