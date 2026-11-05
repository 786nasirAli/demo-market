-- ============================================================
-- SUPABASE RLS POLICIES: ALLOW PRODUCT CREATION & MANAGEMENT
-- Run this in Supabase SQL Editor:
-- https://supabase.com/dashboard/project/kcgekmjlyinwdqlqtlqr/sql/new
-- ============================================================

-- 1. PRODUCTS
DROP POLICY IF EXISTS "Allow public insert products" ON public.products;
CREATE POLICY "Allow public insert products" ON public.products FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Allow public update products" ON public.products;
CREATE POLICY "Allow public update products" ON public.products FOR UPDATE USING (true);

-- 2. PRODUCT IMAGES
DROP POLICY IF EXISTS "Allow public insert images" ON public.product_images;
CREATE POLICY "Allow public insert images" ON public.product_images FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Allow public update images" ON public.product_images;
CREATE POLICY "Allow public update images" ON public.product_images FOR UPDATE USING (true);

DROP POLICY IF EXISTS "Allow public delete images" ON public.product_images;
CREATE POLICY "Allow public delete images" ON public.product_images FOR DELETE USING (true);

-- 3. VARIATION GROUPS
DROP POLICY IF EXISTS "Allow public insert groups" ON public.variation_groups;
CREATE POLICY "Allow public insert groups" ON public.variation_groups FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Allow public update groups" ON public.variation_groups;
CREATE POLICY "Allow public update groups" ON public.variation_groups FOR UPDATE USING (true);

DROP POLICY IF EXISTS "Allow public delete groups" ON public.variation_groups;
CREATE POLICY "Allow public delete groups" ON public.variation_groups FOR DELETE USING (true);

-- 4. VARIATION OPTIONS
DROP POLICY IF EXISTS "Allow public insert options" ON public.variation_options;
CREATE POLICY "Allow public insert options" ON public.variation_options FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Allow public update options" ON public.variation_options;
CREATE POLICY "Allow public update options" ON public.variation_options FOR UPDATE USING (true);

DROP POLICY IF EXISTS "Allow public delete options" ON public.variation_options;
CREATE POLICY "Allow public delete options" ON public.variation_options FOR DELETE USING (true);
