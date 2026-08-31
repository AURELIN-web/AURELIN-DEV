# AURELIN & CO. — Admin Panel Manual & Operations Guide

## 1. Access & Security
- **Admin Login Route**: `/admin/login`
- **Guarded Path**: `/admin/*`
- **Authentication**: Requires a valid user account with `profiles.role = 'admin'` set in the database.
- **Middleware Guard**: Any unauthenticated access or unauthorized role is automatically redirected to `/admin/login?error=unauthorized`.

---

## 2. Admin Modules Overview

### 1. Dashboard (`/admin/dashboard`)
- **Key Metrics**: Real-time revenue sum, total order volume, active published product count, client count, and WhatsApp enquiry counts.
- **Recent Orders Table**: Quick overview of the latest 5 transactions with customer names and fulfillment badges.
- **Low Stock Tracker**: Real-time alerts for any SKUs falling below their defined threshold.

### 2. Products Management (`/admin/products`, `/admin/products/new`, `/admin/products/[id]`)
- **Catalog View**: Search, preview in new tab, status indicators (`published`, `draft`, `archived`), and stock levels.
- **Product Editor**:
  - Full details (Name, slug, short description, rich copy, SKU).
  - Pricing (Regular price, compare-at price, sale price).
  - Flags (`is_featured`, `is_new_arrival`, `is_best_seller`).
  - Garment specifications (Material, fabric, fit, care instructions).
  - Multi-Variant Matrix: Manage individual sizes (`XS` through `XXL`), colours, hex codes, custom variant pricing, and stock levels.
  - Image Uploader: Direct-to-Supabase storage uploads with automatic public URL generation.
  - SEO fields (Meta title, description, keywords).

### 3. Categories & Collections (`/admin/categories`, `/admin/collections`)
- Create and edit product categories and editorial collections (e.g. Linen Essentials, Signature Shirts).
- Upload hero banners and assign SEO meta fields.

### 4. Orders & Fulfillment (`/admin/orders`, `/admin/orders/[id]`)
- Comprehensive list of orders with fulfillment status and payment status filters.
- Detailed view with customer contact information, complete line items, and delivery address.
- Direct **"WhatsApp Customer"** button to start a pre-filled chat with the customer about their specific order number.
- Order & payment status updater.

### 5. Hero Editor (`/admin/hero`)
- Upload desktop and mobile MP4 video files directly to Supabase storage.
- Upload poster fallback image.
- Configure headline, eyebrow, subtext, and dual CTA buttons.
- Real-time overlay strength slider.

### 6. Homepage CMS (`/admin/homepage`)
- Reorder, rename, and toggle visibility of all homepage sections without code changes.

### 7. WhatsApp Settings & Lead Log (`/admin/whatsapp`)
- Set the concierge WhatsApp phone number and default country code.
- Customize the automated greeting and pre-filled message template.
- Review recent customer WhatsApp clicks and garment enquiry logs.

### 8. Media Library (`/admin/media`)
- Browse, upload, copy public URLs, and delete assets across all Supabase storage buckets (`products`, `hero`, `collections`, `homepage`, `journal`, `brand`).

### 9. Journal CMS (`/admin/journal`)
- Write and publish editorial articles, essays, and style guides.

### 10. Site Settings (`/admin/settings`)
- Custom announcement bar banner text, background/text colour pickers, and toggle switches.
- Footer brand descriptions.
