# Χαρακτηριστικό: Διαχείριση Χαμένων Καρτών (Card Lost Feature)

## Περιγραφή
Προστέθηκε λειτουργικότητα για τη διαχείριση χαμένων/ακυρωμένων καρτών. Όταν μια κάρτα σημειωθεί ως χαμένη, δεν μπορεί να χρησιμοποιηθεί για είσοδο στο γυμναστήριο.

## Αλλαγές

### 1. Βάση Δεδομένων
- **Αρχείο**: `supabase-card-lost-migration.sql`
- Προστέθηκε πεδίο `card_lost` (boolean, default: false) στον πίνακα `members`
- **Οδηγίες**: Τρέξε το SQL script στο Supabase SQL Editor

### 2. TypeScript Types
- **Αρχείο**: `src/types/index.ts`
- Προστέθηκε `card_lost?: boolean` στο interface `Member`

### 3. Επικύρωση QR Codes
- **Αρχεία**: 
  - `src/components/QRScanner.tsx`
  - `src/components/GlobalQRScanner.tsx`
- Προστέθηκε έλεγχος: Αν `card_lost === true`, το QR code απορρίπτεται με μήνυμα "Κάρτα Ακυρωμένη"

### 4. UI για Admin
- **Αρχείο**: `src/components/Members.tsx`
- Προστέθηκαν:
  - Badge "Κάρτα Ακυρωμένη" όταν `card_lost === true`
  - Button για ακύρωση/ενεργοποίηση κάρτας
  - Button για εκτύπωση νέας κάρτας (όταν η κάρτα είναι ακυρωμένη)
  - Υποστήριξη και για desktop και mobile view

### 5. Εκτύπωση Νέας Κάρτας
- **Αρχείο**: `src/components/PrintAllQRCodes.tsx`
- Προστέθηκε υποστήριξη query parameter `?id=123` για να εκτυπώνεται αυτόματα η κάρτα ενός συγκεκριμένου μέλους

## Χρήση

### Για Admin:

1. **Σημείωση Κάρτας ως Χαμένη**:
   - Πηγαίνετε στο "Μέλη" → βρείτε το μέλος
   - Κάντε κλικ στο εικονίδιο κάρτας (CreditCard icon) για να ακυρώσετε την κάρτα

2. **Ενεργοποίηση Κάρτας**:
   - Αν μια κάρτα είναι ακυρωμένη, εμφανίζεται πράσινο button για ενεργοποίηση

3. **Εκτύπωση Νέας Κάρτας**:
   - Όταν μια κάρτα είναι ακυρωμένη, εμφανίζεται κίτρινο button (Printer icon)
   - Κάντε κλικ για να εκτυπώσετε νέα κάρτα
   - Η σελίδα εκτύπωσης θα ανοίξει με το συγκεκριμένο μέλος ήδη επιλεγμένο

### Για Χρήστες:
- Αν κάποιος προσπαθήσει να χρησιμοποιήσει μια ακυρωμένη κάρτα, θα δει μήνυμα:
  - "Κάρτα Ακυρωμένη"
  - "Η κάρτα έχει σημειωθεί ως χαμένη/ακυρωμένη. Παρακαλώ επικοινωνήστε με τον διαχειριστή."

## SQL Migration

Τρέξε το παρακάτω SQL στο Supabase:

```sql
-- Προσθήκη πεδίου card_lost
ALTER TABLE public.members 
ADD COLUMN IF NOT EXISTS card_lost BOOLEAN DEFAULT FALSE;

-- Ενημέρωση υπάρχοντα records
UPDATE public.members 
SET card_lost = FALSE 
WHERE card_lost IS NULL;
```

## Σημειώσεις

- Το πεδίο `card_lost` είναι optional (μπορεί να είναι undefined/null)
- Η default τιμή στη βάση είναι `FALSE`
- Όταν δημιουργείται νέο μέλος, η κάρτα είναι ενεργή από default
- Η επικύρωση ελέγχει μόνο αν `card_lost === true` (strict equality)

