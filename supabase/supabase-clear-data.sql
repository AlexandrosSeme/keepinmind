-- ============================================
-- CLEAR ALL DATA - Διαγραφή όλων των δεδομένων
-- ============================================
-- ΠΡΟΣΟΧΗ: Αυτό θα σβήσει ΟΛΑ τα δεδομένα από όλους τους πίνακες!
-- Τρέξε αυτό το SQL στο Supabase SQL Editor
-- https://supabase.com/dashboard/project/bkilebddentkgaazsndb/sql

-- Διαγραφή δεδομένων από όλους τους πίνακες (σε σειρά που σέβεται foreign keys αν υπάρχουν)
DELETE FROM public.upcoming_expiries;
DELETE FROM public.debts;
DELETE FROM public.members;
DELETE FROM public.packages;

-- Επαναφορά των sequences (για να ξεκινάνε τα IDs από το 1)
ALTER SEQUENCE IF EXISTS public.members_id_seq RESTART WITH 1;
ALTER SEQUENCE IF EXISTS public.debts_id_seq RESTART WITH 1;
ALTER SEQUENCE IF EXISTS public.packages_id_seq RESTART WITH 1;
ALTER SEQUENCE IF EXISTS public.upcoming_expiries_id_seq RESTART WITH 1;

-- Επιβεβαίωση ότι τα δεδομένα διαγράφηκαν
SELECT 
  'members' as table_name, COUNT(*) as remaining_rows FROM public.members
UNION ALL
SELECT 
  'debts' as table_name, COUNT(*) as remaining_rows FROM public.debts
UNION ALL
SELECT 
  'packages' as table_name, COUNT(*) as remaining_rows FROM public.packages
UNION ALL
SELECT 
  'upcoming_expiries' as table_name, COUNT(*) as remaining_rows FROM public.upcoming_expiries;

