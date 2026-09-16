-- ==============================================================================
-- 018 BOKONE BOPHIRIMA • SUPABASE DATABASE SCHEMA & SEED DATA
-- Luxury South African Knitwear & Streetwear Store (018 Klerksdorp, North West)
-- ==============================================================================

-- 1. Enable Required Extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. Drop existing tables if re-running or migrating to guarantee clean state
DROP TABLE IF EXISTS public.products CASCADE;
DROP TABLE IF EXISTS public.orders CASCADE;
DROP TABLE IF EXISTS public.community_photos CASCADE;
DROP TABLE IF EXISTS public.store_settings CASCADE;

-- 3. PRODUCTS TABLE
CREATE TABLE public.products (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    category TEXT NOT NULL,
    price NUMERIC(10, 2) NOT NULL,
    original_price NUMERIC(10, 2),
    rating NUMERIC(3, 2) DEFAULT 5.0,
    reviews_count INTEGER DEFAULT 1,
    sizes TEXT[] DEFAULT ARRAY['S', 'M', 'L', 'XL'],
    colors TEXT[] DEFAULT ARRAY['Jet Black', '018 Orange'],
    description TEXT,
    features TEXT[] DEFAULT ARRAY['Engineered in Klerksdorp, North West', '100% Local Knitwear Heritage'],
    image TEXT NOT NULL,
    secondary_images TEXT[] DEFAULT ARRAY[]::TEXT[],
    in_stock BOOLEAN DEFAULT true,
    stock_quantity INTEGER DEFAULT 15,
    sku TEXT UNIQUE,
    tag TEXT,
    is_new BOOLEAN DEFAULT false,
    is_bestseller BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. ORDERS TABLE (Fulfillment & PayFast checkout)
CREATE TABLE public.orders (
    id TEXT PRIMARY KEY,
    order_number TEXT UNIQUE NOT NULL,
    customer JSONB NOT NULL,
    items JSONB NOT NULL,
    subtotal NUMERIC(10, 2) NOT NULL,
    shipping_fee NUMERIC(10, 2) DEFAULT 0,
    discount NUMERIC(10, 2) DEFAULT 0,
    total NUMERIC(10, 2) NOT NULL,
    delivery_method TEXT NOT NULL DEFAULT 'courier_guy',
    status TEXT NOT NULL DEFAULT 'paid',
    payment_method TEXT NOT NULL DEFAULT 'payfast',
    payfast_data JSONB,
    tracking_number TEXT,
    courier_name TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. COMMUNITY STREET LOOKS TABLE (UGC & Looks)
CREATE TABLE public.community_photos (
    id TEXT PRIMARY KEY,
    user_name TEXT NOT NULL,
    handle TEXT NOT NULL,
    location TEXT DEFAULT 'Klerksdorp, North West',
    caption TEXT,
    image_url TEXT NOT NULL,
    product_tagged TEXT,
    likes INTEGER DEFAULT 0,
    source TEXT DEFAULT 'camera',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. STORE SETTINGS TABLE
CREATE TABLE public.store_settings (
    id TEXT PRIMARY KEY DEFAULT 'global_config',
    store_name TEXT DEFAULT '018 Bokone Bophirima',
    theme_mode TEXT DEFAULT 'dark',
    free_shipping_threshold NUMERIC(10, 2) DEFAULT 999.00,
    whatsapp_number TEXT DEFAULT '+27 64 062 9602',
    studio_location TEXT DEFAULT 'Flamwood / Wilkoppies, Klerksdorp, North West, 2571',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. PERFORMANCE INDEXES
CREATE INDEX idx_products_category ON public.products(category);
CREATE INDEX idx_products_price ON public.products(price);
CREATE INDEX idx_products_instock ON public.products(in_stock);
CREATE INDEX idx_orders_ordernumber ON public.orders(order_number);
CREATE INDEX idx_orders_status ON public.orders(status);
CREATE INDEX idx_community_created ON public.community_photos(created_at DESC);

-- 8. ROW LEVEL SECURITY (RLS) POLICIES
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.community_photos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.store_settings ENABLE ROW LEVEL SECURITY;

-- Products Policies
CREATE POLICY "Public Read Products" ON public.products FOR SELECT USING (true);
CREATE POLICY "Public Insert Products" ON public.products FOR INSERT WITH CHECK (true);
CREATE POLICY "Public Update Products" ON public.products FOR UPDATE USING (true);
CREATE POLICY "Public Delete Products" ON public.products FOR DELETE USING (true);

-- Orders Policies
CREATE POLICY "Public Read Orders" ON public.orders FOR SELECT USING (true);
CREATE POLICY "Public Insert Orders" ON public.orders FOR INSERT WITH CHECK (true);
CREATE POLICY "Public Update Orders" ON public.orders FOR UPDATE USING (true);
CREATE POLICY "Public Delete Orders" ON public.orders FOR DELETE USING (true);

-- Community Photos Policies
CREATE POLICY "Public Read Community" ON public.community_photos FOR SELECT USING (true);
CREATE POLICY "Public Insert Community" ON public.community_photos FOR INSERT WITH CHECK (true);
CREATE POLICY "Public Update Community" ON public.community_photos FOR UPDATE USING (true);
CREATE POLICY "Public Delete Community" ON public.community_photos FOR DELETE USING (true);

-- Settings Policies
CREATE POLICY "Public Read Settings" ON public.store_settings FOR SELECT USING (true);
CREATE POLICY "Public Update Settings" ON public.store_settings FOR UPDATE USING (true);

-- 9. SEED INITIAL PRODUCTS (018 BOKONE BOPHIRIMA COLLECTION)
INSERT INTO public.products (
    id, title, category, price, original_price, rating, reviews_count, sizes, colors, description, features, image, secondary_images, in_stock, stock_quantity, sku, tag, is_new, is_bestseller, created_at
) VALUES
(
    'prod-01',
    '018 Signature Two-Tone Trucker Cap',
    'Caps',
    420,
    NULL,
    5.0,
    38,
    ARRAY['1 SIZE (Adjustable Strap)'],
    ARRAY['Desert Sand / Ice Cream Pastel', 'Black / 018 Orange', 'All Obsidian'],
    'Signature 018 Bokone high-crown trucker cap featuring 3D puff embroidery, breathable mesh backing, and custom interior seam taping.',
    ARRAY['3D Bokone Monogram Embroidery', 'Breathable Poly-Mesh Backing', 'Adjustable Snapback Closure', 'Moisture-Wicking Inner Headband'],
    'https://images.unsplash.com/photo-1588850561407-ed78c282e89b?auto=format&fit=crop&w=800&q=80',
    ARRAY['https://images.unsplash.com/photo-1575428652377-a2d80e2277fc?auto=format&fit=crop&w=800&q=80'],
    true,
    24,
    '018-CAP-TRK-01',
    'NEW DROP',
    true,
    false,
    NOW() - INTERVAL '1 day'
),
(
    'prod-02',
    '018 Heritage Jacquard Knit Polo',
    'Luxury Knitwear',
    950,
    1150,
    5.0,
    54,
    ARRAY['S', 'M', 'L', 'XL', '2XL'],
    ARRAY['018 Bokone Multi-Stripe', 'Charcoal / Studio Tan', 'Jet Black Monochrome'],
    'South African bespoke knit polo crafted on 14-gauge machinery in the North West. Features signature 018 collar tipping and custom branded horn buttons.',
    ARRAY['100% Breathable Combed Cotton Yarn', 'Ribbed Jacquard Cuffs & Hem', 'Custom 018 Horn Buttons', 'Anti-Pilling Finish'],
    'https://images.unsplash.com/photo-1625910513413-7d08c5c56641?auto=format&fit=crop&w=800&q=80',
    ARRAY['https://images.unsplash.com/photo-1618354691373-d851c5c3a990?auto=format&fit=crop&w=800&q=80'],
    true,
    18,
    '018-KNT-POLO-02',
    'BESTSELLER',
    false,
    true,
    NOW() - INTERVAL '2 days'
),
(
    'prod-03',
    'Bokone Oversized Heavyweight Hoodie (480 GSM)',
    'Hoodies & Sweats',
    950,
    NULL,
    4.9,
    42,
    ARRAY['XS', 'S', 'M', 'L', 'XL', 'XXL'],
    ARRAY['Black / Monogram Print', 'North West Clay Orange', 'Raw Oatmeal Heather'],
    'Ultra-heavy 480 GSM French Terry cotton hoodie with dropped shoulders, double-layered hood without drawstrings, and tonal high-density chest print.',
    ARRAY['480 GSM 100% South African Cotton', 'Double-Lined Structured Hood', 'Seamless Kangaroo Pocket', 'Pre-Shrunk & Garment Dyed'],
    'https://images.unsplash.com/photo-1556905055-8f358a7a47b2?auto=format&fit=crop&w=800&q=80',
    ARRAY['https://images.unsplash.com/photo-1509967419530-da38b4704bc6?auto=format&fit=crop&w=800&q=80'],
    true,
    12,
    '018-HOD-OVZ-03',
    'BESTSELLER',
    false,
    true,
    NOW() - INTERVAL '3 days'
),
(
    'prod-04',
    'The 018 Weekend Triple Set (Knit Polo + Cap + Crossbody Bag)',
    'Combos',
    1750,
    2450,
    5.0,
    67,
    ARRAY['S (Cap 1-Size)', 'M (Cap 1-Size)', 'L (Cap 1-Size)', 'XL (Cap 1-Size)', '2XL (Cap 1-Size)'],
    ARRAY['Signature Bokone Palette', 'All Obsidian Blackout', 'Desert Sand & Charcoal'],
    'The ultimate North West statement bundle. Includes the 018 Jacquard Knit Polo, Signature Trucker Cap, and Heavy Cordura Utility Crossbody Bag.',
    ARRAY['Complete Coordinated 018 Streetwear Fit', 'Instant R700 Bundle Saving', 'Includes Free Express Courier Delivery', 'Exclusive 018 Tote Packaging'],
    'https://images.unsplash.com/photo-1509967419530-da38b4704bc6?auto=format&fit=crop&w=800&q=80',
    ARRAY['https://images.unsplash.com/photo-1588850561407-ed78c282e89b?auto=format&fit=crop&w=800&q=80'],
    true,
    8,
    '018-CMB-WKND-04',
    'SAVE R700',
    true,
    true,
    NOW() - INTERVAL '4 days'
);

-- 10. SEED COMMUNITY STREETWEAR LOOKS
INSERT INTO public.community_photos (id, user_name, handle, location, caption, image_url, product_tagged, likes, source, created_at)
VALUES
(
    'comm-01',
    'Kagiso Moloi',
    '@kagiso_018',
    'Flamwood, Klerksdorp',
    'Wearing what we dial. North West to the world 🇿🇦',
    'https://images.unsplash.com/photo-1509967419530-da38b4704bc6?auto=format&fit=crop&w=800&q=80',
    '018 Signature Two-Tone Trucker Cap',
    148,
    'curated',
    NOW() - INTERVAL '2 days'
),
(
    'comm-02',
    'Lerato Khumalo',
    '@lerato_k',
    'Rosebank, Johannesburg',
    '018 Knitwear quality hits completely different in person.',
    'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=800&q=80',
    '018 Heritage Jacquard Knit Polo',
    212,
    'curated',
    NOW() - INTERVAL '1 day'
);

-- 11. SEED DEFAULT STORE CONFIG
INSERT INTO public.store_settings (id, store_name, theme_mode, free_shipping_threshold)
VALUES ('global_config', '018 Bokone Bophirima', 'dark', 999.00);
