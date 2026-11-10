-- Announcements feed for Melos member portal
-- Run in Supabase SQL Editor

CREATE TABLE IF NOT EXISTS public.announcements (
  id BIGSERIAL PRIMARY KEY,
  title TEXT NOT NULL,
  body TEXT NOT NULL,
  audience TEXT NOT NULL DEFAULT 'all'
    CHECK (audience IN ('all', 'active', 'expiring', 'members')),
  published BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.announcements ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow public read announcements" ON public.announcements;
DROP POLICY IF EXISTS "Allow public insert announcements" ON public.announcements;
DROP POLICY IF EXISTS "Allow public update announcements" ON public.announcements;
DROP POLICY IF EXISTS "Allow public delete announcements" ON public.announcements;

CREATE POLICY "Allow public read announcements"
  ON public.announcements FOR SELECT USING (true);
CREATE POLICY "Allow public insert announcements"
  ON public.announcements FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update announcements"
  ON public.announcements FOR UPDATE USING (true);
CREATE POLICY "Allow public delete announcements"
  ON public.announcements FOR DELETE USING (true);

-- Sample posts (skip if you already have data)
INSERT INTO public.announcements (title, body, audience, published)
SELECT * FROM (VALUES
  (
    'Καλως ηρθες στο Melos',
    'Η πυλη μελων ειναι ετοιμη. Δες το προγραμμα, κλεισε θεση σε ταξεις και εχε παντα το QR σου για εισοδο.',
    'all',
    true
  ),
  (
    'Ωραριο γυμναστηριου',
    'Δευτερα–Παρασκευη 06:00–23:00. Σαββατο 08:00–20:00. Κυριακη 09:00–14:00.',
    'all',
    true
  ),
  (
    'Νεα ομαδικα μαθηματα',
    'Απο αυτη την εβδομαδα: Boxing, Hyrox Prep και Mobility. Κλεισε θεση απο το Προγραμμα.',
    'active',
    true
  )
) AS v(title, body, audience, published)
WHERE NOT EXISTS (SELECT 1 FROM public.announcements LIMIT 1);
