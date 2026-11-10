-- ============================================
-- CARD LOST MIGRATION
-- ============================================
-- Προσθέτει πεδίο card_lost στον πίνακα members
-- Τρέξε αυτό το SQL στο Supabase SQL Editor
-- ============================================

-- Προσθήκη πεδίου card_lost (boolean, default false)
ALTER TABLE public.members 
ADD COLUMN IF NOT EXISTS card_lost BOOLEAN DEFAULT FALSE;

-- Ενημέρωση υπάρχοντα records να έχουν card_lost = false
UPDATE public.members 
SET card_lost = FALSE 
WHERE card_lost IS NULL;

-- Επαλήθευση
SELECT id, name, phone, status, card_lost 
FROM public.members 
LIMIT 5;

