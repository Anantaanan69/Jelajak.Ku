-- ==============================================================================
-- SKEMA SUPABASE (POSTGRESQL) - JELAJAH KU (BERSIH TANPA DATA DUMMY)
-- ==============================================================================

-- 1. EXTENSIONS
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 2. TABEL USERS (Autentikasi Akun)
CREATE TABLE IF NOT EXISTS public.users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    username VARCHAR(50) UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW()) NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW()) NOT NULL
);

-- Seed default user untuk testing login
INSERT INTO public.users (username, password_hash)
VALUES ('username', crypt('password', gen_salt('bf')))
ON CONFLICT (username) DO NOTHING;

-- 3. ENUM TIPE TEMPAT
DO $$ BEGIN
    CREATE TYPE place_type_enum AS ENUM ('kuliner', 'wisata');
EXCEPTION
    WHEN duplicate_object THEN NULL;
END $$;

-- 4. TABEL PLACES (Tempat Makan & Tempat Wisata - Kosong tanpa dummy)
CREATE TABLE IF NOT EXISTS public.places (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    type place_type_enum NOT NULL,
    name VARCHAR(255) NOT NULL,
    city VARCHAR(100) NOT NULL,
    location TEXT DEFAULT '',
    photos TEXT[] DEFAULT '{}',
    videos TEXT[] DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW()) NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW()) NOT NULL
);

-- 5. TABEL WISHLIST (Rencana Perjalanan Aktif - Kosong tanpa dummy)
CREATE TABLE IF NOT EXISTS public.wishlist (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    place_id UUID NOT NULL REFERENCES public.places(id) ON DELETE RESTRICT,
    departure_date DATE NOT NULL,
    notes TEXT DEFAULT '',
    completed BOOLEAN DEFAULT FALSE NOT NULL,
    created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW()) NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW()) NOT NULL
);

-- 6. TABEL HISTORY (Riwayat Selesai & Link GDrive - Kosong tanpa dummy)
CREATE TABLE IF NOT EXISTS public.history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    place_id UUID REFERENCES public.places(id) ON DELETE SET NULL,
    wishlist_id UUID REFERENCES public.wishlist(id) ON DELETE SET NULL,
    place_name VARCHAR(255) NOT NULL,
    category place_type_enum NOT NULL,
    city VARCHAR(100) NOT NULL,
    location TEXT DEFAULT '',
    departure_date DATE,
    completed_at DATE DEFAULT CURRENT_DATE NOT NULL,
    notes TEXT DEFAULT '',
    gdrive_url TEXT DEFAULT '',
    created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW()) NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW()) NOT NULL
);

-- 7. DISABLE RLS UNTUK KONEKSI LANGSUNG REST/JS
ALTER TABLE public.users DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.places DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.wishlist DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.history DISABLE ROW LEVEL SECURITY;
