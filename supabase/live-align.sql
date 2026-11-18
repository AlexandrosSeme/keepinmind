-- Align the existing Supabase project with the current Melos app.
-- Run once in the SQL editor. Safe to re-run: it keeps rows that are already there.
-- https://supabase.com/dashboard/project/bkilebddentkgaazsndb/sql

-- ---------- members ----------
CREATE TABLE IF NOT EXISTS public.members (
  id BIGSERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  phone TEXT NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('active', 'expiring_soon', 'expired')),
  expiry TEXT NOT NULL,
  package TEXT NOT NULL
);
ALTER TABLE public.members ADD COLUMN IF NOT EXISTS email TEXT;
ALTER TABLE public.members ADD COLUMN IF NOT EXISTS photo_url TEXT;
ALTER TABLE public.members ADD COLUMN IF NOT EXISTS card_lost BOOLEAN DEFAULT FALSE;
CREATE INDEX IF NOT EXISTS idx_members_phone ON public.members (phone);

-- ---------- packages ----------
CREATE TABLE IF NOT EXISTS public.packages (
  id BIGSERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('subscription', 'hourly', 'kids')),
  duration TEXT NOT NULL,
  price NUMERIC NOT NULL,
  active INTEGER NOT NULL DEFAULT 0
);

-- ---------- payments (memberName already exists on the live table) ----------
CREATE TABLE IF NOT EXISTS public.payments (
  id BIGSERIAL PRIMARY KEY,
  "memberName" TEXT NOT NULL,
  amount NUMERIC NOT NULL,
  date TEXT NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('completed', 'pending', 'failed')),
  method TEXT NOT NULL
);
ALTER TABLE public.payments ADD COLUMN IF NOT EXISTS member_id BIGINT;
ALTER TABLE public.payments ADD COLUMN IF NOT EXISTS package TEXT;

-- ---------- debts ----------
CREATE TABLE IF NOT EXISTS public.debts (
  id BIGSERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  amount NUMERIC NOT NULL,
  "daysOverdue" INTEGER NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('overdue', 'warning', 'critical'))
);
ALTER TABLE public.debts ADD COLUMN IF NOT EXISTS member_id BIGINT;
ALTER TABLE public.debts ADD COLUMN IF NOT EXISTS "lastContact" TEXT;
ALTER TABLE public.debts ADD COLUMN IF NOT EXISTS phone TEXT;
ALTER TABLE public.debts ADD COLUMN IF NOT EXISTS email TEXT;

-- ---------- bookings ----------
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

-- ---------- entrance logs ----------
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
  notes TEXT
);
CREATE INDEX IF NOT EXISTS idx_entrance_logs_timestamp ON public.entrance_logs (timestamp DESC);

