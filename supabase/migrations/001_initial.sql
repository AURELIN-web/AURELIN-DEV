-- ================================================
-- AURELIN & CO. — Supabase Database Migration
-- Clean, Idempotent, Production-Safe Migration
-- ================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ================================================
-- 1. BASE UTILITY FUNCTIONS
-- ================================================

CREATE OR REPLACE FUNCTION handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ================================================
-- 2. PROFILES TABLE (Must precede is_admin)
-- ================================================

CREATE TABLE IF NOT EXISTS public.profiles (
  id           uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email        text,
  full_name    text DEFAULT '',
  phone        text,
  role         text NOT NULL DEFAULT 'customer' CHECK (role IN ('customer', 'admin', 'manager')),
  avatar_url   text,
  created_at   timestamptz NOT NULL DEFAULT NOW(),
  updated_at   timestamptz NOT NULL DEFAULT NOW()
);

-- Trigger for profiles updated_at
DROP TRIGGER IF EXISTS profiles_updated_at ON public.profiles;
CREATE TRIGGER profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION handle_updated_at();

-- Auto-create profile on auth.users signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', '')
  )
  ON CONFLICT (id) DO UPDATE
  SET email = EXCLUDED.email;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- ================================================
-- 3. ADMIN CHECK FUNCTION (Now profiles exists)
-- ================================================

CREATE OR REPLACE FUNCTION is_admin()
RETURNS boolean AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role = 'admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- ================================================
-- 4. CATEGORIES
-- ================================================

