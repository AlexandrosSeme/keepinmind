-- ============================================
-- SUPABASE PHOTO SETUP SCRIPT
-- ============================================
-- Τρέξε αυτό το SQL στο Supabase SQL Editor
-- https://supabase.com/dashboard/project/[YOUR_PROJECT]/sql

-- ============================================
-- 1. ADD PHOTO_URL COLUMN TO MEMBERS TABLE
-- ============================================

ALTER TABLE public.members 
ADD COLUMN IF NOT EXISTS photo_url TEXT;

-- ============================================
-- 2. CREATE STORAGE BUCKET FOR MEMBER PHOTOS
-- ============================================
-- ΣΗΜΕΙΩΣΗ: Αυτό πρέπει να γίνει από το Supabase Dashboard
-- Storage > New bucket > Name: "member-photos" > Public: Yes
-- 
-- Εναλλακτικά, μπορείτε να το κάνετε από το SQL Editor:
-- (Αλλά συνήθως χρειάζεται να γίνει από το Dashboard)

-- ============================================
-- 3. CREATE STORAGE POLICIES (if bucket is created)
-- ============================================
-- Αυτές οι policies επιτρέπουν public read και public upload
-- (γιατί χρησιμοποιείς anon key, όχι authenticated users)
-- 
-- Για public read (όλοι μπορούν να βλέπουν τις φωτογραφίες):
CREATE POLICY IF NOT EXISTS "Public Access Read" ON storage.objects 
FOR SELECT TO public 
USING (bucket_id = 'member-photos');

-- Για public upload (όλοι μπορούν να ανεβάζουν φωτογραφίες):
CREATE POLICY IF NOT EXISTS "Public Access Upload" ON storage.objects 
FOR INSERT TO public 
WITH CHECK (bucket_id = 'member-photos');

-- Για public delete (όλοι μπορούν να διαγράψουν φωτογραφίες):
CREATE POLICY IF NOT EXISTS "Public Access Delete" ON storage.objects 
FOR DELETE TO public 
USING (bucket_id = 'member-photos');

-- ============================================
-- INSTRUCTIONS:
-- ============================================
-- 1. Τρέξε το ALTER TABLE statement παραπάνω
-- 2. Πήγαινε στο Supabase Dashboard > Storage
-- 3. Δημιούργησε ένα νέο bucket με όνομα "member-photos"
-- 4. Κάνε το bucket Public (για να μπορούν να φορτώνονται οι φωτογραφίες)
-- 5. (Προαιρετικό) Ρύθμισε storage policies από το Dashboard > Storage > Policies

