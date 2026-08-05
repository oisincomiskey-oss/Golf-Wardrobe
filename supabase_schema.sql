-- ==========================================
-- SUPABASE SCHEMA FOR ECOMMERCE PRODUCTS
-- Run this script in your Supabase SQL Editor
-- ==========================================

-- 1. Create the 'products' table
CREATE TABLE IF NOT EXISTS public.products (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    price NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
    original_price NUMERIC(10, 2),
    "originalPrice" NUMERIC(10, 2),
    description TEXT,
    category TEXT DEFAULT 'Leather',
    club_fit TEXT DEFAULT 'Driver',
    "clubFit" TEXT DEFAULT 'Driver',
    allowed_club_fits JSONB DEFAULT '[]'::jsonb,
    "allowedClubFits" JSONB DEFAULT '[]'::jsonb,
    image TEXT,
    gallery JSONB DEFAULT '[]'::jsonb,
    material TEXT DEFAULT 'Genuine Leather',
    is_waterproof BOOLEAN DEFAULT true,
    "isWaterproof" BOOLEAN DEFAULT true,
    is_genuine_leather BOOLEAN DEFAULT true,
    "isGenuineLeather" BOOLEAN DEFAULT true,
    stock INTEGER DEFAULT 10,
    featured BOOLEAN DEFAULT false,
    hidden BOOLEAN DEFAULT false,
    scheduled_date TEXT,
    "scheduledDate" TEXT,
    tags JSONB DEFAULT '[]'::jsonb,
    rating NUMERIC(3, 2) DEFAULT 5.0,
    reviews_count INTEGER DEFAULT 0,
    "reviewsCount" INTEGER DEFAULT 0,
    reviews JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- 2. Enable Row Level Security (RLS)
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;

-- 3. Create RLS Policies to allow reading and writing for anon & authenticated users
DROP POLICY IF EXISTS "Allow public read access" ON public.products;
CREATE POLICY "Allow public read access"
ON public.products
FOR SELECT
USING (true);

DROP POLICY IF EXISTS "Allow public write access" ON public.products;
CREATE POLICY "Allow public write access"
ON public.products
FOR ALL
USING (true)
WITH CHECK (true);

-- 4. Enable Realtime subscriptions on products (Optional)
ALTER PUBLICATION supabase_realtime ADD TABLE public.products;
