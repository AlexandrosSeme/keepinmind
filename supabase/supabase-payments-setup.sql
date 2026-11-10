-- Payments table for KeepInMind CRM
-- Run this in the Supabase SQL editor if the table does not exist yet.

CREATE TABLE IF NOT EXISTS public.payments (
  id BIGSERIAL PRIMARY KEY,
  "memberName" TEXT NOT NULL,
  amount NUMERIC NOT NULL,
  date TEXT NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('completed', 'pending', 'failed')),
  method TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow public read" ON public.payments;
DROP POLICY IF EXISTS "Allow public insert" ON public.payments;
DROP POLICY IF EXISTS "Allow public update" ON public.payments;
DROP POLICY IF EXISTS "Allow public delete" ON public.payments;

CREATE POLICY "Allow public read" ON public.payments FOR SELECT USING (true);
CREATE POLICY "Allow public insert" ON public.payments FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update" ON public.payments FOR UPDATE USING (true);
CREATE POLICY "Allow public delete" ON public.payments FOR DELETE USING (true);
