-- ============================================================
-- ESOLS TECHNOLOGIES MINI MARKETPLACE: COMPLETE DATABASE SETUP
-- RUN THIS ENTIRE SCRIPT IN SUPABASE SQL EDITOR:
-- https://supabase.com/dashboard/project/kcgekmjlyinwdqlqtlqr/sql/new
-- ============================================================

-- 0. ENABLE UUID EXTENSION
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. PROFILES (Extends Supabase auth.users or standalone test accounts)
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email TEXT NOT NULL UNIQUE,
    full_name TEXT,
    role TEXT NOT NULL DEFAULT 'buyer' CHECK (role IN ('buyer', 'seller', 'admin')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 2. SELLERS
CREATE TABLE IF NOT EXISTS public.sellers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    profile_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    store_name TEXT NOT NULL,
    description TEXT,
    status TEXT NOT NULL DEFAULT 'approved' CHECK (status IN ('pending', 'approved', 'suspended')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 3. CATEGORIES
CREATE TABLE IF NOT EXISTS public.categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL UNIQUE,
    slug TEXT NOT NULL UNIQUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 4. PRODUCTS
CREATE TABLE IF NOT EXISTS public.products (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    seller_id UUID REFERENCES public.sellers(id) ON DELETE CASCADE,
    category_id UUID REFERENCES public.categories(id) ON DELETE RESTRICT,
    title TEXT NOT NULL,
    slug TEXT NOT NULL,
    description TEXT,
    base_price NUMERIC(10, 2) NOT NULL CHECK (base_price >= 0),
    compare_at_price NUMERIC(10, 2) CHECK (compare_at_price >= base_price),
    status TEXT NOT NULL DEFAULT 'approved' CHECK (status IN ('pending', 'approved', 'hidden')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 5. PRODUCT IMAGES
CREATE TABLE IF NOT EXISTS public.product_images (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    product_id UUID REFERENCES public.products(id) ON DELETE CASCADE,
    url TEXT NOT NULL,
    alt_text TEXT,
    display_order INTEGER NOT NULL DEFAULT 0,
    associated_colour TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 6. VARIATION GROUPS
CREATE TABLE IF NOT EXISTS public.variation_groups (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    product_id UUID REFERENCES public.products(id) ON DELETE CASCADE,
    name TEXT NOT NULL, -- e.g. "Colour", "Size", "Storage", "Headboard", "Base", "Assembly"
    type TEXT NOT NULL DEFAULT 'radio' CHECK (type IN ('swatch', 'radio', 'checkbox')),
    is_required BOOLEAN NOT NULL DEFAULT true,
    display_order INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 7. VARIATION OPTIONS
CREATE TABLE IF NOT EXISTS public.variation_options (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    group_id UUID REFERENCES public.variation_groups(id) ON DELETE CASCADE,
    label TEXT NOT NULL,
    value TEXT NOT NULL,
    swatch_hex TEXT, -- Used for colour swatches
    extra_price NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
    is_default BOOLEAN NOT NULL DEFAULT false,
    display_order INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 8. ORDERS
CREATE TABLE IF NOT EXISTS public.orders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    buyer_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    total_amount NUMERIC(10, 2) NOT NULL CHECK (total_amount >= 0),
    status TEXT NOT NULL DEFAULT 'new' CHECK (status IN ('new', 'confirmed', 'shipped', 'delivered')),
    shipping_address JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 9. ORDER ITEMS
CREATE TABLE IF NOT EXISTS public.order_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_id UUID REFERENCES public.orders(id) ON DELETE CASCADE,
    product_id UUID REFERENCES public.products(id) ON DELETE RESTRICT,
    seller_id UUID REFERENCES public.sellers(id) ON DELETE RESTRICT,
    quantity INTEGER NOT NULL CHECK (quantity > 0),
    unit_price NUMERIC(10, 2) NOT NULL CHECK (unit_price >= 0),
    line_total NUMERIC(10, 2) NOT NULL CHECK (line_total >= 0),
    selected_configuration JSONB NOT NULL DEFAULT '{}'::jsonb,
    status TEXT NOT NULL DEFAULT 'new' CHECK (status IN ('new', 'confirmed', 'shipped', 'delivered')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 10. ROW LEVEL SECURITY (RLS)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sellers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.variation_groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.variation_options ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;

-- Permissive public read for demo marketplace browsing
DROP POLICY IF EXISTS "Allow public read categories" ON public.categories;
CREATE POLICY "Allow public read categories" ON public.categories FOR SELECT USING (true);

DROP POLICY IF EXISTS "Allow public read sellers" ON public.sellers;
CREATE POLICY "Allow public read sellers" ON public.sellers FOR SELECT USING (true);

DROP POLICY IF EXISTS "Allow public read products" ON public.products;
CREATE POLICY "Allow public read products" ON public.products FOR SELECT USING (true);

DROP POLICY IF EXISTS "Allow public read images" ON public.product_images;
CREATE POLICY "Allow public read images" ON public.product_images FOR SELECT USING (true);

DROP POLICY IF EXISTS "Allow public read groups" ON public.variation_groups;
CREATE POLICY "Allow public read groups" ON public.variation_groups FOR SELECT USING (true);

DROP POLICY IF EXISTS "Allow public read options" ON public.variation_options;
CREATE POLICY "Allow public read options" ON public.variation_options FOR SELECT USING (true);

DROP POLICY IF EXISTS "Allow public read profiles" ON public.profiles;
CREATE POLICY "Allow public read profiles" ON public.profiles FOR SELECT USING (true);

DROP POLICY IF EXISTS "Allow public insert profiles" ON public.profiles;
CREATE POLICY "Allow public insert profiles" ON public.profiles FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Allow public read orders" ON public.orders;
CREATE POLICY "Allow public read orders" ON public.orders FOR SELECT USING (true);

DROP POLICY IF EXISTS "Allow public insert orders" ON public.orders;
CREATE POLICY "Allow public insert orders" ON public.orders FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Allow public read order items" ON public.order_items;
CREATE POLICY "Allow public read order items" ON public.order_items FOR SELECT USING (true);

DROP POLICY IF EXISTS "Allow public update order items" ON public.order_items;
CREATE POLICY "Allow public update order items" ON public.order_items FOR UPDATE USING (true);

-- ============================================================
-- SEED DATA: REFERENCE PRAGUE DIVAN BED & VARIATIONS
-- ============================================================

-- A. Insert Category
INSERT INTO public.categories (id, name, slug)
VALUES 
  ('11111111-1111-1111-1111-111111111111', 'Furniture > Divan Beds', 'furniture-divan-beds')
ON CONFLICT (slug) DO NOTHING;

-- B. Insert Test Profiles
INSERT INTO public.profiles (id, email, full_name, role)
VALUES
  ('22222222-2222-2222-2222-222222222222', 'buyer@demo.com', 'Sarah Buyer', 'buyer'),
  ('33333333-3333-3333-3333-333333333333', 'seller@demo.com', 'Demo Seller Store', 'seller'),
  ('44444444-4444-4444-4444-444444444444', 'admin@demo.com', 'System Admin', 'admin')
ON CONFLICT (id) DO UPDATE SET role = EXCLUDED.role;

-- C. Insert Seller
INSERT INTO public.sellers (id, profile_id, store_name, description, status)
VALUES
  ('55555555-5555-5555-5555-555555555555', '33333333-3333-3333-3333-333333333333', 'Demo Seller', 'Handcrafted luxury divan beds and custom bedroom furniture.', 'approved')
ON CONFLICT (id) DO NOTHING;

-- D. Insert Reference Product (Prague Divan Bed – Cream Naples)
INSERT INTO public.products (id, seller_id, category_id, title, slug, description, base_price, compare_at_price, status)
VALUES (
  '66666666-6666-6666-6666-666666666666',
  '55555555-5555-5555-5555-555555555555',
  '11111111-1111-1111-1111-111111111111',
  'Prague Divan Bed – Cream Naples',
  'prague-divan-bed-cream-naples',
  'The Prague Divan Bed combines contemporary geometric craftsmanship with exceptional comfort. Upholstered in premium soft-touch Naples fabric, it features a grand padded linear headboard and optional bespoke storage drawers. Handcrafted in the UK with solid timber framing designed for enduring stability.',
  269.99,
  539.98,
  'approved'
)
ON CONFLICT (id) DO NOTHING;

-- E. Insert Gallery Images (5 Images)
INSERT INTO public.product_images (id, product_id, url, alt_text, display_order, associated_colour)
VALUES
  ('77777777-1111-1111-1111-111111111111', '66666666-6666-6666-6666-666666666666', 'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=1200&q=80', 'Prague Divan Bed – Front Master Bedroom Angle', 1, 'Cream Naples'),
  ('77777777-2222-2222-2222-222222222222', '66666666-6666-6666-6666-666666666666', 'https://images.unsplash.com/photo-1540518614846-7ede433c4ef4?auto=format&fit=crop&w=1200&q=80', 'Prague Divan Bed – Headboard Detail and Naples Texture', 2, 'Cream Naples'),
  ('77777777-3333-3333-3333-333333333333', '66666666-6666-6666-6666-666666666666', 'https://images.unsplash.com/photo-1595526114035-0d45ed16cfbf?auto=format&fit=crop&w=1200&q=80', 'Prague Divan Bed – Storage Drawer Configuration', 3, 'Seal Grey Naples'),
  ('77777777-4444-4444-4444-444444444444', '66666666-6666-6666-6666-666666666666', 'https://images.unsplash.com/photo-1617325247661-675ab4b64ae2?auto=format&fit=crop&w=1200&q=80', 'Prague Divan Bed – Bedroom Setting View', 4, 'Slate Grey Naples'),
  ('77777777-5555-5555-5555-555555555555', '66666666-6666-6666-6666-666666666666', 'https://images.unsplash.com/photo-1582582621959-48d27397dc69?auto=format&fit=crop&w=1200&q=80', 'Prague Divan Bed – Close Up Fabric Weave and Stitching', 5, 'Black Naples')
ON CONFLICT (id) DO NOTHING;

-- F. Insert Variation Groups
INSERT INTO public.variation_groups (id, product_id, name, type, is_required, display_order)
VALUES
  ('88888888-1111-1111-1111-111111111111', '66666666-6666-6666-6666-666666666666', 'Colour', 'swatch', true, 1),
  ('88888888-2222-2222-2222-222222222222', '66666666-6666-6666-6666-666666666666', 'Size', 'radio', true, 2),
  ('88888888-3333-3333-3333-333333333333', '66666666-6666-6666-6666-666666666666', 'Storage', 'radio', true, 3),
  ('88888888-4444-4444-4444-444444444444', '66666666-6666-6666-6666-666666666666', 'Headboard', 'radio', true, 4),
  ('88888888-5555-5555-5555-555555555555', '66666666-6666-6666-6666-666666666666', 'Base', 'radio', true, 5),
  ('88888888-6666-6666-6666-666666666666', '66666666-6666-6666-6666-666666666666', 'Assembly', 'checkbox', false, 6)
ON CONFLICT (id) DO NOTHING;

-- G. Insert Variation Options
-- 1. Colours (8 swatches)
INSERT INTO public.variation_options (group_id, label, value, swatch_hex, extra_price, is_default, display_order)
VALUES
  ('88888888-1111-1111-1111-111111111111', 'Cream Naples', 'cream-naples', '#F5F2EB', 0.00, true, 1),
  ('88888888-1111-1111-1111-111111111111', 'Seal Grey Naples', 'seal-grey-naples', '#7D8184', 0.00, false, 2),
  ('88888888-1111-1111-1111-111111111111', 'Slate Grey Naples', 'slate-grey-naples', '#4A4E51', 0.00, false, 3),
  ('88888888-1111-1111-1111-111111111111', 'Black Naples', 'black-naples', '#1C1C1E', 0.00, false, 4),
  ('88888888-1111-1111-1111-111111111111', 'Mink Naples', 'mink-naples', '#A89F91', 0.00, false, 5),
  ('88888888-1111-1111-1111-111111111111', 'Mauve Naples', 'mauve-naples', '#8C7A87', 0.00, false, 6),
  ('88888888-1111-1111-1111-111111111111', 'Silver Plush', 'silver-plush', '#C2C4CC', 0.00, false, 7),
  ('88888888-1111-1111-1111-111111111111', 'Coniston Blue', 'coniston-blue', '#2A455E', 0.00, false, 8);

-- 2. Sizes
INSERT INTO public.variation_options (group_id, label, value, extra_price, is_default, display_order)
VALUES
  ('88888888-2222-2222-2222-222222222222', 'Small Single 2FT6', 'small-single-2ft6', 90.00, true, 1),
  ('88888888-2222-2222-2222-222222222222', 'Single 3FT', 'single-3ft', 95.00, false, 2),
  ('88888888-2222-2222-2222-222222222222', 'Small Double 4FT', 'small-double-4ft', 100.00, false, 3),
  ('88888888-2222-2222-2222-222222222222', 'Double 4FT6', 'double-4ft6', 110.00, false, 4),
  ('88888888-2222-2222-2222-222222222222', 'King 5FT', 'king-5ft', 125.00, false, 5),
  ('88888888-2222-2222-2222-222222222222', 'Super King 6FT', 'super-king-6ft', 150.00, false, 6);

-- 3. Storage
INSERT INTO public.variation_options (group_id, label, value, extra_price, is_default, display_order)
VALUES
  ('88888888-3333-3333-3333-333333333333', 'No Storage', 'no-storage', 0.00, true, 1),
  ('88888888-3333-3333-3333-333333333333', '2 Drawers Left Side', '2-drawers-left', 50.00, false, 2),
  ('88888888-3333-3333-3333-333333333333', '2 Drawers Right Side', '2-drawers-right', 45.00, false, 3),
  ('88888888-3333-3333-3333-333333333333', '2 Drawers Foot End', '2-drawers-foot-end', 155.00, false, 4),
  ('88888888-3333-3333-3333-333333333333', '4 Drawers', '4-drawers', 210.00, false, 5);

-- 4. Headboard
INSERT INTO public.variation_options (group_id, label, value, extra_price, is_default, display_order)
VALUES
  ('88888888-4444-4444-4444-444444444444', 'FREE 26" Headboard', 'free-26-headboard', 0.00, true, 1),
  ('88888888-4444-4444-4444-444444444444', '54" Floor Standing Headboard', '54-floor-standing-headboard', 10.00, false, 2);

-- 5. Base
INSERT INTO public.variation_options (group_id, label, value, extra_price, is_default, display_order)
VALUES
  ('88888888-5555-5555-5555-555555555555', 'Standard Base (holds 50 stone)', 'standard-base', 0.00, true, 1),
  ('88888888-5555-5555-5555-555555555555', 'Reinforced Base (holds 100 stone)', 'reinforced-base', 25.00, false, 2);

-- 6. Assembly Add-on
INSERT INTO public.variation_options (group_id, label, value, extra_price, is_default, display_order)
VALUES
  ('88888888-6666-6666-6666-666666666666', 'Professional Assembly', 'assembly', 39.99, false, 1);
