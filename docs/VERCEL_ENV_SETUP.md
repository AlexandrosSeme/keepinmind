# 🔧 Vercel Environment Variables Setup

## Προσθήκη Supabase Environment Variables στο Vercel

### Μέθοδος 1: Vercel Dashboard (Εύκολη)

1. Πηγαίνετε στο: https://vercel.com/dashboard
2. Επιλέξτε το project σας
3. Πηγαίνετε στο: **Settings** → **Environment Variables**
4. Προσθέστε τα εξής:

   **Variable 1:**
   - **Name:** `VITE_SUPABASE_URL`
   - **Value:** `https://bkilebddentkgaazsndb.supabase.co`
   - **Environment:** Επιλέξτε **Production**, **Preview**, **Development** (ή όλα)

   **Variable 2:**
   - **Name:** `VITE_SUPABASE_ANON_KEY`
   - **Value:** `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJraWxlYmRkZW50a2dhYXpzbmRiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjYzOTY1MDksImV4cCI6MjA4MTk3MjUwOX0.f7NHAfOqkBMOQN2Yr24FgO58lFo62GWNHBsU4IdlXKE`
   - **Environment:** Επιλέξτε **Production**, **Preview**, **Development** (ή όλα)

5. Κάντε **Save**
6. Κάντε **Redeploy** το project:
   - Πηγαίνετε στο **Deployments**
   - Κάντε κλικ στο **...** (menu) στο τελευταίο deployment
   - Επιλέξτε **Redeploy**

### Μέθοδος 2: Vercel CLI

Αν έχετε Vercel CLI εγκατεστημένο:

```bash
# Login (αν δεν είστε ήδη logged in)
vercel login

# Προσθήκη variables
echo "https://bkilebddentkgaazsndb.supabase.co" | vercel env add VITE_SUPABASE_URL production
echo "https://bkilebddentkgaazsndb.supabase.co" | vercel env add VITE_SUPABASE_URL preview
echo "https://bkilebddentkgaazsndb.supabase.co" | vercel env add VITE_SUPABASE_URL development

echo "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJraWxlYmRkZW50a2dhYXpzbmRiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjYzOTY1MDksImV4cCI6MjA4MTk3MjUwOX0.f7NHAfOqkBMOQN2Yr24FgO58lFo62GWNHBsU4IdlXKE" | vercel env add VITE_SUPABASE_ANON_KEY production
echo "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJraWxlYmRkZW50a2dhYXpzbmRiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjYzOTY1MDksImV4cCI6MjA4MTk3MjUwOX0.f7NHAfOqkBMOQN2Yr24FgO58lFo62GWNHBsU4IdlXKE" | vercel env add VITE_SUPABASE_ANON_KEY preview
echo "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJraWxlYmRkZW50a2dhYXpzbmRiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjYzOTY1MDksImV4cCI6MjA4MTk3MjUwOX0.f7NHAfOqkBMOQN2Yr24FgO58lFo62GWNHBsU4IdlXKE" | vercel env add VITE_SUPABASE_ANON_KEY development
```

### ⚠️ Σημαντικό

- Μετά την προσθήκη των variables, **πρέπει να κάνετε redeploy** το project
- Τα `VITE_*` variables είναι διαθέσιμα στο frontend (Vite)
- Βεβαιωθείτε ότι επιλέξατε **Production**, **Preview**, **Development** (ή όλα)

### ✅ Μετά το Redeploy

Μετά το redeploy, τα δεδομένα θα φορτώνονται από το Supabase στο Vercel deployment!

