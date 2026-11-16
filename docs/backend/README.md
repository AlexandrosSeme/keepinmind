# Melos Gym Manager — Προδιαγραφές backend (Laravel)

Το frontend τρέχει σήμερα πάνω σε ένα τοπικό JSON API (json-server). Αυτό το έγγραφο περιγράφει **τι ακριβώς
χρειάζεται** από ένα πραγματικό backend ώστε να το αντικαταστήσει.

| Αρχείο | Περιεχόμενο |
|---|---|
| [schema.json](./schema.json) | JSON Schema (draft 2020-12) όλων των αντικειμένων — τύποι, enums, υποχρεωτικά πεδία |
| [examples.json](./examples.json) | Ένα πραγματικό παράδειγμα JSON για κάθε αντικείμενο, request/response |
| Αυτό το README | Endpoints, query params, κανόνες ρόλων, προτεινόμενο σχήμα βάσης |

> Τα ονόματα πεδίων στο JSON είναι αυτά που περιμένει **σήμερα** το frontend (μείγμα camelCase / snake_case).
> Στη βάση μπορούν να είναι snake_case· η μετατροπή γίνεται στα Laravel API Resources (βλ. §6).

---

## 1. Οντότητες

| Οντότητα | Endpoint | Όγκος (Colosseum) | Σημείωση |
|---|---|---|---|
| Member (μέλος) | `/members` | ~500 | `id` = κωδικός στην κάρτα QR/barcode |
| Package (πακέτο) | `/packages` | ~8 | |
| Payment (πληρωμή) | `/payments` | ~2.600/έτος | μία ανά ανανέωση |
| Debt (οφειλή) | `/debts` | ~40 | = απλήρωτες πληρωμές |
| Booking (κράτηση/μάθημα) | `/bookings` | ~800 ανά 3 εβδομάδες | βλ. §1.5 |
| EntranceLog (είσοδος) | `/entrance_logs` | **~300/ημέρα** | insert-only, χρειάζεται index σε `timestamp` |
| Announcement (ανακοίνωση) | `/announcements` | λίγες | |
| StaffUser (προσωπικό) | `/staff` | ~10 | login προσωπικού |
| Settings (ρυθμίσεις) | — | 1 | σήμερα στο browser, πρέπει να πάει στον server |

### 1.1 Member
| Πεδίο | Τύπος | Υποχρ. | Περιγραφή |
|---|---|---|---|
| `id` | integer | ✔ | |
| `name` | string | ✔ | Ονοματεπώνυμο |
| `phone` | string (10 ψηφία) | ✔ | **Μοναδικό** — login στην πύλη μέλους |
| `email` | string | | |
| `status` | `active` \| `expiring_soon` \| `expired` | ✔ | active > 14 ημ. πριν τη λήξη, expiring_soon 0–14, expired μετά |
| `expiry` | string `DD/MM/YYYY` | ✔ | Λήξη συνδρομής |
| `package` | string | ✔ | Όνομα πακέτου (Package.name) |
| `photo_url` | string | | URL φωτογραφίας |
| `card_lost` | boolean | | Ακυρωμένη κάρτα → η είσοδος απορρίπτεται |

### 1.2 Package
| Πεδίο | Τύπος | Υποχρ. | Περιγραφή |
|---|---|---|---|
| `id` | integer | ✔ | |
| `name` | string | ✔ | π.χ. «Μηνιαία Απεριόριστη» |
| `category` | `subscription` \| `hourly` \| `kids` | ✔ | |
| `duration` | string | ✔ | π.χ. «30 ημέρες» (το frontend διαβάζει τον αριθμό) |
| `price` | number (EUR) | ✔ | |

Τα «ενεργά μέλη ανά πακέτο» **δεν αποθηκεύονται** — υπολογίζονται από τα μέλη.

### 1.3 Payment
| Πεδίο | Τύπος | Υποχρ. | Περιγραφή |
|---|---|---|---|
| `id` | integer | ✔ | |
| `memberId` | integer | (✔) | FK μέλους — να γίνει υποχρεωτικό |
| `memberName` | string | ✔ | Όνομα τη στιγμή της πληρωμής |
| `package` | string | | Πακέτο που ανανεώθηκε |
| `amount` | number (EUR) | ✔ | |
| `date` | string `DD/MM/YYYY` | ✔ | |
| `status` | `completed` \| `pending` \| `failed` | ✔ | |
| `method` | `Μετρητα` \| `Καρτα` \| `Τραπεζικη Μεταφορα` \| `IRIS` \| `Αλλο` | ✔ | Τιμές-κλειδιά (χωρίς τόνους) |

