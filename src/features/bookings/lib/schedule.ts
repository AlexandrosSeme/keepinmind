import type { BookingFormData, BookingType } from "../types";

/** Hourly rows shown in the weekly grid (06:00 – 23:00). */
export const TIME_SLOTS = Array.from({ length: 18 }, (_, i) => {
  const hour = 6 + i;
  return { hour, label: `${hour.toString().padStart(2, "0")}:00` };
});

/** Day keys (0 = Monday); labels come from the `bookings:days.*` translations. */
export const DAYS_OF_WEEK = [0, 1, 2, 3, 4, 5, 6] as const;

export const BOOKING_TYPES: BookingType[] = [
  "class",
  "personal_training",
  "appointment",
  "event",
];

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