CREATE TABLE IF NOT EXISTS public.categories (
  id               uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name             text NOT NULL,
  slug             text UNIQUE NOT NULL,
  description      text,
  image_url        text,
  banner_url       text,
  seo_title        text,
  seo_description  text,
  sort_order       int NOT NULL DEFAULT 0,
  is_active        boolean NOT NULL DEFAULT true,
  parent_id        uuid REFERENCES public.categories(id) ON DELETE SET NULL,
  created_at       timestamptz NOT NULL DEFAULT NOW(),
  updated_at       timestamptz NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_categories_slug ON public.categories(slug);
CREATE INDEX IF NOT EXISTS idx_categories_active ON public.categories(is_active);

DROP TRIGGER IF EXISTS categories_updated_at ON public.categories;
CREATE TRIGGER categories_updated_at
  BEFORE UPDATE ON public.categories
  FOR EACH ROW EXECUTE FUNCTION handle_updated_at();

-- ================================================
-- 5. PRODUCTS
-- ================================================

CREATE TABLE IF NOT EXISTS public.products (
  id                    uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name                  text NOT NULL,
  slug                  text UNIQUE NOT NULL,
  sku                   text UNIQUE,
  description           text,
  short_description     text,
  price                 numeric(10,2) NOT NULL CHECK (price >= 0),
  compare_at_price      numeric(10,2) CHECK (compare_at_price >= 0),
  sale_price            numeric(10,2) CHECK (sale_price >= 0),
  currency              text NOT NULL DEFAULT 'INR',
  status                text NOT NULL DEFAULT 'draft' CHECK (status IN ('published', 'draft', 'archived')),
  is_featured           boolean NOT NULL DEFAULT false,
  is_new_arrival        boolean NOT NULL DEFAULT false,
  is_best_seller        boolean NOT NULL DEFAULT false,
  show_on_storefront    boolean NOT NULL DEFAULT true,
  stock_quantity        int NOT NULL DEFAULT 0 CHECK (stock_quantity >= 0),
  low_stock_threshold   int NOT NULL DEFAULT 5,
  brand                 text DEFAULT 'AURELIN & CO.',
  material              text,
  fabric                text,
  care_instructions     text,
  fit                   text,
  gender                text NOT NULL DEFAULT 'men',
  seo_title             text,
  seo_description       text,
  seo_keywords          text,
  primary_image_url     text,
  hover_image_url       text,
  created_at            timestamptz NOT NULL DEFAULT NOW(),
  updated_at            timestamptz NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_products_slug ON public.products(slug);
CREATE INDEX IF NOT EXISTS idx_products_status ON public.products(status);
CREATE INDEX IF NOT EXISTS idx_products_featured ON public.products(is_featured) WHERE is_featured = true;
CREATE INDEX IF NOT EXISTS idx_products_new_arrival ON public.products(is_new_arrival) WHERE is_new_arrival = true;
CREATE INDEX IF NOT EXISTS idx_products_best_seller ON public.products(is_best_seller) WHERE is_best_seller = true;

DROP TRIGGER IF EXISTS products_updated_at ON public.products;
CREATE TRIGGER products_updated_at
  BEFORE UPDATE ON public.products
  FOR EACH ROW EXECUTE FUNCTION handle_updated_at();

-- ================================================
-- 6. PRODUCT VARIANTS
-- ================================================

CREATE TABLE IF NOT EXISTS public.product_variants (
  id               uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id       uuid NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  sku              text UNIQUE,
  size             text,
  colour           text,
  colour_hex       text,
  price            numeric(10,2) CHECK (price >= 0),
  stock_quantity   int NOT NULL DEFAULT 0 CHECK (stock_quantity >= 0),
  is_available     boolean NOT NULL DEFAULT true,
  image_url        text,
  show_on_storefront boolean NOT NULL DEFAULT false,
  created_at       timestamptz NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_variants_product ON public.product_variants(product_id);
CREATE INDEX IF NOT EXISTS idx_variants_size ON public.product_variants(size);
CREATE INDEX IF NOT EXISTS idx_variants_colour ON public.product_variants(colour);

-- ================================================
-- 7. PRODUCT IMAGES
-- ================================================

CREATE TABLE IF NOT EXISTS public.product_images (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id  uuid NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  url         text NOT NULL,
  alt_text    text,
  sort_order  int NOT NULL DEFAULT 0,
  created_at  timestamptz NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_images_product ON public.product_images(product_id, sort_order);

-- ================================================
-- 8. PRODUCT CATEGORIES (JUNCTION)
-- ================================================

CREATE TABLE IF NOT EXISTS public.product_categories (
  product_id   uuid NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  category_id  uuid NOT NULL REFERENCES public.categories(id) ON DELETE CASCADE,
  PRIMARY KEY (product_id, category_id)
);

CREATE INDEX IF NOT EXISTS idx_prod_cat_cat ON public.product_categories(category_id);

-- ================================================
-- 9. COLLECTIONS
-- ================================================

CREATE TABLE IF NOT EXISTS public.collections (
  id               uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name             text NOT NULL,
  slug             text UNIQUE NOT NULL,
  description      text,
  hero_image_url   text,
  banner_image_url text,
  seo_title        text,
  seo_description  text,
  is_active        boolean NOT NULL DEFAULT true,
  sort_order       int NOT NULL DEFAULT 0,
  created_at       timestamptz NOT NULL DEFAULT NOW(),
  updated_at       timestamptz NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_collections_slug ON public.collections(slug);
CREATE INDEX IF NOT EXISTS idx_collections_active ON public.collections(is_active);

DROP TRIGGER IF EXISTS collections_updated_at ON public.collections;
CREATE TRIGGER collections_updated_at
  BEFORE UPDATE ON public.collections
  FOR EACH ROW EXECUTE FUNCTION handle_updated_at();

-- ================================================
-- 10. COLLECTION PRODUCTS (JUNCTION)
-- ================================================

CREATE TABLE IF NOT EXISTS public.collection_products (
  collection_id  uuid NOT NULL REFERENCES public.collections(id) ON DELETE CASCADE,
  product_id     uuid NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  sort_order     int NOT NULL DEFAULT 0,
  PRIMARY KEY (collection_id, product_id)
);

CREATE INDEX IF NOT EXISTS idx_col_prod_col ON public.collection_products(collection_id, sort_order);

-- ================================================
-- 11. ORDERS
-- ================================================

CREATE TABLE IF NOT EXISTS public.orders (
  id                 uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_number       text UNIQUE NOT NULL,
  customer_id        uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  customer_email     text NOT NULL,
  customer_name      text NOT NULL,
  customer_phone     text,
  shipping_address   jsonb NOT NULL,
  billing_address    jsonb,
  subtotal           numeric(10,2) NOT NULL DEFAULT 0,
  shipping_amount    numeric(10,2) NOT NULL DEFAULT 0,
  discount_amount    numeric(10,2) NOT NULL DEFAULT 0,
  total              numeric(10,2) NOT NULL DEFAULT 0,
  currency           text NOT NULL DEFAULT 'INR',
  payment_status     text NOT NULL DEFAULT 'pending' CHECK (payment_status IN ('pending', 'paid', 'failed', 'refunded')),
  order_status       text NOT NULL DEFAULT 'pending' CHECK (order_status IN ('pending', 'confirmed', 'processing', 'packed', 'shipped', 'delivered', 'cancelled', 'returned')),
  payment_provider   text,
  payment_reference  text,
  discount_code      text,
  notes              text,
  created_at         timestamptz NOT NULL DEFAULT NOW(),
  updated_at         timestamptz NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_orders_number ON public.orders(order_number);
CREATE INDEX IF NOT EXISTS idx_orders_customer ON public.orders(customer_id);
CREATE INDEX IF NOT EXISTS idx_orders_email ON public.orders(customer_email);
CREATE INDEX IF NOT EXISTS idx_orders_created ON public.orders(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_orders_status ON public.orders(order_status);

DROP TRIGGER IF EXISTS orders_updated_at ON public.orders;
CREATE TRIGGER orders_updated_at
  BEFORE UPDATE ON public.orders
  FOR EACH ROW EXECUTE FUNCTION handle_updated_at();

-- ================================================
-- 12. ORDER ITEMS
-- ================================================

CREATE TABLE IF NOT EXISTS public.order_items (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id      uuid NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  product_id    uuid REFERENCES public.products(id) ON DELETE SET NULL,
  variant_id    uuid REFERENCES public.product_variants(id) ON DELETE SET NULL,
  product_name  text NOT NULL,
  variant_info  jsonb,
  quantity      int NOT NULL CHECK (quantity > 0),
  unit_price    numeric(10,2) NOT NULL CHECK (unit_price >= 0),
  total_price   numeric(10,2) NOT NULL CHECK (total_price >= 0),
  created_at    timestamptz NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_order_items_order ON public.order_items(order_id);

-- ================================================
-- 13. ADDRESSES
-- ================================================

CREATE TABLE IF NOT EXISTS public.addresses (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id    uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  label         text DEFAULT 'Home',
  full_name     text NOT NULL,
  phone         text NOT NULL,
  address_line1 text NOT NULL,
  address_line2 text,
  city          text NOT NULL,
  state         text NOT NULL,
  postal_code   text NOT NULL,
  country       text NOT NULL DEFAULT 'India',
  is_default    boolean NOT NULL DEFAULT false,
  created_at    timestamptz NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_addresses_profile ON public.addresses(profile_id);

-- ================================================
-- 14. WISHLISTS
-- ================================================

CREATE TABLE IF NOT EXISTS public.wishlists (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id  uuid UNIQUE NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  created_at  timestamptz NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.wishlist_items (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  wishlist_id  uuid NOT NULL REFERENCES public.wishlists(id) ON DELETE CASCADE,
  product_id   uuid NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  variant_id   uuid REFERENCES public.product_variants(id) ON DELETE SET NULL,
  created_at   timestamptz NOT NULL DEFAULT NOW(),
  UNIQUE (wishlist_id, product_id)
);

-- ================================================
-- 15. REVIEWS
-- ================================================

CREATE TABLE IF NOT EXISTS public.reviews (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id  uuid NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  profile_id  uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  author_name text NOT NULL,
  rating      int NOT NULL CHECK (rating BETWEEN 1 AND 5),
  title       text,
  body        text,
  is_verified boolean NOT NULL DEFAULT false,
  is_approved boolean NOT NULL DEFAULT false,
  created_at  timestamptz NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_reviews_product ON public.reviews(product_id, is_approved);

-- ================================================
-- 16. JOURNAL POSTS
-- ================================================

CREATE TABLE IF NOT EXISTS public.journal_posts (
  id               uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title            text NOT NULL,
  slug             text UNIQUE NOT NULL,
  cover_image_url  text,
  excerpt          text,
  content          text,
  author           text NOT NULL DEFAULT 'AURELIN Atelier',
  seo_title        text,
  seo_description  text,
  status           text NOT NULL DEFAULT 'draft' CHECK (status IN ('published', 'draft')),
  published_at     timestamptz,
  created_at       timestamptz NOT NULL DEFAULT NOW(),
  updated_at       timestamptz NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_journal_slug ON public.journal_posts(slug);
CREATE INDEX IF NOT EXISTS idx_journal_status ON public.journal_posts(status);

DROP TRIGGER IF EXISTS journal_updated_at ON public.journal_posts;
CREATE TRIGGER journal_updated_at
  BEFORE UPDATE ON public.journal_posts
  FOR EACH ROW EXECUTE FUNCTION handle_updated_at();

-- ================================================
-- 17. SITE SETTINGS
-- ================================================

CREATE TABLE IF NOT EXISTS public.site_settings (
  key         text PRIMARY KEY,
  value       jsonb NOT NULL,
  updated_at  timestamptz NOT NULL DEFAULT NOW()
);

-- ================================================
-- 18. HERO SETTINGS
-- ================================================

CREATE TABLE IF NOT EXISTS public.hero_settings (
  id                  uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  desktop_video_url   text,
  mobile_video_url    text,
  poster_image_url    text,
  eyebrow             text NOT NULL DEFAULT 'SPRING / SUMMER',
  heading             text NOT NULL DEFAULT 'THE ART OF DRESSING WELL',
  subheading          text NOT NULL DEFAULT 'Quiet confidence. Timeless character.',
  primary_cta_text    text NOT NULL DEFAULT 'DISCOVER THE COLLECTION',
  primary_cta_url     text NOT NULL DEFAULT '/collections',
  secondary_cta_text  text NOT NULL DEFAULT 'SHOP NEW ARRIVALS',
  secondary_cta_url   text NOT NULL DEFAULT '/new-arrivals',
  overlay_strength    numeric(3,2) NOT NULL DEFAULT 0.35 CHECK (overlay_strength BETWEEN 0 AND 1),
  autoplay            boolean NOT NULL DEFAULT true,
  loop                boolean NOT NULL DEFAULT true,
  is_muted            boolean NOT NULL DEFAULT true,
  is_active           boolean NOT NULL DEFAULT true,
  updated_at          timestamptz NOT NULL DEFAULT NOW()
);

-- ================================================
-- 19. HOMEPAGE SECTIONS (CMS)
-- ================================================

CREATE TABLE IF NOT EXISTS public.homepage_sections (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  section_type text NOT NULL,
  title        text,
  config       jsonb NOT NULL DEFAULT '{}',
  sort_order   int NOT NULL DEFAULT 0,
  is_active    boolean NOT NULL DEFAULT true,
  created_at   timestamptz NOT NULL DEFAULT NOW(),
  updated_at   timestamptz NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_hp_sections_order ON public.homepage_sections(sort_order);

-- ================================================
-- 20. NAVIGATION ITEMS
-- ================================================

CREATE TABLE IF NOT EXISTS public.navigation_items (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  label       text NOT NULL,
  url         text NOT NULL,
  parent_id   uuid REFERENCES public.navigation_items(id) ON DELETE CASCADE,
  location    text NOT NULL DEFAULT 'header' CHECK (location IN ('header', 'footer', 'mobile')),
  sort_order  int NOT NULL DEFAULT 0,
  is_active   boolean NOT NULL DEFAULT true
);

-- ================================================
-- 21. MEDIA ASSETS
-- ================================================

CREATE TABLE IF NOT EXISTS public.media_assets (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  filename     text NOT NULL,
  url          text NOT NULL,
  folder       text NOT NULL DEFAULT 'general',
  alt_text     text,
  file_size    int,
  mime_type    text,
  uploaded_by  uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at   timestamptz NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_media_folder ON public.media_assets(folder);

-- ================================================
-- 22. DISCOUNTS
-- ================================================

CREATE TABLE IF NOT EXISTS public.discounts (
  id                uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  code              text UNIQUE NOT NULL,
  type              text NOT NULL CHECK (type IN ('percentage', 'fixed')),
  value             numeric(10,2) NOT NULL CHECK (value > 0),
  min_order_amount  numeric(10,2) CHECK (min_order_amount >= 0),
  max_uses          int,
  used_count        int NOT NULL DEFAULT 0,
  is_active         boolean NOT NULL DEFAULT true,
  expires_at        timestamptz,
  created_at        timestamptz NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_discounts_code ON public.discounts(code);

-- ================================================
-- 23. WHATSAPP ENQUIRIES
-- ================================================

CREATE TABLE IF NOT EXISTS public.whatsapp_enquiries (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id    uuid REFERENCES public.products(id) ON DELETE SET NULL,
  variant_id    uuid REFERENCES public.product_variants(id) ON DELETE SET NULL,
  product_name  text,
  variant_info  jsonb,
  session_id    text,
  created_at    timestamptz NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_wa_enquiries_created ON public.whatsapp_enquiries(created_at DESC);

-- ================================================
-- 24. CONTACT ENQUIRIES
-- ================================================

CREATE TABLE IF NOT EXISTS public.contact_enquiries (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name        text NOT NULL,
  email       text NOT NULL,
  phone       text,
  subject     text,
  message     text NOT NULL,
  status      text NOT NULL DEFAULT 'new' CHECK (status IN ('new', 'replied', 'closed')),
  created_at  timestamptz NOT NULL DEFAULT NOW()
);

-- ================================================
-- 25. ROW LEVEL SECURITY (RLS)
-- ================================================

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_variants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.collections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.collection_products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.addresses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.wishlists ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.wishlist_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.journal_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.hero_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.homepage_sections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.navigation_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.media_assets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.discounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.whatsapp_enquiries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contact_enquiries ENABLE ROW LEVEL SECURITY;

-- Drop existing policies to allow re-runs
DO $$
BEGIN
  -- Profiles
  DROP POLICY IF EXISTS "profiles_select_own" ON public.profiles;
  DROP POLICY IF EXISTS "profiles_update_own" ON public.profiles;
  DROP POLICY IF EXISTS "profiles_admin_all" ON public.profiles;
  
  -- Categories
  DROP POLICY IF EXISTS "categories_public_read" ON public.categories;
  DROP POLICY IF EXISTS "categories_admin_write" ON public.categories;
  
  -- Products
  DROP POLICY IF EXISTS "products_public_read" ON public.products;
  DROP POLICY IF EXISTS "products_admin_write" ON public.products;
  
  -- Variants & Images
  DROP POLICY IF EXISTS "variants_public_read" ON public.product_variants;
  DROP POLICY IF EXISTS "variants_admin_write" ON public.product_variants;
  DROP POLICY IF EXISTS "images_public_read" ON public.product_images;
  DROP POLICY IF EXISTS "images_admin_write" ON public.product_images;
  
  -- Collections
  DROP POLICY IF EXISTS "collections_public_read" ON public.collections;
  DROP POLICY IF EXISTS "collections_admin_write" ON public.collections;
  DROP POLICY IF EXISTS "col_prod_public_read" ON public.collection_products;
  DROP POLICY IF EXISTS "col_prod_admin_write" ON public.collection_products;

  -- Orders
  DROP POLICY IF EXISTS "orders_customer_select" ON public.orders;
  DROP POLICY IF EXISTS "orders_public_insert" ON public.orders;
  DROP POLICY IF EXISTS "orders_admin_all" ON public.orders;
  DROP POLICY IF EXISTS "order_items_customer_select" ON public.order_items;
  DROP POLICY IF EXISTS "order_items_public_insert" ON public.order_items;
  DROP POLICY IF EXISTS "order_items_admin_all" ON public.order_items;

  -- Settings & CMS
  DROP POLICY IF EXISTS "settings_public_read" ON public.site_settings;
  DROP POLICY IF EXISTS "settings_admin_write" ON public.site_settings;
  DROP POLICY IF EXISTS "hero_public_read" ON public.hero_settings;
  DROP POLICY IF EXISTS "hero_admin_write" ON public.hero_settings;
  DROP POLICY IF EXISTS "homepage_public_read" ON public.homepage_sections;
  DROP POLICY IF EXISTS "homepage_admin_write" ON public.homepage_sections;
  DROP POLICY IF EXISTS "journal_public_read" ON public.journal_posts;
  DROP POLICY IF EXISTS "journal_admin_write" ON public.journal_posts;
  DROP POLICY IF EXISTS "wa_enquiries_public_insert" ON public.whatsapp_enquiries;
  DROP POLICY IF EXISTS "wa_enquiries_admin_read" ON public.whatsapp_enquiries;
  DROP POLICY IF EXISTS "contact_public_insert" ON public.contact_enquiries;
  DROP POLICY IF EXISTS "contact_admin_all" ON public.contact_enquiries;
  DROP POLICY IF EXISTS "discounts_active_read" ON public.discounts;
  DROP POLICY IF EXISTS "discounts_admin_all" ON public.discounts;
END $$;

-- Profiles Policies
CREATE POLICY "profiles_select_own" ON public.profiles FOR SELECT USING (auth.uid() = id OR is_admin());
CREATE POLICY "profiles_update_own" ON public.profiles FOR UPDATE USING (auth.uid() = id OR is_admin());
CREATE POLICY "profiles_admin_all" ON public.profiles FOR ALL USING (is_admin());

-- Categories Policies
CREATE POLICY "categories_public_read" ON public.categories FOR SELECT USING (is_active = true OR is_admin());
CREATE POLICY "categories_admin_write" ON public.categories FOR ALL USING (is_admin());

-- Products Policies
CREATE POLICY "products_public_read" ON public.products FOR SELECT USING (status = 'published' OR is_admin());
CREATE POLICY "products_admin_write" ON public.products FOR ALL USING (is_admin());

-- Product Variants Policies
CREATE POLICY "variants_public_read" ON public.product_variants FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.products p WHERE p.id = product_id AND (p.status = 'published' OR is_admin()))
);
CREATE POLICY "variants_admin_write" ON public.product_variants FOR ALL USING (is_admin());

-- Product Images Policies
CREATE POLICY "images_public_read" ON public.product_images FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.products p WHERE p.id = product_id AND (p.status = 'published' OR is_admin()))
);
CREATE POLICY "images_admin_write" ON public.product_images FOR ALL USING (is_admin());

-- Collections Policies
CREATE POLICY "collections_public_read" ON public.collections FOR SELECT USING (is_active = true OR is_admin());
CREATE POLICY "collections_admin_write" ON public.collections FOR ALL USING (is_admin());

CREATE POLICY "col_prod_public_read" ON public.collection_products FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.collections c WHERE c.id = collection_id AND (c.is_active = true OR is_admin()))
);
CREATE POLICY "col_prod_admin_write" ON public.collection_products FOR ALL USING (is_admin());

-- Orders Policies
CREATE POLICY "orders_customer_select" ON public.orders FOR SELECT USING (
  customer_id = auth.uid() OR is_admin()
);
CREATE POLICY "orders_public_insert" ON public.orders FOR INSERT WITH CHECK (true);
CREATE POLICY "orders_admin_all" ON public.orders FOR ALL USING (is_admin());

-- Order Items Policies
CREATE POLICY "order_items_customer_select" ON public.order_items FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.orders o WHERE o.id = order_id AND (o.customer_id = auth.uid() OR is_admin()))
);
CREATE POLICY "order_items_public_insert" ON public.order_items FOR INSERT WITH CHECK (true);
CREATE POLICY "order_items_admin_all" ON public.order_items FOR ALL USING (is_admin());

-- Settings & CMS Policies
CREATE POLICY "settings_public_read" ON public.site_settings FOR SELECT USING (true);
CREATE POLICY "settings_admin_write" ON public.site_settings FOR ALL USING (is_admin());

CREATE POLICY "hero_public_read" ON public.hero_settings FOR SELECT USING (true);
CREATE POLICY "hero_admin_write" ON public.hero_settings FOR ALL USING (is_admin());

CREATE POLICY "homepage_public_read" ON public.homepage_sections FOR SELECT USING (is_active = true OR is_admin());
CREATE POLICY "homepage_admin_write" ON public.homepage_sections FOR ALL USING (is_admin());

CREATE POLICY "journal_public_read" ON public.journal_posts FOR SELECT USING (status = 'published' OR is_admin());
CREATE POLICY "journal_admin_write" ON public.journal_posts FOR ALL USING (is_admin());

CREATE POLICY "discounts_active_read" ON public.discounts FOR SELECT USING (is_active = true AND (expires_at IS NULL OR expires_at > NOW()));
CREATE POLICY "discounts_admin_all" ON public.discounts FOR ALL USING (is_admin());

CREATE POLICY "wa_enquiries_public_insert" ON public.whatsapp_enquiries FOR INSERT WITH CHECK (true);
CREATE POLICY "wa_enquiries_admin_read" ON public.whatsapp_enquiries FOR SELECT USING (is_admin());

CREATE POLICY "contact_public_insert" ON public.contact_enquiries FOR INSERT WITH CHECK (true);
CREATE POLICY "contact_admin_all" ON public.contact_enquiries FOR ALL USING (is_admin());

-- ================================================
-- 26. STORAGE BUCKETS
-- ================================================

INSERT INTO storage.buckets (id, name, public) VALUES
  ('products', 'products', true),
  ('hero', 'hero', true),
  ('collections', 'collections', true),
  ('homepage', 'homepage', true),
  ('journal', 'journal', true),
  ('brand', 'brand', true),
  ('banners', 'banners', true)
ON CONFLICT (id) DO NOTHING;

-- Storage policies
DO $$
BEGIN
  DROP POLICY IF EXISTS "storage_public_read" ON storage.objects;
  DROP POLICY IF EXISTS "storage_admin_upload" ON storage.objects;
  DROP POLICY IF EXISTS "storage_admin_update" ON storage.objects;
  DROP POLICY IF EXISTS "storage_admin_delete" ON storage.objects;
END $$;

CREATE POLICY "storage_public_read" ON storage.objects
  FOR SELECT USING (bucket_id IN ('products','hero','collections','homepage','journal','brand','banners'));

CREATE POLICY "storage_admin_upload" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id IN ('products','hero','collections','homepage','journal','brand','banners')
  );

CREATE POLICY "storage_admin_update" ON storage.objects
  FOR UPDATE USING (
    bucket_id IN ('products','hero','collections','homepage','journal','brand','banners')
  );

CREATE POLICY "storage_admin_delete" ON storage.objects
  FOR DELETE USING (
    bucket_id IN ('products','hero','collections','homepage','journal','brand','banners')
  );

-- ================================================
-- 27. SEED DEFAULT DATA
-- ================================================

-- Default hero settings
INSERT INTO public.hero_settings (
  eyebrow, heading, subheading,
  primary_cta_text, primary_cta_url,
  secondary_cta_text, secondary_cta_url,
  overlay_strength
) VALUES (
  'SPRING / SUMMER',
  'THE ART OF DRESSING WELL',
  'Quiet confidence. Timeless character.',
  'DISCOVER THE COLLECTION', '/collections',
  'SHOP NEW ARRIVALS', '/new-arrivals',
  0.35
) ON CONFLICT DO NOTHING;

-- Default site settings
INSERT INTO public.site_settings (key, value) VALUES
  ('announcement_bar', '{"text": "COMPLIMENTARY SHIPPING ON ALL ORDERS", "bg_color": "#172744", "text_color": "#F8F6F0", "is_active": true}'),
  ('whatsapp', '{"number": "", "country_code": "91", "message_template": "Hello AURELIN & CO.,\n\nI would like to enquire about:", "enabled": true}'),
  ('seo', '{"site_name": "AURELIN & CO.", "description": "Premium menswear crafted for the modern gentleman.", "og_image": ""}'),
  ('footer', '{"description": "A modern menswear house shaped by timeless silhouettes, natural fabrics and the belief that true elegance is never excessive.", "newsletter_text": "Private access to new collections, stories and seasonal edits."}')
ON CONFLICT (key) DO NOTHING;

-- Default homepage sections
INSERT INTO public.homepage_sections (section_type, title, config, sort_order, is_active) VALUES
  ('hero', 'Hero', '{}', 0, true),
  ('collection_grid', 'THE AURELIN COLLECTION', '{"subtitle": "Crafted for those who appreciate what doesn''t need to be explained."}', 1, true),
  ('signature_pieces', 'SIGNATURE PIECES', '{"mode": "manual", "cta_text": "VIEW ALL", "cta_url": "/shop"}', 2, true),
  ('fabric_story', 'Fabric Story', '{"eyebrow": "OUR FABRICS", "heading": "THE LANGUAGE OF LINEN", "body": "Natural texture.\nEffortless movement.\nDesigned for warm days\nand refined moments.", "cta_text": "DISCOVER OUR FABRICS", "cta_url": "/care-guide"}', 3, true),
  ('brand_story', 'Brand Story', '{"heading": "DRESS WITH CHARACTER", "body": "Style is not about being noticed.\nIt is about being remembered.", "cta_text": "EXPLORE AURELIN", "cta_url": "/about"}', 4, true),
  ('trust_features', 'Trust Features', '{"features": [{"title": "PREMIUM NATURAL FABRICS", "description": "Sourced from the finest mills"}, {"title": "CRAFTSMANSHIP", "description": "Meticulous attention to detail"}, {"title": "EASY EXCHANGES", "description": "Hassle-free returns & exchanges"}, {"title": "WHATSAPP CONCIERGE", "description": "Personal styling assistance"}]}', 5, true)
ON CONFLICT DO NOTHING;

-- Default categories
INSERT INTO public.categories (name, slug, sort_order, is_active) VALUES
  ('Shirts', 'shirts', 0, true),
  ('Linen Shirts', 'linen-shirts', 1, true),
  ('New Arrivals', 'new-arrivals', 2, true),
  ('Best Sellers', 'best-sellers', 3, true),
  ('Trousers', 'trousers', 4, true),
  ('Accessories', 'accessories', 5, true)
ON CONFLICT (slug) DO NOTHING;

-- Default collections
INSERT INTO public.collections (name, slug, sort_order, is_active) VALUES
  ('Linen Essentials', 'linen-essentials', 0, true),
  ('Signature Shirts', 'signature-shirts', 1, true),
  ('Summer Edit', 'summer-edit', 2, true),
  ('The Gentleman''s Collection', 'gentlemans-collection', 3, true)
ON CONFLICT (slug) DO NOTHING;

-- ================================================
-- END OF MIGRATION
-- ================================================
