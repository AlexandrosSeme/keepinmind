-- ============================================
-- SUPABASE SETUP SCRIPT
-- ============================================
-- Τρέξε αυτό το SQL στο Supabase SQL Editor
-- https://supabase.com/dashboard/project/bkilebddentkgaazsndb/sql

-- ============================================
-- 1. CREATE TABLES
-- ============================================

-- Members table
CREATE TABLE IF NOT EXISTS public.members (
  id BIGSERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  phone TEXT NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('active', 'expiring_soon', 'expired')),
  expiry TEXT NOT NULL,
  package TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Debts table
CREATE TABLE IF NOT EXISTS public.debts (
  id BIGSERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  amount NUMERIC NOT NULL,
  "daysOverdue" INTEGER NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('overdue', 'warning', 'critical')),
  "lastContact" TEXT,
  phone TEXT,
  email TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Packages table
CREATE TABLE IF NOT EXISTS public.packages (
  id BIGSERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('subscription', 'hourly', 'kids')),
  duration TEXT NOT NULL,
  price NUMERIC NOT NULL,
  active INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Upcoming expiries table
CREATE TABLE IF NOT EXISTS public.upcoming_expiries (
  id BIGSERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  phone TEXT NOT NULL,
  expiry TEXT NOT NULL,
  days INTEGER NOT NULL,
  package TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- 2. ENABLE ROW LEVEL SECURITY (RLS)
-- ============================================

ALTER TABLE public.members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.debts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.packages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.upcoming_expiries ENABLE ROW LEVEL SECURITY;

-- ============================================
-- 3. CREATE POLICIES (Allow public access for now)
-- ============================================
-- ΣΗΜΕΙΩΣΗ: Αυτές οι policies επιτρέπουν public read/write
-- Για production, θα πρέπει να προσθέσεις authentication

-- Members policies
CREATE POLICY "Allow public read" ON public.members FOR SELECT USING (true);
CREATE POLICY "Allow public insert" ON public.members FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update" ON public.members FOR UPDATE USING (true);
CREATE POLICY "Allow public delete" ON public.members FOR DELETE USING (true);

-- Debts policies
CREATE POLICY "Allow public read" ON public.debts FOR SELECT USING (true);
CREATE POLICY "Allow public insert" ON public.debts FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update" ON public.debts FOR UPDATE USING (true);
CREATE POLICY "Allow public delete" ON public.debts FOR DELETE USING (true);

-- Packages policies
CREATE POLICY "Allow public read" ON public.packages FOR SELECT USING (true);
CREATE POLICY "Allow public insert" ON public.packages FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update" ON public.packages FOR UPDATE USING (true);
CREATE POLICY "Allow public delete" ON public.packages FOR DELETE USING (true);

-- Upcoming expiries policies
CREATE POLICY "Allow public read" ON public.upcoming_expiries FOR SELECT USING (true);
CREATE POLICY "Allow public insert" ON public.upcoming_expiries FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update" ON public.upcoming_expiries FOR UPDATE USING (true);
CREATE POLICY "Allow public delete" ON public.upcoming_expiries FOR DELETE USING (true);

-- ============================================
-- 4. OPTIONAL: Add some sample data
-- ============================================

-- INSERT INTO public.members (name, phone, status, expiry, package) VALUES
-- ('Νίκος Παπαδόπουλος', '6912345678', 'active', '15/11/2025', 'Μηνιαία Απεριόριστη'),
-- ('Μαρία Γεωργίου', '6923456789', 'expiring_soon', '20/10/2025', 'Ετήσια');

-- INSERT INTO public.packages (name, category, duration, price, active) VALUES
-- ('Μηνιαία Απεριόριστη', 'subscription', '30 ημέρες', 45, 0),
-- ('Ετήσια Απεριόριστη', 'subscription', '365 ημέρες', 450, 0);

