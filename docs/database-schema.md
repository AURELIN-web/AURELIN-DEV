# AURELIN & CO. — Database Schema Reference

The database is built on PostgreSQL with Supabase, comprising 25 relational tables with row-level security (RLS) policies, foreign key cascades, and automated timestamps.

---

## 1. Primary Tables

### `profiles`
User accounts extending Supabase Auth.
- `id` (UUID, PK, references `auth.users`)
- `email` (TEXT)
- `full_name` (TEXT)
- `phone` (TEXT)
- `role` (TEXT: `'customer' | 'admin' | 'manager'`)
- `avatar_url` (TEXT)
- `created_at`, `updated_at` (TIMESTAMPTZ)

### `products`
The central catalog table.
- `id` (UUID, PK)
- `name` (TEXT)
- `slug` (TEXT, UNIQUE)
- `sku` (TEXT)
- `short_description` (TEXT)
- `description` (TEXT)
- `price` (NUMERIC)
- `compare_at_price` (NUMERIC)
- `sale_price` (NUMERIC)
- `currency` (TEXT, default `'INR'`)
- `status` (TEXT: `'draft' | 'published' | 'archived'`)
- `is_featured`, `is_new_arrival`, `is_best_seller` (BOOLEAN)
- `stock_quantity`, `low_stock_threshold` (INTEGER)
- `brand` (TEXT, default `'AURELIN & CO.'`)
- `material`, `fabric`, `fit`, `care_instructions` (TEXT)
- `primary_image_url`, `hover_image_url` (TEXT)
- `seo_title`, `seo_description`, `seo_keywords` (TEXT)

### `product_variants`
Size and colour SKU options.
- `id` (UUID, PK)
- `product_id` (UUID, FK `products.id`)
- `sku` (TEXT)
- `size` (TEXT: `XS, S, M, L, XL, XXL`)
- `colour` (TEXT)
- `colour_hex` (TEXT)
- `price` (NUMERIC)
- `stock_quantity` (INTEGER)
- `is_available` (BOOLEAN)
- `image_url` (TEXT)

### `categories`
Hierarchical product categories.
- `id` (UUID, PK)
- `name` (TEXT)
- `slug` (TEXT, UNIQUE)
- `description` (TEXT)
- `image_url`, `banner_url` (TEXT)
- `sort_order` (INTEGER)
- `is_active` (BOOLEAN)
- `parent_id` (UUID, FK `categories.id`)

### `collections`
Curated editorial groupings (e.g. Linen Essentials, Summer Edit).
- `id` (UUID, PK)
- `name` (TEXT)
- `slug` (TEXT, UNIQUE)
- `description` (TEXT)
- `hero_image_url`, `banner_image_url` (TEXT)
- `is_active` (BOOLEAN)
- `sort_order` (INTEGER)

### `collection_products`
Many-to-many junction between collections and products.
- `id` (UUID, PK)
- `collection_id` (UUID, FK `collections.id`)
- `product_id` (UUID, FK `products.id`)
- `sort_order` (INTEGER)

### `orders`
Customer transaction headers.
- `id` (UUID, PK)
- `order_number` (TEXT, UNIQUE)
- `customer_id` (UUID, FK `profiles.id`)
- `customer_email` (TEXT)
- `customer_name` (TEXT)
- `customer_phone` (TEXT)
- `shipping_address` (JSONB)
- `billing_address` (JSONB)
- `subtotal`, `shipping_amount`, `discount_amount`, `total` (NUMERIC)
- `payment_status` (`'pending' | 'paid' | 'failed' | 'refunded'`)
- `order_status` (`'pending' | 'confirmed' | 'processing' | 'packed' | 'shipped' | 'delivered' | 'cancelled' | 'returned'`)
- `notes` (TEXT)

### `order_items`
Line items per order.
- `id` (UUID, PK)
- `order_id` (UUID, FK `orders.id`)
- `product_id` (UUID, FK `products.id`)
- `variant_id` (UUID, FK `product_variants.id`)
- `product_name` (TEXT)
- `variant_info` (JSONB)
- `quantity` (INTEGER)
- `unit_price`, `total_price` (NUMERIC)

### `hero_settings`
Homepage hero video and typography config.
- `id` (UUID, PK)
- `desktop_video_url`, `mobile_video_url`, `poster_image_url` (TEXT)
- `eyebrow`, `heading`, `subheading` (TEXT)
- `primary_cta_text`, `primary_cta_url` (TEXT)
- `secondary_cta_text`, `secondary_cta_url` (TEXT)
- `overlay_strength` (NUMERIC)
- `autoplay`, `loop`, `is_muted`, `is_active` (BOOLEAN)

### `site_settings`
Key-value store for global settings (announcement bar, WhatsApp config, footer).
- `key` (TEXT, PK)
- `value` (JSONB)
- `updated_at` (TIMESTAMPTZ)

### `journal_posts`
Editorial articles and brand essays.
- `id` (UUID, PK)
- `title`, `slug` (TEXT)
- `cover_image_url`, `excerpt`, `content` (TEXT)
- `author` (TEXT)
- `status` (`'published' | 'draft'`)
- `published_at` (TIMESTAMPTZ)

### `whatsapp_enquiries`
Lead tracking for WhatsApp order clicks.
- `id` (UUID, PK)
- `product_id` (UUID, FK `products.id`)
- `variant_id` (UUID)
- `product_name` (TEXT)
- `variant_info` (JSONB)
- `created_at` (TIMESTAMPTZ)

---

## 2. Row-Level Security (RLS) Policy Summary

| Table | Anonymous / Public | Authenticated Customer | Admin / Manager |
|---|---|---|---|
| `products` | SELECT (if `status = 'published'`) | SELECT | ALL |
| `categories` | SELECT (if `is_active = true`) | SELECT | ALL |
| `collections` | SELECT (if `is_active = true`) | SELECT | ALL |
| `orders` | INSERT (Guest checkout) | SELECT (own orders) | ALL |
| `order_items` | INSERT | SELECT (own items) | ALL |
| `profiles` | None | SELECT / UPDATE (own profile) | ALL |
| `hero_settings` | SELECT (if `is_active = true`) | SELECT | ALL |
| `site_settings` | SELECT | SELECT | ALL |
| `journal_posts` | SELECT (if `status = 'published'`) | SELECT | ALL |