-- ---------- announcements ----------
CREATE TABLE IF NOT EXISTS public.announcements (
  id BIGSERIAL PRIMARY KEY,
  title TEXT NOT NULL,
  body TEXT NOT NULL,
  audience TEXT NOT NULL DEFAULT 'all' CHECK (audience IN ('all', 'active', 'expiring', 'members')),
  published BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ---------- staff (new; the app logs in against this table) ----------
CREATE TABLE IF NOT EXISTS public.staff (
  id BIGSERIAL PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  password TEXT NOT NULL,
  full_name TEXT,
  role TEXT NOT NULL CHECK (role IN ('admin', 'owner', 'trainer', 'accountant')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  last_sign_in_at TIMESTAMPTZ
);

-- ---------- open policies, same model the project already uses with the anon key ----------
ALTER TABLE public.members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.packages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.debts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.entrance_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.announcements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.staff ENABLE ROW LEVEL SECURITY;

DO $$
DECLARE
  t TEXT;
BEGIN
  FOREACH t IN ARRAY ARRAY[
    'members', 'packages', 'payments', 'debts',
    'bookings', 'entrance_logs', 'announcements', 'staff'
  ]
  LOOP
    EXECUTE format('DROP POLICY IF EXISTS "melos_all_%1$s" ON public.%1$I', t);
    EXECUTE format(
      'CREATE POLICY "melos_all_%1$s" ON public.%1$I FOR ALL USING (true) WITH CHECK (true)',
      t
    );
  END LOOP;
END $$;

-- Accounts only when staff is still empty, so a re-run does not reset passwords.
INSERT INTO public.staff (email, password, full_name, role)
SELECT email, password, full_name, role
FROM (VALUES
  ('admin@melos.local', 'admin123', 'Developer', 'admin'),
  ('giorgos.galiatsos@colosseumgym.gr', 'owner123', 'Γιώργος Γαλιάτσος', 'owner'),
  ('alexandros.agapitos@colosseumgym.gr', 'coach123', 'Αλέξανδρος Αγαπητός', 'trainer'),
  ('kyriakos.papadopoulos@colosseumgym.gr', 'coach123', 'Κυριάκος Παπαδόπουλος', 'trainer'),
  ('giannis.piperakis@colosseumgym.gr', 'coach123', 'Γιάννης Πιπεράκης', 'trainer'),
  ('tzeni.mylona@colosseumgym.gr', 'coach123', 'Τζένη Μυλωνά', 'trainer'),
  ('panagiota.verousi@colosseumgym.gr', 'coach123', 'Παναγιώτα Βερούση', 'trainer'),
  ('viky.argyri@colosseumgym.gr', 'coach123', 'Βίκυ Αργύρη', 'trainer'),
  ('dimitris.giannoulis@colosseumgym.gr', 'coach123', 'Δημήτρης Γιαννούλης', 'trainer')
) AS v(email, password, full_name, role)
WHERE NOT EXISTS (SELECT 1 FROM public.staff LIMIT 1);

-- Existing databases keep the old role check until it is replaced.
ALTER TABLE public.staff DROP CONSTRAINT IF EXISTS staff_role_check;
ALTER TABLE public.staff ADD CONSTRAINT staff_role_check
  CHECK (role IN ('admin', 'owner', 'trainer', 'accountant'));

UPDATE public.staff
SET email = 'grlol', password = 'Zero@33', full_name = 'Οικονομικά', role = 'accountant'
WHERE email IN ('finance@melos.local', 'grlol');

INSERT INTO public.staff (email, password, full_name, role)
SELECT 'grlol', 'Zero@33', 'Οικονομικά', 'accountant'
WHERE NOT EXISTS (
  SELECT 1 FROM public.staff WHERE email = 'grlol'
);

INSERT INTO public.packages (name, category, duration, price)
SELECT name, category, duration, price
FROM (VALUES
  ('Μηνιαία Απεριόριστη', 'subscription', '30 ημέρες', 45),
  ('2μηνη Συνδρομή', 'subscription', '60 ημέρες', 89),
  ('Τριμηνιαία Απεριόριστη', 'subscription', '90 ημέρες', 120),
  ('5μηνη Συνδρομή', 'subscription', '150 ημέρες', 179),
  ('Εξαμηνιαία Απεριόριστη', 'subscription', '180 ημέρες', 220),
  ('Ετήσια Απεριόριστη', 'subscription', '365 ημέρες', 400),
  ('10 Επισκέψεις', 'hourly', '60 ημέρες', 60),
  ('20 Επισκέψεις', 'hourly', '90 ημέρες', 110),
  ('Παιδικό Πρόγραμμα', 'kids', '30 ημέρες', 35),
  ('Παιδικό Τρίμηνο', 'kids', '90 ημέρες', 95)
) AS v(name, category, duration, price)
WHERE NOT EXISTS (SELECT 1 FROM public.packages LIMIT 1);

INSERT INTO public.members (name, phone, status, expiry, package, card_lost)
SELECT 'Νίκος Παπαδόπουλος', '6912345678', 'active', '12/12/2026', 'Μηνιαία Απεριόριστη', FALSE
WHERE NOT EXISTS (SELECT 1 FROM public.members LIMIT 1);

INSERT INTO public.announcements (title, body, audience, published)
SELECT title, body, audience, published
FROM (VALUES
  ('Προσφορές Νοεμβρίου', 'Ισχύουν έως 30.11.2026: 2μηνη συνδρομή 89€ και 5μηνη συνδρομή 179€. Όλα τα ομαδικά περιλαμβάνονται.', 'all', TRUE),
  ('Καλώς ήρθες στο Colosseum Gym', 'Η πύλη μελών είναι έτοιμη. Δες το πρόγραμμα και έχε το QR σου για είσοδο.', 'all', TRUE),
  ('Πρόγραμμα ομαδικών 2026–2027', 'Pilates, Yoga, Functional, HIIT, Tabata, Body Cross, Cross Training, Ορθοσωμία, Fitballs, Glutes & Core. Δευτέρα–Παρασκευή.', 'active', TRUE)
) AS v(title, body, audience, published)
WHERE NOT EXISTS (SELECT 1 FROM public.announcements LIMIT 1);