### 1.4 Debt
| Πεδίο | Τύπος | Υποχρ. | Περιγραφή |
|---|---|---|---|
| `id` | integer | ✔ | |
| `memberId` | integer | (✔) | FK μέλους |
| `name` | string | ✔ | Όνομα μέλους |
| `amount` | number | ✔ | |
| `daysOverdue` | integer | ✔ | **Υπολογίζεται** από την ημερομηνία οφειλής (όχι αποθηκευμένο) |
| `status` | `overdue` \| `warning` \| `critical` | ✔ | 1–9 / 10–24 / 25+ ημέρες — υπολογίζεται |
| `lastContact` | string `DD/MM/YYYY` | | Τελευταία επικοινωνία |
| `phone`, `email` | string | | |

Κανόνας: **κάθε οφειλή αντιστοιχεί σε πληρωμή `pending`/`failed` χωρίς επιτυχή επανάληψη.** Όταν πληρωθεί, η οφειλή κλείνει.

### 1.5 Booking
Σήμερα ένας πίνακας κρατά **και τα μαθήματα και τις συμμετοχές**:
- γραμμή με `memberId = 0`, `memberName = "Γενικη Ταξη"` → το ίδιο το μάθημα (χωρητικότητα, γυμναστής)
- γραμμές με `memberId > 0` και ίδιο `title` + `startTime` → οι κρατήσεις μελών σε αυτό
- `personal_training` / `appointment` → μία γραμμή ανά ραντεβού

| Πεδίο | Τύπος | Υποχρ. | Περιγραφή |
|---|---|---|---|
| `id` | integer | ✔ | |
| `memberId` | integer | ✔ | 0 = γραμμή μαθήματος |
| `memberName`, `memberPhone` | string | ✔ / | |
| `title` | string | ✔ | π.χ. «Pilates», «Personal Training» |
| `description`, `notes` | string | | |
| `type` | `class` \| `personal_training` \| `appointment` \| `event` | ✔ | |
| `startTime`, `endTime` | ISO 8601 UTC | ✔ | |
| `status` | `confirmed` \| `pending` \| `cancelled` \| `completed` | ✔ | |
| `instructor` | string | | **Μικρό όνομα** γυμναστή, όπως στο πρόγραμμα (π.χ. «Τζένη») |
| `maxParticipants` | integer | | Χωρητικότητα |
| `currentParticipants` | integer | | Υπολογίζεται |
| `color` | `#rrggbb` | | |
| `created_at`, `updated_at` | ISO 8601 | | |

Προτείνεται διαχωρισμός σε `class_sessions` + `bookings` (βλ. §5) — το API μπορεί να επιστρέφει την ίδια επίπεδη μορφή.

### 1.6 EntranceLog
| Πεδίο | Τύπος | Περιγραφή |
|---|---|---|
| `id`, `memberId` | integer | |
| `memberName`, `memberPhone` | string | |
| `memberStatus` | MemberStatus | Κατάσταση τη στιγμή της εισόδου |
| `validationStatus` | `valid` \| `invalid` \| `expiring_soon` | `invalid` = απορρίφθηκε |
| `validationMessage` | string | π.χ. «Ενεργή Συνδρομή», «Ληγμένη Συνδρομή», «Κάρτα Ακυρωμένη» |
| `entranceType` | `qr_scan` \| `manual` | |
| `timestamp` | ISO 8601 UTC | |
| `notes` | string | |

### 1.7 Announcement
`id`, `title`, `body`, `audience` (`all` \| `active` \| `expiring` \| `members`), `published` (boolean), `created_at` (ISO).

### 1.8 StaffUser
`id`, `email` (μοναδικό, πεζά), `fullName`, `role` (`admin` \| `owner` \| `trainer`), `createdAt`, `lastSignInAt` (ISO ή null).
Το `password` **ποτέ** στο response· μόνο στο create/update και αποθηκεύεται hashed (bcrypt).

