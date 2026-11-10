import type { BookingFormData, BookingType } from "../types";

/** Hourly rows shown in the weekly grid (06:00 – 23:00). */
export const TIME_SLOTS = Array.from({ length: 18 }, (_, i) => {
  const hour = 6 + i;
  return { hour, label: `${hour.toString().padStart(2, "0")}:00` };
});

export const DAYS_OF_WEEK = [
  { key: 0, label: "Δευτερα", short: "Δευ" },
  { key: 1, label: "Τριτη", short: "Τρι" },
  { key: 2, label: "Τεταρτη", short: "Τετ" },
  { key: 3, label: "Πεμπτη", short: "Πεμ" },
  { key: 4, label: "Παρασκευη", short: "Παρ" },
  { key: 5, label: "Σαββατο", short: "Σαβ" },
  { key: 6, label: "Κυριακη", short: "Κυρ" },
];

export const BOOKING_TYPE_LABELS: Record<BookingType, string> = {
  class: "Ταξη",
  personal_training: "Προσωπικη Προπονηση",
  appointment: "Ραντεβου",
  event: "Εκδηλωση",
};

const BOOKING_TYPE_COLORS: Record<BookingType, string> = {
  class: "#2a8bb8",
  personal_training: "#1f9d63",
  appointment: "#d4a800",
  event: "#f5c400",
};

export const getBookingColor = (type: BookingType): string =>
  BOOKING_TYPE_COLORS[type] ?? "#6b6b6b";

/** Member name stored on bookings that are not tied to a specific member. */
export const GENERAL_CLASS_NAME = "Γενικη Ταξη";

export const emptyBookingForm = (
  start = new Date(),
  end = new Date(),
): BookingFormData => ({
  memberId: null,
  title: "",
  description: "",
  type: "class",
  startTime: start,
  endTime: end,
  instructor: "",
  maxParticipants: null,
  notes: "",
});
