-- ESOLS Technologies Mini Marketplace Seed Data
-- Reference Product: Prague Divan Bed – Cream Naples

-- 1. Insert Category
INSERT INTO public.categories (id, name, slug)
VALUES 
  ('11111111-1111-1111-1111-111111111111', 'Furniture > Divan Beds', 'furniture-divan-beds')
ON CONFLICT (slug) DO NOTHING;

-- 2. Insert Profiles for Test Accounts (Pass: DemoPassword123!)
-- Buyer, Seller, Admin
INSERT INTO public.profiles (id, email, full_name, role)
VALUES
  ('22222222-2222-2222-2222-222222222222', 'buyer@demo.com', 'Sarah Buyer', 'buyer'),
  ('33333333-3333-3333-3333-333333333333', 'seller@demo.com', 'Demo Seller Store', 'seller'),
  ('44444444-4444-4444-4444-444444444444', 'admin@demo.com', 'System Admin', 'admin')
ON CONFLICT (id) DO UPDATE SET role = EXCLUDED.role;

-- 3. Insert Seller Record
INSERT INTO public.sellers (id, profile_id, store_name, description, status)
VALUES
  ('55555555-5555-5555-5555-555555555555', '33333333-3333-3333-3333-333333333333', 'Demo Seller', 'Handcrafted luxury divan beds and custom bedroom furniture.', 'approved')
ON CONFLICT (id) DO NOTHING;

-- 4. Insert Reference Product
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

-- 5. Insert Gallery Images (At least 5)
INSERT INTO public.product_images (id, product_id, url, alt_text, display_order, associated_colour)
VALUES
  ('77777777-1111-1111-1111-111111111111', '66666666-6666-6666-6666-666666666666', 'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=1200&q=80', 'Prague Divan Bed – Front Master Bedroom Angle', 1, 'Cream Naples'),
  ('77777777-2222-2222-2222-222222222222', '66666666-6666-6666-6666-666666666666', 'https://images.unsplash.com/photo-1540518614846-7ede433c4ef4?auto=format&fit=crop&w=1200&q=80', 'Prague Divan Bed – Headboard Detail and Naples Texture', 2, 'Cream Naples'),
  ('77777777-3333-3333-3333-333333333333', '66666666-6666-6666-6666-666666666666', 'https://images.unsplash.com/photo-1595526114035-0d45ed16cfbf?auto=format&fit=crop&w=1200&q=80', 'Prague Divan Bed – Storage Drawer Configuration', 3, 'Seal Grey Naples'),
  ('77777777-4444-4444-4444-444444444444', '66666666-6666-6666-6666-666666666666', 'https://images.unsplash.com/photo-1617325247661-675ab4b64ae2?auto=format&fit=crop&w=1200&q=80', 'Prague Divan Bed – Bedroom Setting View', 4, 'Slate Grey Naples'),
  ('77777777-5555-5555-5555-555555555555', '66666666-6666-6666-6666-666666666666', 'https://images.unsplash.com/photo-1582582621959-48d27397dc69?auto=format&fit=crop&w=1200&q=80', 'Prague Divan Bed – Close Up Fabric Weave and Stitching', 5, 'Black Naples')
ON CONFLICT (id) DO NOTHING;

-- 6. Insert Variation Groups
INSERT INTO public.variation_groups (id, product_id, name, type, is_required, display_order)
VALUES
  ('88888888-1111-1111-1111-111111111111', '66666666-6666-6666-6666-666666666666', 'Colour', 'swatch', true, 1),
  ('88888888-2222-2222-2222-222222222222', '66666666-6666-6666-6666-666666666666', 'Size', 'radio', true, 2),
  ('88888888-3333-3333-3333-333333333333', '66666666-6666-6666-6666-666666666666', 'Storage', 'radio', true, 3),
  ('88888888-4444-4444-4444-444444444444', '66666666-6666-6666-6666-666666666666', 'Headboard', 'radio', true, 4),
  ('88888888-5555-5555-5555-555555555555', '66666666-6666-6666-6666-666666666666', 'Base', 'radio', true, 5),
  ('88888888-6666-6666-6666-666666666666', '66666666-6666-6666-6666-666666666666', 'Assembly', 'checkbox', false, 6)
ON CONFLICT (id) DO NOTHING;

-- 7. Insert Variation Options
-- Group 1: Colours (6-8 swatches)
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

-- Group 2: Sizes
INSERT INTO public.variation_options (group_id, label, value, extra_price, is_default, display_order)
VALUES
  ('88888888-2222-2222-2222-222222222222', 'Small Single 2FT6', 'small-single-2ft6', 90.00, true, 1),
  ('88888888-2222-2222-2222-222222222222', 'Single 3FT', 'single-3ft', 95.00, false, 2),
  ('88888888-2222-2222-2222-222222222222', 'Small Double 4FT', 'small-double-4ft', 100.00, false, 3),
  ('88888888-2222-2222-2222-222222222222', 'Double 4FT6', 'double-4ft6', 110.00, false, 4),
  ('88888888-2222-2222-2222-222222222222', 'King 5FT', 'king-5ft', 125.00, false, 5),
  ('88888888-2222-2222-2222-222222222222', 'Super King 6FT', 'super-king-6ft', 150.00, false, 6);

-- Group 3: Storage
INSERT INTO public.variation_options (group_id, label, value, extra_price, is_default, display_order)
VALUES
  ('88888888-3333-3333-3333-333333333333', 'No Storage', 'no-storage', 0.00, true, 1),
  ('88888888-3333-3333-3333-333333333333', '2 Drawers Left Side', '2-drawers-left', 50.00, false, 2),
  ('88888888-3333-3333-3333-333333333333', '2 Drawers Right Side', '2-drawers-right', 45.00, false, 3),
  ('88888888-3333-3333-3333-333333333333', '2 Drawers Foot End', '2-drawers-foot-end', 155.00, false, 4),
  ('88888888-3333-3333-3333-333333333333', '4 Drawers', '4-drawers', 210.00, false, 5);

-- Group 4: Headboard
INSERT INTO public.variation_options (group_id, label, value, extra_price, is_default, display_order)
VALUES
  ('88888888-4444-4444-4444-444444444444', 'FREE 26" Headboard', 'free-26-headboard', 0.00, true, 1),
  ('88888888-4444-4444-4444-444444444444', '54" Floor Standing Headboard', '54-floor-standing-headboard', 10.00, false, 2);

-- Group 5: Base
INSERT INTO public.variation_options (group_id, label, value, extra_price, is_default, display_order)
VALUES
  ('88888888-5555-5555-5555-555555555555', 'Standard Base (holds 50 stone)', 'standard-base', 0.00, true, 1),
  ('88888888-5555-5555-5555-555555555555', 'Reinforced Base (holds 100 stone)', 'reinforced-base', 25.00, false, 2);

-- Group 6: Assembly
INSERT INTO public.variation_options (group_id, label, value, extra_price, is_default, display_order)
VALUES
  ('88888888-6666-6666-6666-666666666666', 'Professional Assembly', 'assembly', 39.99, false, 1);