### 1.9 Settings
Gym info, αυτόματες ειδοποιήσεις, SMS/Email credentials, ρυθμός αποστολής — βλ. `Settings` στο [schema.json](./schema.json).
Τα SMS/Email credentials επιστρέφονται **μόνο σε admin**.

---

## 2. Endpoints

Όλες οι συλλογές: `GET /{collection}`, `GET /{collection}/{id}`, `POST /{collection}`, `PATCH /{collection}/{id}`, `DELETE /{collection}/{id}`.
`POST`/`PATCH` επιστρέφουν το πλήρες αντικείμενο. Τα lists επιστρέφουν **σκέτο JSON array**.

### 2.1 Query parameters που χρησιμοποιεί το frontend
| Παράμετρος | Πού | Σημασία |
|---|---|---|
| `_sort=<field>&_order=asc\|desc` | members, payments, debts, packages, announcements, entrance_logs | Ταξινόμηση |
| `_limit=<n>` | entrance_logs | Μέγιστο πλήθος |
| `timestamp_gte=<ISO>` / `timestamp_lte=<ISO>` | entrance_logs | Εύρος χρόνου (dashboards: τελευταίες 28 ημ. + σήμερα κάθε 30″) |
| `memberId=<id>` | bookings, entrance_logs | Φίλτρο ανά μέλος |
| `published=true` | announcements | Μόνο δημοσιευμένες |
| `phone=<phone>` | members | Αναζήτηση μέλους (σελίδα QR) |
| `email=<email>` | staff | (σήμερα για login — βλ. §3) |

Header `X-Total-Count` στο `GET /{collection}?_limit=1` → πλήθος εγγραφών (admin dashboard).

### 2.2 Ειδικές ενέργειες (σήμερα γίνονται στο frontend, πρέπει να γίνουν στον server)
| Endpoint | Ποιος | Τι κάνει |
|---|---|---|
| `POST /auth/login` `{email, password}` | δημόσιο | → `{token, user}` (Sanctum). Ενημερώνει `lastSignInAt` |
| `POST /auth/logout` | staff | |
| `GET /auth/me` | staff | Τρέχων χρήστης |
| `POST /auth/change-password` `{currentPassword, newPassword}` | staff | |
| `POST /member-portal/login` `{phone}` | δημόσιο | Login μέλους με τηλέφωνο → token μέλους |
| `POST /checkin` `{memberId, entranceType}` | staff | Ελέγχει μέλος (λήξη, `card_lost`) και γράφει EntranceLog → `{valid, member, message, reason}` |
| `POST /members/{id}/photo` (multipart) | staff | Ανέβασμα φωτογραφίας → `photo_url` |
| `GET/PATCH /settings` | owner/admin | SMS/Email πεδία μόνο για admin |

---

## 3. Ρόλοι & δικαιώματα (πρέπει να ελέγχονται στον server)

| Δικαίωμα | admin | owner | trainer |
|---|:-:|:-:|:-:|
| Μέλη, κρατήσεις, είσοδοι, ανακοινώσεις, check-in | ✔ | ✔ | ✔ |
| **Οικονομικά**: `/payments`, `/debts`, γράψιμο `/packages`, τιμές πακέτων | ✔ | ✔ | ✗ |
| Ρυθμίσεις γυμναστηρίου (gym info, ειδοποιήσεις) | ✔ | ✔ | ✗ |
| Ρυθμίσεις developer (SMS/Email credentials, send rate) | ✔ | ✗ | ✗ |
| Διαχείριση προσωπικού `/staff` | ✔ (όλους) | ✔ (μόνο owner & trainer) | ✗ |

Κανόνες `/staff`: κανείς δεν αλλάζει τον **δικό του** ρόλο ούτε διαγράφει τον εαυτό του· νέος κωδικός ≥ 6 χαρακτήρες.
Για trainer το `GET /packages` πρέπει να επιστρέφει πακέτα **χωρίς `price`** (ή 403 στα οικονομικά endpoints).

Μέλη (πύλη μέλους): μόνο τα **δικά τους** δεδομένα — προφίλ, κρατήσεις, οφειλές, δημοσιευμένες ανακοινώσεις, πρόγραμμα μαθημάτων.

