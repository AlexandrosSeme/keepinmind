// Generates db/seed.json with realistic, linked demo data around today's date.
// Usage: npm run seed   (then `npm run api:reset` to load it into db/db.json)
//
// Deterministic: a fixed PRNG seed gives the same data for the same day.
import { writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";

const OUT = fileURLToPath(new URL("../db/seed.json", import.meta.url));
const COUNTS = { members: 500 };

// ---------- helpers ----------
let state = 20261111;
const rand = () => {
  // mulberry32
  state = (state + 0x6d2b79f5) | 0;
  let t = Math.imul(state ^ (state >>> 15), 1 | state);
  t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
};
const int = (min, max) => Math.floor(rand() * (max - min + 1)) + min;
const pick = (arr) => arr[Math.floor(rand() * arr.length)];
const chance = (p) => rand() < p;
const weighted = (entries) => {
  const total = entries.reduce((s, [, w]) => s + w, 0);
  let r = rand() * total;
  for (const [value, w] of entries) if ((r -= w) < 0) return value;
  return entries[entries.length - 1][0];
};

const DAY = 86400000;
const today = new Date();
today.setHours(0, 0, 0, 0);
const addDays = (date, days) => new Date(date.getTime() + days * DAY);
const at = (date, hour, minute = 0) => {
  const d = new Date(date);
  d.setHours(hour, minute, 0, 0);
  return d;
};
const pad = (n) => String(n).padStart(2, "0");
/** DD/MM/YYYY — the format the app stores for expiry/payment dates. */
const gr = (d) => `${pad(d.getDate())}/${pad(d.getMonth() + 1)}/${d.getFullYear()}`;
const daysBetween = (a, b) => Math.round((b.getTime() - a.getTime()) / DAY);

const LATIN = {
  α: "a", ά: "a", β: "v", γ: "g", δ: "d", ε: "e", έ: "e", ζ: "z", η: "i", ή: "i",
  θ: "th", ι: "i", ί: "i", ϊ: "i", ΐ: "i", κ: "k", λ: "l", μ: "m", ν: "n", ξ: "x",
  ο: "o", ό: "o", π: "p", ρ: "r", σ: "s", ς: "s", τ: "t", υ: "y", ύ: "y", ϋ: "y",
  φ: "f", χ: "ch", ψ: "ps", ω: "o", ώ: "o",
};
const latin = (s) =>
  [...s.toLowerCase().replace(/ου|ού/g, "ou").replace(/ευ|εύ/g, "ef").replace(/αυ|αύ/g, "af")]
    .map((c) => LATIN[c] ?? c)
    .join("");

// ---------- names ----------
const MALE = ["Νίκος", "Γιώργος", "Δημήτρης", "Κώστας", "Γιάννης", "Παναγιώτης", "Βασίλης", "Χρήστος", "Αθανάσιος", "Μιχάλης", "Ευάγγελος", "Σπύρος", "Αντώνης", "Ηλίας", "Θοδωρής", "Άγγελος", "Στέλιος", "Πέτρος", "Αλέξανδρος", "Μάριος", "Λευτέρης", "Φίλιππος", "Στάθης", "Άρης"];
const FEMALE = ["Μαρία", "Ελένη", "Κατερίνα", "Βασιλική", "Σοφία", "Αγγελική", "Γεωργία", "Δήμητρα", "Ευαγγελία", "Ιωάννα", "Χριστίνα", "Αναστασία", "Παναγιώτα", "Δέσποινα", "Ειρήνη", "Αθηνά", "Νεφέλη", "Μυρτώ", "Φωτεινή", "Ζωή", "Αλεξάνδρα", "Κωνσταντίνα", "Στέλλα", "Λυδία"];
const SURNAMES = [
  ["Παπαδόπουλος", "Παπαδοπούλου"], ["Γεωργίου", "Γεωργίου"], ["Οικονόμου", "Οικονόμου"],
  ["Δημητρίου", "Δημητρίου"], ["Νικολάου", "Νικολάου"], ["Κωνσταντίνου", "Κωνσταντίνου"],
  ["Ιωαννίδης", "Ιωαννίδου"], ["Παπαγεωργίου", "Παπαγεωργίου"], ["Βασιλείου", "Βασιλείου"],
  ["Αντωνίου", "Αντωνίου"], ["Μακρής", "Μακρή"], ["Αθανασίου", "Αθανασίου"],
  ["Πετρίδης", "Πετρίδου"], ["Χατζής", "Χατζή"], ["Καραγιάννης", "Καραγιάννη"],
  ["Μιχαηλίδης", "Μιχαηλίδου"], ["Αλεξίου", "Αλεξίου"], ["Σταματίου", "Σταματίου"],
  ["Ζαχαρίου", "Ζαχαρίου"], ["Λαμπρόπουλος", "Λαμπροπούλου"], ["Τσακίρης", "Τσακίρη"],
  ["Ραφαηλίδης", "Ραφαηλίδου"], ["Κυριακίδης", "Κυριακίδου"], ["Μαυρίδης", "Μαυρίδου"],
  ["Φραγκιαδάκης", "Φραγκιαδάκη"], ["Σαββίδης", "Σαββίδου"], ["Πολυχρόνης", "Πολυχρόνη"],
  ["Διαμαντής", "Διαμαντή"], ["Στεφανίδης", "Στεφανίδου"], ["Μπακάλης", "Μπακάλη"],
];
const usedNames = new Set();
function person() {
  for (;;) {
    const female = chance(0.5);
    const first = pick(female ? FEMALE : MALE);
    const last = pick(SURNAMES)[female ? 1 : 0];
    const name = `${first} ${last}`;
    if (!usedNames.has(name)) {
      usedNames.add(name);
      return { name, first, last };
    }
  }
}
const usedPhones = new Set();
function phone() {
  for (;;) {
    const p = `69${int(10000000, 99999999)}`;
    if (!usedPhones.has(p)) {
      usedPhones.add(p);
      return p;
    }
  }
}
const EMAIL_DOMAINS = ["gmail.com", "yahoo.gr", "hotmail.com", "outlook.com"];

// ---------- packages ----------
const packages = [
  { name: "Μηνιαία Απεριόριστη", category: "subscription", duration: "30 ημέρες", days: 30, price: 45 },
  { name: "Τριμηνιαία Απεριόριστη", category: "subscription", duration: "90 ημέρες", days: 90, price: 120 },
  { name: "Εξαμηνιαία Απεριόριστη", category: "subscription", duration: "180 ημέρες", days: 180, price: 220 },
  { name: "Ετήσια Απεριόριστη", category: "subscription", duration: "365 ημέρες", days: 365, price: 400 },
  { name: "10 Επισκέψεις", category: "hourly", duration: "60 ημέρες", days: 60, price: 60 },
  { name: "20 Επισκέψεις", category: "hourly", duration: "90 ημέρες", days: 90, price: 110 },
  { name: "Παιδικό Πρόγραμμα", category: "kids", duration: "30 ημέρες", days: 30, price: 35 },
  { name: "Παιδικό Τρίμηνο", category: "kids", duration: "90 ημέρες", days: 90, price: 95 },
].map((p, i) => ({ id: i + 1, ...p }));
const packageWeights = [
  [packages[0], 34], [packages[1], 16], [packages[2], 7], [packages[3], 10],
  [packages[4], 12], [packages[5], 7], [packages[6], 9], [packages[7], 5],
];

// ---------- staff (Colosseum Gym, https://www.colosseumgym.gr/) ----------
const OWNER = "Γιώργος Γαλιάτσος";
const COACHES = [
  "Αλέξανδρος Αγαπητός",
  "Κυριάκος Παπαδόπουλος",
  "Γιάννης Πιπεράκης",
  "Τζένη Μυλωνά",
  "Παναγιώτα Βερούση",
  "Βίκυ Αργύρη",
  "Δημήτρης Γιαννούλης",
];
const staffEmail = (fullName) => {
  const [first, last] = fullName.split(" ");
  return `${latin(first)}.${latin(last)}@colosseumgym.gr`;
};
const recentSignIn = () => {
  const signIn = at(addDays(today, -int(0, 6)), int(7, 21), int(0, 59));
  // Never in the future (today's random hour may not have come yet).
  return (signIn > new Date() ? addDays(signIn, -1) : signIn).toISOString();
};
const staffSeed = [
  // Melos developers (software vendor), not gym employees.
  { email: "admin@melos.local", password: "admin123", fullName: "Developer", role: "admin" },
  { email: staffEmail(OWNER), password: "owner123", fullName: OWNER, role: "owner" },
  ...COACHES.map((fullName) => ({
    email: staffEmail(fullName),
    password: "coach123",
    fullName,
    role: "trainer",
  })),
];
const staff = staffSeed.map((s, i) => ({
  id: i + 1,
  ...s,
  createdAt: addDays(today, -int(120, 900)).toISOString(),
  lastSignInAt: s.role === "admin" ? null : recentSignIn(),
}));
[OWNER, ...COACHES].forEach((name) => usedNames.add(name));
/** Coaches appear on bookings by first name, as on the printed schedule. */
const coach = (fullName) => fullName.split(" ")[0];
const instructors = COACHES.map(coach);
// ---------- members ----------
// Member #1 is the documented member-portal test account.
const PORTAL_MEMBER = { name: "Νίκος Παπαδόπουλος", phone: "6912345678" };
usedNames.add(PORTAL_MEMBER.name);
usedPhones.add(PORTAL_MEMBER.phone);
const members = [];
for (let id = 1; id <= COUNTS.members; id++) {
  const p = id === 1 ? { name: PORTAL_MEMBER.name, first: "Νίκος", last: "Παπαδόπουλος" } : person();
  const pkg = id === 1 ? packages[0] : weighted(packageWeights);
  const bucket = id === 1 ? "active" : weighted([["active", 66], ["expiring_soon", 11], ["expired", 23]]);
  const offset =
    bucket === "active" ? int(15, Math.max(20, pkg.days)) :
    bucket === "expiring_soon" ? int(0, 14) :
    -int(1, 120);
  const expiryDate = addDays(today, offset);
  const member = {
    id,
    name: p.name,
    phone: id === 1 ? PORTAL_MEMBER.phone : phone(),
    status: bucket,
    expiry: gr(expiryDate),
    package: pkg.name,
  };
  if (chance(0.7)) {
    member.email = `${latin(p.first)}.${latin(p.last)}${int(1, 99)}@${pick(EMAIL_DOMAINS)}`;
  }
  if (chance(0.02)) member.card_lost = true;
  members.push({ ...member, _pkg: pkg, _expiry: expiryDate, _joined: addDays(today, -int(20, 720)) });
}

// ---------- payments & debts ----------
// Every subscription period is one payment. Unpaid periods (pending transfer or failed
// without a retry) are exactly the debts, so payments, debts and members always agree.
const METHODS = [["Καρτα", 45], ["Μετρητα", 30], ["IRIS", 13], ["Τραπεζικη Μεταφορα", 10], ["Αλλο", 2]];
const HISTORY_START = new Date(today.getFullYear(), today.getMonth() - 11, 1);
const payments = [];
const debts = [];
const paymentOf = (m, paidOn, status, method = weighted(METHODS)) => ({
  memberId: m.id,
  memberName: m.name,
  package: m.package,
  amount: m._pkg.price,
  date: gr(paidOn),
  status,
  method,
  _date: paidOn,
});
const debtOf = (m, since) => {
  const daysOverdue = Math.max(1, daysBetween(since, today));
  debts.push({
    memberId: m.id,
    name: m.name,
    amount: m._pkg.price,
    daysOverdue,
    status: daysOverdue >= 25 ? "critical" : daysOverdue >= 10 ? "warning" : "overdue",
    lastContact: gr(addDays(today, -int(0, Math.min(daysOverdue - 1, 21)))),
    phone: m.phone,
    ...(m.email ? { email: m.email } : {}),
  });
};

for (const m of members) {
  // Walk back period by period from the current expiry.
  let periodEnd = m._expiry;
  for (let period = 0; period < 40; period++) {
    const start = addDays(periodEnd, -m._pkg.days);
    const paidOn = addDays(start, int(-2, 1));
    periodEnd = start;
    if (paidOn < HISTORY_START || paidOn < m._joined) break;
    if (paidOn > today) continue;

    if (period === 0) {
      const age = daysBetween(paidOn, today);
      // Latest period: some members still owe it.
      const unpaid =
        m.status === "expired" ? chance(0.3) : age <= 14 ? chance(0.1) : chance(0.03);
      if (unpaid) {
        const pending = age <= 14 && chance(0.6);
        payments.push(
          paymentOf(m, paidOn, pending ? "pending" : "failed", pending ? weighted([["IRIS", 50], ["Τραπεζικη Μεταφορα", 50]]) : "Καρτα"),
        );
        debtOf(m, paidOn);
        continue;
      }
    }
    if (chance(0.03)) {
      // Card declined, paid a couple of days later.
      payments.push(paymentOf(m, paidOn, "failed", "Καρτα"));
      const retry = addDays(paidOn, int(1, 3));
      payments.push(paymentOf(m, retry > today ? today : retry, "completed"));
    } else {
      payments.push(paymentOf(m, paidOn, "completed"));
    }
  }
}
payments.sort((a, b) => a._date - b._date);
debts.sort((a, b) => b.daysOverdue - a.daysOverdue);
// ---------- announcements ----------
const announcements = [
  ["Καλώς ήρθες στο Colosseum Gym", "Η πύλη μελών είναι έτοιμη. Δες το πρόγραμμα, κλείσε θέση στα ομαδικά και έχε πάντα το QR σου για είσοδο. Stronger · Together!", "all", 2],
  ["Ωράριο λειτουργίας", "Δευτέρα–Παρασκευή 07:00–23:00 · Σάββατο 09:00–20:00 · Κυριακή 09:00–17:00. Μεσογείων 226, Χολαργός · 210 6536082.", "all", 6],
  ["Πρόγραμμα ομαδικών 2026–2027", "Pilates, Yoga, Ορθοσωμία, Functional Training, BodyCross, Cross Training, HIIT, Tabata, Fitballs και Glutes & Core. Όλα τα ομαδικά περιλαμβάνονται στη συνδρομή σου.", "active", 10],
  ["Πετσέτα & στρώμα", "Για τη συμμετοχή σε όλα τα ομαδικά μαθήματα απαιτείται ατομική πετσέτα προσώπου και ατομικό στρώμα γυμναστικής.", "all", 14],
  ["Ανανέωση συνδρομής", "Η συνδρομή σου λήγει σύντομα; Ανανέωσε στη ρεσεψιόν και πάρε 10% έκπτωση στο τρίμηνο πακέτο.", "expiring", 18],
  ["Personal training", "Οι coaches μας είναι διαθέσιμοι για ατομικές προπονήσεις και αξιολόγηση. Κλείσε ραντεβού στη ρεσεψιόν.", "members", 30],
  ["Challenge μήνα", "Ολοκλήρωσε 12 προπονήσεις αυτόν τον μήνα και κέρδισε ένα δωρεάν personal training!", "active", 40],
  ["Νέος εξοπλισμός", "Ήρθαν νέα rowing machines και assault bikes στον χώρο cardio.", "all", 55],
].map(([title, body, audience, ago], i) => ({
  id: i + 1,
  title,
  body,
  audience,
  published: true,
  created_at: at(addDays(today, -ago), 9, 30).toISOString(),
}));

// ---------- bookings ----------
// Official group classes 2026–2027 (weekday 1=Mon … 5=Fri; no group classes at weekends).
const CLASSES = [
  [1, "09:30", "10:30", "Pilates", "Αλέξανδρος"],
  [1, "10:35", "11:35", "Tabata", "Αλέξανδρος"],
  [1, "17:55", "18:55", "Pilates", "Γιάννης"],
  [1, "19:00", "20:00", "BodyCross", "Γιάννης"],
  [1, "20:05", "21:00", "HIIT Training", "Γιάννης"],
  [1, "21:05", "22:00", "Pilates", "Γιάννης"],
  [2, "09:30", "10:30", "Ορθοσωμία", "Τζένη"],
  [2, "10:35", "11:35", "Yoga", "Τζένη"],
  [2, "17:55", "18:55", "Pilates", "Δημήτρης"],
  [2, "19:00", "20:00", "Functional Training", "Δημήτρης"],
  [2, "20:05", "21:00", "Pilates", "Δημήτρης"],
  [2, "21:05", "22:00", "Glutes & Core", "Δημήτρης"],
  [3, "09:30", "10:30", "Pilates", "Αλέξανδρος"],
  [3, "10:35", "11:35", "Functional Training", "Αλέξανδρος"],
  [3, "17:50", "18:50", "Cross Training", "Κυριάκος"],
  [3, "18:55", "19:55", "BodyCross", "Κυριάκος"],
  [3, "20:00", "21:00", "Ορθοσωμία", "Τζένη"],
  [3, "21:05", "22:05", "Yoga", "Τζένη"],
  [4, "09:30", "10:30", "Functional Training", "Δημήτρης"],
  [4, "10:35", "11:35", "Pilates", "Δημήτρης"],
  [4, "17:50", "18:50", "Yoga", "Τζένη"],
  [4, "18:55", "19:55", "Fitballs", "Τζένη"],
  [4, "20:00", "21:00", "Pilates", "Αλέξανδρος"],
  [4, "21:05", "22:00", "Functional Training", "Αλέξανδρος"],
  [5, "09:30", "10:30", "Pilates", "Δημήτρης"],
  [5, "10:35", "11:35", "BodyCross", "Δημήτρης"],
  [5, "17:20", "18:05", "HIIT 45'", "Γιάννης"],
  [5, "18:10", "19:10", "Pilates", "Γιάννης"],
  [5, "19:15", "20:15", "Functional Training", "Γιάννης"],
];
/** Capacity per class type (mat/space based). */
const CAPACITY = {
  Pilates: 12, Yoga: 14, "Ορθοσωμία": 12, Fitballs: 12, "Glutes & Core": 14,
  Tabata: 16, BodyCross: 16, "HIIT Training": 16, "HIIT 45'": 16,
  "Functional Training": 16, "Cross Training": 16,
};
const atTime = (day, hhmm) => {
  const [h, m] = hhmm.split(":").map(Number);
  return at(day, h, m);
};
// Evening classes fill up more than morning ones.
const demand = (start) => (start.getHours() >= 17 ? [0.45, 1] : [0.2, 0.7]);

const bookings = [];
const nowIso = new Date().toISOString();
const activeMembers = members.filter((m) => m.status !== "expired" && !m.card_lost);
for (let d = -7; d <= 14; d++) {
  const day = addDays(today, d);
  for (const [weekday, from, to, title, instructor] of CLASSES) {
    if (day.getDay() !== weekday) continue;
    const start = atTime(day, from);
    const end = atTime(day, to);
    const max = CAPACITY[title] ?? 14;
    const [lo, hi] = demand(start);
    // Future classes further out have fewer bookings yet.
    const horizon = d > 7 ? 0.35 : 1;
    const participants = Math.round(int(Math.round(max * lo), Math.round(max * hi)) * horizon);
    const base = {
      title,
      type: "class",
      startTime: start.toISOString(),
      endTime: end.toISOString(),
      instructor,
      maxParticipants: max,
      color: "#2a8bb8",
      created_at: nowIso,
      updated_at: nowIso,
    };
    bookings.push({
      ...base,
      memberId: 0,
      memberName: "Γενικη Ταξη",
      status: end < new Date() ? "completed" : "confirmed",
      currentParticipants: participants,
    });
    const taken = new Set();
    for (let i = 0; i < participants; i++) {
      const m = pick(activeMembers);
      if (taken.has(m.id)) continue;
      taken.add(m.id);
      bookings.push({
        ...base,
        memberId: m.id,
        memberName: m.name,
        memberPhone: m.phone,
        status: end < new Date() ? "completed" : chance(0.06) ? "cancelled" : "confirmed",
        currentParticipants: participants,
      });
    }
  }
}
// Personal training & assessments; coaches without group classes do most of them.
const ptCoaches = [
  ["Παναγιώτα", 5], ["Βίκυ", 5], ["Κυριάκος", 3],
  ["Αλέξανδρος", 1], ["Γιάννης", 1], ["Τζένη", 1], ["Δημήτρης", 1],
];
for (let i = 0; i < 60; i++) {
  const d = int(-7, 14);
  const day = addDays(today, d);
  const weekday = day.getDay();
  const [openH, closeH] = weekday === 0 ? [9, 16] : weekday === 6 ? [9, 19] : [7, 22];
  const m = pick(activeMembers);
  const type = weighted([["personal_training", 75], ["appointment", 25]]);
  const hour = int(openH, closeH - 1);
  const start = at(day, hour);
  bookings.push({
    memberId: m.id,
    memberName: m.name,
    memberPhone: m.phone,
    title: type === "personal_training" ? "Personal Training" : "Αξιολόγηση / Μέτρηση",
    type,
    startTime: start.toISOString(),
    endTime: at(day, hour + 1).toISOString(),
    status: start < new Date() ? "completed" : "confirmed",
    instructor: weighted(ptCoaches),
    currentParticipants: 1,
    color: type === "personal_training" ? "#1f9d63" : "#d4a800",
    created_at: nowIso,
    updated_at: nowIso,
  });
}bookings.sort((a, b) => a.startTime.localeCompare(b.startTime));

// ---------- entrance logs ----------
const MESSAGES = {
  active: "Ενεργή Συνδρομή",
  expiring_soon: "Ενεργή Συνδρομή (Λήγει Σύντομα)",
  expired: "Ληγμένη Συνδρομή",
  card_lost: "Κάρτα Ακυρωμένη",
};
// Weekday traffic (~300): morning rush 07–10 (~100), quiet midday, evening peak 17–21 (~130).
// Opening hours: Mon–Fri 07–23, Sat 09–20, Sun 09–17.
const WEEKDAY_HOURS = [[7, 35], [8, 35], [9, 30], [10, 12], [11, 8], [12, 6], [13, 5], [14, 5], [15, 8], [16, 14], [17, 32], [18, 38], [19, 38], [20, 22], [21, 9], [22, 3]];
const WEEKEND_SAT = [[9, 6], [10, 9], [11, 10], [12, 9], [13, 6], [14, 4], [15, 4], [16, 5], [17, 8], [18, 7], [19, 3]];
const WEEKEND_SUN = [[9, 6], [10, 10], [11, 11], [12, 9], [13, 6], [14, 4], [15, 3], [16, 2]];
const VISITS_PER_DAY = { weekday: [285, 325], sat: [230, 270], sun: [180, 220] };

// How often each member trains: regulars, casuals and a few who stopped coming.
const frequency = new Map(
  members.map((m) => [
    m.id,
    weighted([[2.2, 25], [1.2, 40], [0.6, 25], [0.15, 6], [0, 4]]),
  ]),
);
/** Weighted sample of `n` distinct members (Efraimidis–Spirakis). */
function sampleVisitors(pool, n) {
  return pool
    .map((m) => {
      const w = frequency.get(m.id) ?? 0;
      return { m, key: w > 0 ? Math.pow(rand(), 1 / w) : -1 };
    })
    .filter((r) => r.key >= 0)
    .sort((a, b) => b.key - a.key)
    .slice(0, n)
    .map((r) => r.m);
}

const entranceLogs = [];
const nowTime = new Date();
for (let d = -30; d <= 0; d++) {
  const day = addDays(today, d);
  const weekday = day.getDay();
  const [lo, hi] = weekday === 0 ? VISITS_PER_DAY.sun : weekday === 6 ? VISITS_PER_DAY.sat : VISITS_PER_DAY.weekday;
  const hours = weekday === 0 ? WEEKEND_SUN : weekday === 6 ? WEEKEND_SAT : WEEKDAY_HOURS;
  // Mostly valid members; a few expired / cancelled cards get rejected at the door.
  const visitors = [
    ...sampleVisitors(activeMembers, int(lo, hi)),
    ...sampleVisitors(members.filter((m) => m.status === "expired" || m.card_lost), int(2, 6)),
  ];
  for (const m of visitors) {
    const time = at(day, weighted(hours), int(0, 59));
    if (time > nowTime) continue;
    const key = m.card_lost ? "card_lost" : m.status;
    entranceLogs.push({
      memberId: m.id,
      memberName: m.name,
      memberPhone: m.phone,
      memberStatus: m.status,
      validationStatus: key === "expired" || key === "card_lost" ? "invalid" : m.status === "expiring_soon" ? "expiring_soon" : "valid",
      validationMessage: MESSAGES[key],
      entranceType: chance(0.88) ? "qr_scan" : "manual",
      timestamp: time.toISOString(),
    });
  }
}entranceLogs.sort((a, b) => a.timestamp.localeCompare(b.timestamp));

// ---------- write ----------
const withIds = (rows) => rows.map((row, i) => ({ id: i + 1, ...row }));
const strip = (rows) =>
  rows.map((row) => Object.fromEntries(Object.entries(row).filter(([k]) => !k.startsWith("_"))));
// Active member counts are derived from members in the app, not stored.
const pkgOut = packages.map(({ days: _days, active: _active, ...p }) => p);

const db = {
  staff,
  packages: pkgOut,
  members: strip(members),
  debts: withIds(debts),
  payments: withIds(strip(payments)),
  announcements,
  bookings: withIds(bookings),
  entrance_logs: withIds(entranceLogs),
};

writeFileSync(OUT, JSON.stringify(db, null, 2) + "\n");
console.log(
  `[seed] db/seed.json: ${Object.entries(db).map(([k, v]) => `${k}=${v.length}`).join(", ")}`,
);
