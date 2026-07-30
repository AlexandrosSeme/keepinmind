-- ============================================
-- INSERT DUMMY BARCODE USERS
-- ============================================
-- Τρέξε αυτό το SQL στο Supabase SQL Editor
-- https://supabase.com/dashboard/project/[YOUR_PROJECT]/sql
--
-- Προσθέτει 5 dummy users με barcodes (IDs: 1001-1005)
-- για testing του barcode scanner
-- ============================================

-- Διαγραφή αν υπάρχουν ήδη (για να μπορείς να το τρέξεις πολλές φορές)
DELETE FROM public.members WHERE id IN (1001, 1002, 1003, 1004, 1005);

-- Ενημέρωση του sequence για να μην υπάρχει conflict με τα IDs που ορίσαμε
-- (Αυτό εξασφαλίζει ότι τα επόμενα auto-generated IDs θα είναι > 1005)
SELECT setval('public.members_id_seq', GREATEST(1005, (SELECT MAX(id) FROM public.members)), true);

-- Εισαγωγή dummy users με barcodes
-- Χρησιμοποιούμε OVERRIDING SYSTEM VALUE για να ορίσουμε συγκεκριμένα IDs
INSERT INTO public.members (id, name, phone, status, expiry, package, created_at, updated_at)
OVERRIDING SYSTEM VALUE
VALUES
  (
    1001,
    'Αλέξανδρος Βασιλείου',
    '6911111111',
    'active',
    '15/12/2025',
    'Μηνιαία Απεριόριστη',
    NOW(),
    NOW()
  ),
  (
    1002,
    'Σοφία Νικολάου',
    '6922222222',
    'active',
    '20/12/2025',
    'Ετήσια',
    NOW(),
    NOW()
  ),
  (
    1003,
    'Αντώνης Πετρίδης',
    '6933333333',
    'expiring_soon',
    '05/11/2025',
    'Μηνιαία Απεριόριστη',
    NOW(),
    NOW()
  ),
  (
    1004,
    'Χριστίνα Μακρή',
    '6944444444',
    'active',
    '25/12/2025',
    'Ετήσια',
    NOW(),
    NOW()
  ),
  (
    1005,
    'Θεόδωρος Καραμανλής',
    '6955555555',
    'expired',
    '10/10/2025',
    'Μηνιαία Απεριόριστη',
    NOW(),
    NOW()
  )
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  phone = EXCLUDED.phone,
  status = EXCLUDED.status,
  expiry = EXCLUDED.expiry,
  package = EXCLUDED.package,
  updated_at = NOW();

-- Επαλήθευση ότι εισήχθησαν σωστά
SELECT id, name, phone, status, expiry, package 
FROM public.members 
WHERE id IN (1001, 1002, 1003, 1004, 1005)
ORDER BY id;

