export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

// ================================================
// PROFILES
// ================================================

export interface Profile {
  id: string;
  email: string | null;
  full_name: string;
  phone: string | null;
  role: "customer" | "admin" | "manager";
  avatar_url: string | null;
  created_at: string;
  updated_at: string;
}

// ================================================
// CATEGORIES
// ================================================

export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  image_url: string | null;
  banner_url: string | null;
  seo_title: string | null;
  seo_description: string | null;
  sort_order: number;
  is_active: boolean;
  parent_id: string | null;
  created_at: string;
  updated_at: string;
}

// ================================================
// PRODUCTS
// ================================================

export interface Product {
  id: string;
  name: string;
  slug: string;
  sku: string | null;
  description: string | null;
  short_description: string | null;
  price: number;
  compare_at_price: number | null;
  sale_price: number | null;
  currency: string;
  status: "published" | "draft" | "archived";
  is_featured: boolean;
  is_new_arrival: boolean;
  is_best_seller: boolean;
  show_on_storefront: boolean;
  stock_quantity: number;
  low_stock_threshold: number;
  brand: string;
  material: string | null;
  fabric: string | null;
  care_instructions: string | null;
  fit: string | null;
  gender: string;
  seo_title: string | null;
  seo_description: string | null;
  seo_keywords: string | null;
  primary_image_url: string | null;
  hover_image_url: string | null;
  created_at: string;
  updated_at: string;
  // Joined
  product_variants?: ProductVariant[];
  product_images?: ProductImage[];
  categories?: Category[];
}

export interface ProductVariant {
  id: string;
  product_id: string;
  sku: string | null;
  size: string | null;
  colour: string | null;
  colour_hex: string | null;
  price: number | null;
  stock_quantity: number;
  is_available: boolean;
  image_url: string | null;
  show_on_storefront: boolean;
  created_at: string;
}

export interface ProductImage {
  id: string;
  product_id: string;
  url: string;
  alt_text: string | null;
  sort_order: number;
  created_at: string;
}

// ================================================
// COLLECTIONS
// ================================================

export interface Collection {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  hero_image_url: string | null;
  banner_image_url: string | null;
  seo_title: string | null;
  seo_description: string | null;
  is_active: boolean;
  sort_order: number;
  created_at: string;
  updated_at: string;
  // Joined
  products?: Product[];
}

// ================================================
// ORDERS
// ================================================

export interface ShippingAddress {
  full_name: string;
  phone: string;
  address_line1: string;
  address_line2?: string;
  city: string;
  state: string;
  postal_code: string;
  country: string;
}

export interface Order {
  id: string;
  order_number: string;
  customer_id: string | null;
  customer_email: string;
  customer_name: string;
  customer_phone: string | null;
  shipping_address: ShippingAddress;
  billing_address: ShippingAddress | null;
  subtotal: number;
  shipping_amount: number;
  discount_amount: number;
  total: number;
  currency: string;
  payment_status: "pending" | "paid" | "failed" | "refunded";
  order_status:
    | "pending"
    | "confirmed"
    | "processing"
    | "packed"
    | "shipped"
    | "delivered"
    | "completed"
    | "cancelled"
    | "returned";
  payment_provider: string | null;
  payment_reference: string | null;
  discount_code: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
  // Joined
  order_items?: OrderItem[];
}

export interface OrderItem {
  id: string;
  order_id: string;
  product_id: string | null;
  variant_id: string | null;
  product_name: string;
  variant_info: Json | null;
  quantity: number;
  unit_price: number;
  total_price: number;
  created_at: string;
}

// ================================================
// CART
// ================================================

export interface CartItem {
  productId: string;
  variantId: string | null;
  name: string;
  slug: string;
  price: number;
  quantity: number;
  image: string | null;
  colour: string | null;
  size: string | null;
  maxStock: number;
}

// ================================================
// JOURNAL
// ================================================

export interface JournalPost {
  id: string;
  title: string;
  slug: string;
  cover_image_url: string | null;
  excerpt: string | null;
  content: string | null;
  author: string;
  seo_title: string | null;
  seo_description: string | null;
  status: "published" | "draft";
  published_at: string | null;
  created_at: string;
  updated_at: string;
}

// ================================================
// SITE SETTINGS
// ================================================

export interface AnnouncementBarSettings {
  text: string;
  bg_color: string;
  text_color: string;
  is_active: boolean;
}

export interface WhatsAppSettings {
  number: string;
  country_code: string;
  message_template: string;
  enabled: boolean;
}

export interface HeroSettings {
  id: string;
  desktop_video_url: string | null;
  mobile_video_url: string | null;
  poster_image_url: string | null;
  eyebrow: string;
  heading: string;
  subheading: string;
  primary_cta_text: string;
  primary_cta_url: string;
  secondary_cta_text: string;
  secondary_cta_url: string;
  overlay_strength: number;
  autoplay: boolean;
  loop: boolean;
  is_muted: boolean;
  is_active: boolean;
  updated_at: string;
}

export interface HomepageSection {
  id: string;
  section_type: string;
  title: string | null;
  config: Json;
  sort_order: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

// ================================================
// DISCOUNTS
// ================================================

export interface Discount {
  id: string;
  code: string;
  type: "percentage" | "fixed";
  value: number;
  min_order_amount: number | null;
  max_uses: number | null;
  used_count: number;
  is_active: boolean;
  expires_at: string | null;
  created_at: string;
}

// ================================================
// MEDIA
// ================================================

export interface MediaAsset {
  id: string;
  filename: string;
  url: string;
  folder: string;
  alt_text: string | null;
  file_size: number | null;
  mime_type: string | null;
  uploaded_by: string | null;
  created_at: string;
}

// ================================================
// ENQUIRIES
// ================================================

export interface WhatsAppEnquiry {
  id: string;
  product_id: string | null;
  variant_id: string | null;
  product_name: string | null;
  variant_info: Json | null;
  session_id: string | null;
  created_at: string;
}

export interface ContactEnquiry {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  subject: string | null;
  message: string;
  status: "new" | "replied" | "closed";
  created_at: string;
}
