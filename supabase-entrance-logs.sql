-- ============================================
-- ENTRANCE LOGS TABLE
-- ============================================
-- Τρέξε αυτό το SQL στο Supabase SQL Editor
-- https://supabase.com/dashboard/project/[YOUR_PROJECT]/sql

-- Create entrance_logs table
CREATE TABLE IF NOT EXISTS public.entrance_logs (
  id BIGSERIAL PRIMARY KEY,
  member_id BIGINT NOT NULL,
  member_name TEXT NOT NULL,
  member_phone TEXT NOT NULL,
  member_status TEXT NOT NULL CHECK (member_status IN ('active', 'expiring_soon', 'expired')),
  validation_status TEXT NOT NULL CHECK (validation_status IN ('valid', 'invalid', 'expiring_soon')),
  validation_message TEXT NOT NULL,
  entrance_type TEXT NOT NULL CHECK (entrance_type IN ('qr_scan', 'manual')),
  timestamp TIMESTAMPTZ DEFAULT NOW(),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_entrance_logs_member_id ON public.entrance_logs(member_id);
CREATE INDEX IF NOT EXISTS idx_entrance_logs_timestamp ON public.entrance_logs(timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_entrance_logs_validation_status ON public.entrance_logs(validation_status);

-- Enable Row Level Security (optional - adjust based on your needs)
ALTER TABLE public.entrance_logs ENABLE ROW LEVEL SECURITY;

-- Create policy to allow all operations (adjust based on your security needs)
CREATE POLICY "Allow all operations on entrance_logs" ON public.entrance_logs
  FOR ALL
  USING (true)
  WITH CHECK (true);