---

## 4. Υπολογιζόμενα πεδία & κανόνες

- `Member.status` ← από `expiry` (καθημερινό job ή υπολογισμός στο read).
- `Debt.daysOverdue` / `Debt.status` ← από την ημερομηνία της απλήρωτης πληρωμής.
- `Booking.currentParticipants` ← πλήθος μη ακυρωμένων κρατήσεων του μαθήματος.
- Λήξεις 14 ημερών, ενεργά μέλη ανά πακέτο, μηνιαία έσοδα, πρόβλεψη ανανεώσεων, ποσοστό ανανέωσης: υπολογίζονται στο frontend από τα παραπάνω — δεν χρειάζονται πίνακες.
- Ωράριο: Δευ–Παρ 07:00–23:00, Σάβ 09:00–20:00, Κυρ 09:00–17:00.

---

## 5. Προτεινόμενο σχήμα βάσης (MySQL / PostgreSQL)

```text
packages        id, name, category ENUM, duration_days INT, price DECIMAL(8,2), timestamps
members         id, name, phone VARCHAR(20) UNIQUE, email NULL, package_id FK, expiry_date DATE,
                card_lost BOOL DEFAULT false, photo_path NULL, timestamps, soft deletes
payments        id, member_id FK, package_id FK NULL, amount DECIMAL(8,2), paid_on DATE,
                status ENUM(completed,pending,failed), method ENUM(...), timestamps        INDEX(paid_on)
debts           id, member_id FK, payment_id FK NULL, amount DECIMAL(8,2), due_date DATE,
                last_contact DATE NULL, resolved_at TIMESTAMP NULL, timestamps
staff_users     id, email UNIQUE, password (hash), full_name, role ENUM(admin,owner,trainer),
                last_sign_in_at NULL, timestamps                                   (Laravel `users`)
class_sessions  id, title, type ENUM, starts_at, ends_at, trainer_id FK staff_users NULL,
                max_participants INT NULL, color, description, notes, timestamps   INDEX(starts_at)
bookings        id, class_session_id FK NULL, member_id FK, status ENUM, notes, timestamps
                (personal training / ραντεβού: class_session με max_participants = 1)
entrance_logs   id, member_id FK, member_status, validation_status ENUM, validation_message,
                entrance_type ENUM, notes NULL, created_at                         INDEX(created_at), INDEX(member_id)
announcements   id, title, body TEXT, audience ENUM, published BOOL, timestamps
settings        key VARCHAR UNIQUE, value JSON   (ή ένας πίνακας μίας γραμμής)
```

Σημειώσεις:
- Οι πληρωμές/οφειλές συνδέονται με **`member_id`**, όχι με όνομα.
- Τα ονόματα μέλους/πακέτου στα responses (`memberName`, `package`) βγαίνουν μέσω relations στα Resources.
- `entrance_logs` μεγαλώνει ~110.000 γραμμές/έτος → index στο `created_at`.

---

## 6. Συμβατότητα με το frontend

Ώστε να αλλάξει μόνο το base URL (`VITE_API_URL`):
1. **Laravel API Resources** που βγάζουν τα πεδία με τα ονόματα του [schema.json](./schema.json)
   (π.χ. `expiry_date` → `expiry` ως `DD/MM/YYYY`, `paid_on` → `date`, `starts_at` → `startTime`).
2. Υποστήριξη των query params του §2.1 (ή αντιστοίχιση σε Spatie Query Builder — αλλάζουμε τα ονόματα στο frontend σε ένα σημείο).
3. Επίπεδα arrays στα lists (όχι `{ data: [...] }`), ή το λέμε και προσαρμόζουμε τον client.
4. Σφάλματα με HTTP status (401/403/404/422) και το default Laravel validation body.
5. `Authorization: Bearer <token>` σε κάθε request μετά το login (Sanctum).

Αν προτιμάτε **ISO ημερομηνίες** (`YYYY-MM-DD`) αντί για `DD/MM/YYYY`, ή snake_case παντού, ενημερώστε μας — η προσαρμογή
στο frontend είναι μικρή και προτιμότερη μακροπρόθεσμα.
