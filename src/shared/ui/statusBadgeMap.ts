export type BadgeTone =
  | "success"
  | "warning"
  | "danger"
  | "info"
  | "neutral"
  | "brand";

/** Shared status → tone map used across the CRM. Labels live in `common:status.<key>`. */
export const STATUS_BADGE_MAP: Record<string, BadgeTone> = {
  // Membership
  active: "success",
  expiring_soon: "warning",
  expired: "danger",
  card_lost: "danger",

  // Validation / entrance
  valid: "success",
  invalid: "danger",

  // Debts
  overdue: "warning",
  critical: "danger",
  warning: "info",

  // Messaging
  sent: "success",
  scheduled: "warning",
  draft: "neutral",
  failed: "danger",

  // Payments / bookings
  completed: "success",
  pending: "warning",
  paid: "success",
  confirmed: "success",
  cancelled: "neutral",

  // Categories / programs
  group: "brand",
  program: "info",
  appointment: "warning",
  class: "success",
  personal: "info",
  subscription: "brand",
  hourly: "info",
  kids: "success",

  // Attendance
  attended: "success",
  absent: "danger",

  // Devices
  on: "success",
  off: "neutral",
  na: "danger",

  // Entrance type
  qr_scan: "info",
  manual: "neutral",
};
