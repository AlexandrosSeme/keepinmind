-- ============================================
-- BOOKINGS TABLE SETUP
-- ============================================
-- Τρέξε αυτό το SQL στο Supabase SQL Editor
-- https://supabase.com/dashboard/project/[YOUR_PROJECT]/sql

-- Create bookings table
CREATE TABLE IF NOT EXISTS public.bookings (
  id BIGSERIAL PRIMARY KEY,
  member_id BIGINT NOT NULL,
  member_name TEXT NOT NULL,
  member_phone TEXT,
  title TEXT NOT NULL,
  description TEXT,
  type TEXT NOT NULL CHECK (type IN ('class', 'personal_training', 'appointment', 'event')),
  start_time TIMESTAMPTZ NOT NULL,
  end_time TIMESTAMPTZ NOT NULL,
  status TEXT NOT NULL DEFAULT 'confirmed' CHECK (status IN ('confirmed', 'pending', 'cancelled', 'completed')),
  instructor TEXT,
  max_participants INTEGER,
  current_participants INTEGER DEFAULT 0,
  color TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for faster queries
CREATE INDEX IF NOT EXISTS idx_bookings_member_id ON public.bookings(member_id);
CREATE INDEX IF NOT EXISTS idx_bookings_start_time ON public.bookings(start_time);
CREATE INDEX IF NOT EXISTS idx_bookings_end_time ON public.bookings(end_time);
CREATE INDEX IF NOT EXISTS idx_bookings_status ON public.bookings(status);
CREATE INDEX IF NOT EXISTS idx_bookings_type ON public.bookings(type);

-- Create index for date range queries
CREATE INDEX IF NOT EXISTS idx_bookings_date_range ON public.bookings USING GIST (tstzrange(start_time, end_time));

-- Enable Row Level Security
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;

-- Create policy to allow all operations (adjust based on your security needs)
CREATE POLICY "Allow all operations on bookings" ON public.bookings
  FOR ALL
  USING (true)
  WITH CHECK (true);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger to automatically update updated_at
CREATE TRIGGER update_bookings_updated_at BEFORE UPDATE ON public.bookings
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

