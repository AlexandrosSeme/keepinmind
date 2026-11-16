import { createCollection } from "@/shared/api/collection";
import i18n from "@/shared/i18n";
import { logger } from "@/shared/lib/logger";
import type { Booking, ClassSession } from "./types";

type BookingInput = Omit<Booking, "id" | "created_at" | "updated_at">;

const bookings = createCollection<Booking, Partial<Booking>>("bookings");

const byStart = (a: Booking, b: Booking) =>
  new Date(a.startTime).getTime() - new Date(b.startTime).getTime();

// ==================== BOOKING CRUD OPERATIONS ====================

export async function fetchBookings(
  startDate?: Date,
  endDate?: Date,
): Promise<Booking[]> {
  try {
    const all = await bookings.list();
    const inRange =
      startDate && endDate
        ? all.filter(
            (b) =>
              new Date(b.startTime) >= startDate &&
              new Date(b.endTime) <= endDate,
          )
        : all;
    return inRange
      .map((b) => ({ ...b, currentParticipants: b.currentParticipants || 0 }))
      .sort(byStart);
  } catch (err) {
    logger.error("[BookingService] Error fetching bookings:", err);
    return [];
  }
}

export function createBooking(booking: BookingInput): Promise<Booking | null> {
  const now = new Date().toISOString();
  return bookings.create({
    ...booking,
    status: booking.status || "confirmed",
    currentParticipants: booking.currentParticipants || 0,
    created_at: now,
    updated_at: now,
  });
}

export function updateBooking(
  id: number,
  updates: Partial<BookingInput>,
): Promise<Booking | null> {
  return bookings.update(id, {
    ...updates,
    updated_at: new Date().toISOString(),
  });
}

export const deleteBooking = (id: number): Promise<boolean> =>
  bookings.remove(id);

// Get bookings for a specific member
export async function fetchMemberBookings(
  memberId: number,
): Promise<Booking[]> {
  try {
    const mine = await bookings.list({ memberId });
    return mine
      .map((b) => ({ ...b, currentParticipants: b.currentParticipants || 0 }))
      .sort(byStart);
  } catch (err) {
    logger.error("[BookingService] Error fetching member bookings:", err);
    return [];
  }
}

function sessionKey(b: Booking): string {
  return `${b.title}|${b.startTime}|${b.endTime}|${b.instructor || ""}`;
}

/** Open / group sessions for the member schedule (next N days) */
export async function fetchClassSessions(
  from: Date,
  to: Date,
): Promise<ClassSession[]> {
  const bookings = await fetchBookings(from, to);
  const openTypes = new Set(["class", "event", "personal_training"]);

  const map = new Map<string, ClassSession>();

  bookings
    .filter((b) => openTypes.has(b.type) && b.status !== "cancelled")
    .forEach((b) => {
      const key = sessionKey(b);
      const existing = map.get(key);
      const isParticipant = b.memberId > 0;
      if (existing) {
        if (isParticipant) existing.bookedCount += 1;
      } else {
        map.set(key, {
          key,
          title: b.title,
          description: b.description,
          type: b.type,
          startTime: b.startTime,
          endTime: b.endTime,
          instructor: b.instructor,
          maxParticipants: b.maxParticipants,
          bookedCount: isParticipant ? 1 : 0,
          color: b.color,
          templateId: b.id,
        });
      }
    });

  return Array.from(map.values()).sort(
    (a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime(),
  );
}

export async function bookClassForMember(
  session: ClassSession,
  member: { id: number; name: string; phone: string },
): Promise<{ booking: Booking | null; error: string | null }> {
  if (
    session.maxParticipants &&
    session.bookedCount >= session.maxParticipants
  ) {
    return { booking: null, error: i18n.t("bookings:errors.classFull") };
  }

  const mine = await fetchMemberBookings(member.id);
  const already = mine.some(
    (b) =>
      b.status !== "cancelled" &&
      b.title === session.title &&
      b.startTime === session.startTime,
  );
  if (already) {
    return { booking: null, error: i18n.t("bookings:errors.alreadyBooked") };
  }

  const created = await createBooking({
    memberId: member.id,
    memberName: member.name,
    memberPhone: member.phone,
    title: session.title,
    description: session.description,
    type: session.type,
    startTime: session.startTime,
    endTime: session.endTime,
    status: "confirmed",
    instructor: session.instructor,
    maxParticipants: session.maxParticipants,
    currentParticipants: (session.bookedCount || 0) + 1,
    color: session.color || "#f5c400",
  });

  if (!created) {
    return {
      booking: null,
      error: i18n.t("bookings:errors.bookingFailed"),
    };
  }

  return { booking: created, error: null };
}

export async function cancelMemberBooking(
  bookingId: number,
  memberId: number,
): Promise<boolean> {
  const mine = await fetchMemberBookings(memberId);
  const booking = mine.find((b) => b.id === bookingId);
  if (!booking) return false;
  const updated = await updateBooking(bookingId, { status: "cancelled" });
  return !!updated;
}
