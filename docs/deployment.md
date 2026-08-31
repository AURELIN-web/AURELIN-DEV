# AURELIN & CO. — Production Deployment Guide

## 1. Prerequisites
- **Node.js**: v20+ / v22+
- **Package Manager**: `pnpm`
- **Supabase Project**: Active Supabase project with database & storage buckets enabled
- **Vercel Account**: For hosting with edge caching and serverless Next.js runtime

---

## 2. Environment Variables Configuration

Set the following variables in `.env.local` (for local development) and in your **Vercel Project Settings > Environment Variables**:

```ini
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-supabase-service-role-key

# Site & Production URL
NEXT_PUBLIC_SITE_URL=https://aurelinco.com

# Node Environment
NODE_ENV=production
```

---

## 3. Database & Storage Initialization

1. **Execute SQL Migration**:
   - In your Supabase Dashboard, open **SQL Editor**.
   - Copy the entire contents of `supabase/migrations/001_initial.sql`.
   - Run the script to create all 25 tables, triggers, and RLS policies.

2. **Verify Storage Buckets**:
   - The migration automatically creates and configures the following public storage buckets:
     - `products`
     - `hero`
     - `collections`
     - `homepage`
     - `journal`
     - `brand`
     - `banners`

3. **Create Admin User**:
   - Sign up via `/register` or in Supabase Auth.
   - Run the following SQL query in Supabase SQL Editor to elevate your account to `admin`:
   ```sql
   UPDATE public.profiles
   SET role = 'admin'
   WHERE email = 'your-admin-email@aurelinco.com';
   ```

---

## 4. Vercel Deployment

1. **Connect Repository**:
   - Import your repository into Vercel.
   - Framework Preset: **Next.js**
   - Root Directory: `./`
   - Build Command: `next build`
   - Install Command: `pnpm install`

2. **Add Custom Domain**:
   - Go to **Project Settings > Domains**.
   - Add `aurelinco.com` and `www.aurelinco.com`.
   - Configure DNS A & CNAME records as instructed by Vercel.

3. **Verify Deployment**:
   - Test storefront: `https://aurelinco.com`
   - Test admin login: `https://aurelinco.com/admin/login`
   - Test dynamic sitemap: `https://aurelinco.com/sitemap.xml`
   - Test robots file: `https://aurelinco.com/robots.txt`
