# AURELIN & CO. — System Architecture Documentation

## 1. Overview
AURELIN & CO. is a luxury menswear e-commerce platform built for high performance, editorial elegance, mobile responsiveness, and scalable management.

- **Production Domain**: `https://aurelinco.com`
- **Framework**: Next.js 16 (App Router with Turbopack)
- **Database & Auth**: Supabase (PostgreSQL with RLS & Supabase Storage)
- **Styling**: Tailwind CSS v4 design system with custom brand tokens (`#172744` Navy, `#F8F6F0` Ivory, `#D8C8AF` Beige, `#B9A77A` Champagne)
- **Typography**: Cormorant Garamond (Editorial Headings) & Inter (Clean UI & Body)

---

## 2. Directory Architecture

```
AURELIN & CO/
├── app/
│   ├── (storefront)/         # Public e-commerce & editorial pages
│   │   ├── page.tsx          # Homepage with ISR & dynamic CMS sections
│   │   ├── shop/             # Catalogue with filter sidebar & dynamic categories
│   │   ├── product/[slug]/   # Product detail with variant selectors & WhatsApp flow
│   │   ├── collections/      # Curated editorial collections
│   │   ├── cart/             # Dedicated shopping bag page
│   │   ├── checkout/         # Streamlined checkout with order placement
│   │   ├── wishlist/         # Saved items with persistent state
│   │   ├── account/          # Customer dashboard & order history
│   │   ├── login/ & register/# Customer authentication
│   │   ├── journal/          # Maison editorial stories & essays
│   │   └── about/, contact/, faq/, shipping/, returns/, size-guide/, care-guide/
│   │
│   ├── (admin)/              # Protected administrative dashboard
│   │   ├── admin/dashboard/  # Real-time metrics, revenue, low-stock alerts
│   │   ├── admin/products/   # Product CRUD with variant & image managers
│   │   ├── admin/categories/ # Category hierarchy & sorting
│   │   ├── admin/collections/# Curated edit collections manager
│   │   ├── admin/orders/     # Order tracking & status updater
│   │   ├── admin/hero/       # Homepage hero video & typography editor
│   │   ├── admin/homepage/   # Homepage section visibility & CMS controls
│   │   ├── admin/whatsapp/   # WhatsApp concierge configuration & enquiry logs
│   │   ├── admin/media/      # Supabase storage bucket asset manager
│   │   ├── admin/journal/    # Editorial blog post publisher
│   │   ├── admin/customers/  # Registered customer directory
│   │   ├── admin/discounts/  # Promo code & voucher management
│   │   └── admin/settings/   # Announcement bar & global site settings
│   │
│   ├── layout.tsx            # Global root layout with fonts & providers
│   ├── globals.css           # Tailwind v4 theme & quiet luxury utilities
│   ├── sitemap.ts            # Dynamic SEO sitemap generator
│   └── robots.ts             # Search engine crawling rules
│
├── components/
│   ├── storefront/           # Header, Footer, AnnouncementBar, HeroVideo, ProductCard, CartDrawer, SearchDialog, etc.
│   └── admin/                # AdminShell, ProductFormClient, OrderStatusBadge, OrderStatusSelector, etc.
│
├── contexts/
│   ├── CartContext.tsx       # Persistent shopping cart with optimistic updates
│   └── WishlistContext.tsx   # Persistent client wishlist
│
├── config/
│   └── site.ts               # Brand constants, navigation, color definitions, status enums
│
├── lib/
│   ├── queries/              # Server-side Supabase query functions
│   └── utils/                # Formatting, WhatsApp URL builders, CSS merging
│
├── types/
│   └── database.ts           # Complete TypeScript interfaces for all schema entities
│
├── utils/supabase/
│   ├── server.ts             # SSR cookie-safe Supabase client
│   ├── client.ts             # Browser client with Supabase public keys
│   └── middleware.ts         # Session refreshment & auth guard helper
│
└── supabase/migrations/
    └── 001_initial.sql       # 25 relational tables, RLS policies, trigger functions, indexes
```

---

## 3. Data Flow & Security Model

1. **Server-Side Rendering & ISR**: Public pages fetch directly from Supabase via `lib/queries/index.ts` using the SSR client. High-traffic pages utilize ISR (`revalidate = 3600`) for near-instant response times.
2. **Server-Side Role Guarding**: The middleware and admin layout enforce `profiles.role === 'admin'` checks via authenticated Supabase session tokens, preventing unauthorized dashboard access.
3. **Row-Level Security (RLS)**: Public users only have read permissions on `status = 'published'` products and active collections/settings. All writes, modifications, and order updates require an admin profile role.
4. **WhatsApp Ordering Engine**: The platform generates customized direct WhatsApp message payloads with garment size, colour, and product slug, allowing customers to communicate directly with concierge stylists.
