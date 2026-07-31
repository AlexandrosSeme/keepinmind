import React from "react";

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

export interface StatusBadgeProps {
  status?: string;
  tone?: BadgeTone;
  label?: React.ReactNode;
  icon?: React.ReactNode;
  className?: string;
  showDot?: boolean;
}

const StatusBadge: React.FC<StatusBadgeProps> = ({
  status,
  tone,
  label,
  icon,
  className = "",
  showDot = true,
}) => {
  const mapped = status ? STATUS_BADGE_MAP[status] : undefined;
  const resolvedTone = tone ?? mapped?.tone ?? "neutral";
  const resolvedLabel = label ?? mapped?.label ?? status ?? "—";

  return (
    <span
      className={`km-badge km-badge--${resolvedTone} ${className}`.trim()}
      title={typeof resolvedLabel === "string" ? resolvedLabel : undefined}
    >
      {icon ? (
        <span className="km-badge__icon">{icon}</span>
      ) : showDot ? (
        <span className="km-badge__dot" aria-hidden />
      ) : null}
      <span className="km-badge__label">{resolvedLabel}</span>
    </span>
  );
};

export default StatusBadge;
