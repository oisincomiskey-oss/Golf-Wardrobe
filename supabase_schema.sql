-- ===================================================
-- SUPABASE RLS & PERMISSION FIX FOR PRODUCTS TABLE
-- Run this script in your Supabase SQL Editor
-- ===================================================

-- 1. Ensure the 'products' table exists with all required column definitions
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

-- 2. Grant schema and table permissions to anon, authenticated, and service_role
GRANT USAGE ON SCHEMA public TO anon, authenticated, service_role;
GRANT ALL ON TABLE public.products TO anon, authenticated, service_role;

-- 3. Enable Row Level Security (RLS) on public.products
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;

-- 4. Clean up any existing RLS policies
DROP POLICY IF EXISTS "Allow public read access" ON public.products;
DROP POLICY IF EXISTS "Allow public write access" ON public.products;
DROP POLICY IF EXISTS "Allow anon read" ON public.products;
DROP POLICY IF EXISTS "Allow anon insert" ON public.products;
DROP POLICY IF EXISTS "Allow anon update" ON public.products;
DROP POLICY IF EXISTS "Allow anon delete" ON public.products;
DROP POLICY IF EXISTS "Allow all access to products" ON public.products;
DROP POLICY IF EXISTS "Enable read access for all users" ON public.products;
DROP POLICY IF EXISTS "Enable insert access for all users" ON public.products;
DROP POLICY IF EXISTS "Enable update access for all users" ON public.products;
DROP POLICY IF EXISTS "Enable delete access for all users" ON public.products;

-- 5. Create explicit RLS Policies for SELECT, INSERT, UPDATE, DELETE

-- Policy 1: SELECT (Storefront & Admin can read products)
CREATE POLICY "Enable read access for all users"
ON public.products
FOR SELECT
TO anon, authenticated, service_role
USING (true);

-- Policy 2: INSERT (Admin can create products)
CREATE POLICY "Enable insert access for all users"
ON public.products
FOR INSERT
TO anon, authenticated, service_role
WITH CHECK (true);

-- Policy 3: UPDATE (Admin can edit products)
CREATE POLICY "Enable update access for all users"
ON public.products
FOR UPDATE
TO anon, authenticated, service_role
USING (true)
WITH CHECK (true);

-- Policy 4: DELETE (Admin can delete products)
CREATE POLICY "Enable delete access for all users"
ON public.products
FOR DELETE
TO anon, authenticated, service_role
USING (true);

-- 6. Enable Supabase Realtime for products table (Optional)
ALTER PUBLICATION supabase_realtime ADD TABLE public.products;
