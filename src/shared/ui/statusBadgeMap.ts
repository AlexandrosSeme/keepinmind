export type BadgeTone =
  | "success"
  | "warning"
  | "danger"
  | "info"
  | "neutral"
  | "brand";

type StatusMeta = {
  tone: BadgeTone;
  label: string;
};

/** Shared status → label/tone map used across the CRM */
export const STATUS_BADGE_MAP: Record<string, StatusMeta> = {
  // Membership
  active: { tone: "success", label: "Ενεργη" },
  expiring_soon: { tone: "warning", label: "Ληγει συντομα" },
  expired: { tone: "danger", label: "Ληγμενη" },
  card_lost: { tone: "danger", label: "Καρτα ακυρωμενη" },

  // Validation / entrance
  valid: { tone: "success", label: "Εγκυρο" },
  invalid: { tone: "danger", label: "Μη εγκυρο" },

  // Debts
  overdue: { tone: "warning", label: "Ληξιπροθεσμη" },
  critical: { tone: "danger", label: "Κρισιμη" },
  warning: { tone: "info", label: "Προειδοποιηση" },

  // Messaging
  sent: { tone: "success", label: "Σταλθηκε" },
  scheduled: { tone: "warning", label: "Προγραμματισμενο" },
  draft: { tone: "neutral", label: "Προχειρο" },
  failed: { tone: "danger", label: "Αποτυχια" },

  // Payments / bookings
  completed: { tone: "success", label: "Ολοκληρωθηκε" },
  pending: { tone: "warning", label: "Εκκρεμει" },
  paid: { tone: "success", label: "Πληρωμενο" },
  confirmed: { tone: "success", label: "Επιβεβαιωμενη" },
  cancelled: { tone: "neutral", label: "Ακυρωθηκε" },

  // Categories / programs
  group: { tone: "brand", label: "Ομαδικο" },
  program: { tone: "info", label: "Προγραμμα" },
  appointment: { tone: "warning", label: "Ραντεβου" },
  class: { tone: "success", label: "Ταξη" },
  personal: { tone: "info", label: "Personal" },
  subscription: { tone: "brand", label: "Συνδρομη" },
  hourly: { tone: "info", label: "Ωριαια" },
  kids: { tone: "success", label: "Παιδικο" },

  // Attendance
  attended: { tone: "success", label: "Παρεστη" },
  absent: { tone: "danger", label: "Απουσια" },

  // Devices
  on: { tone: "success", label: "ON" },
  off: { tone: "neutral", label: "OFF" },
  na: { tone: "danger", label: "N/A" },

  // Entrance type
  qr_scan: { tone: "info", label: "QR Scan" },
  manual: { tone: "neutral", label: "Manual" },
};
