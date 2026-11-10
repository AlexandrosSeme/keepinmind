import { supabase } from "../lib/supabaseClient";
import type { Booking, ClassSession } from "../types";

// Database row format
interface BookingRow {
  id: number;
  member_id: number;
  member_name: string;
  member_phone: string | null;
  title: string;
  description: string | null;
  type: Booking['type'];
  start_time: string;
  end_time: string;
  status: Booking['status'];
  instructor: string | null;
  max_participants: number | null;
  current_participants: number | null;
  color: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

// Update data format
interface BookingUpdateData {
  member_id?: number;
  member_name?: string;
  member_phone?: string | null;
  title?: string;
  description?: string | null;
  type?: Booking['type'];
  start_time?: string;
  end_time?: string;
  status?: Booking['status'];
  instructor?: string | null;
  max_participants?: number | null;
  current_participants?: number | null;
  color?: string | null;
  notes?: string | null;
}

// ==================== BOOKING CRUD OPERATIONS ====================

export async function fetchBookings(startDate?: Date, endDate?: Date): Promise<Booking[]> {
  if (!supabase) {
    console.warn("[BookingService] Supabase not configured, returning empty array");
    return [];
  }

  try {
    let query = supabase
      .from("bookings")
      .select("*")
      .order("start_time", { ascending: true });

    // Filter by date range if provided
    if (startDate && endDate) {
      query = query
        .gte("start_time", startDate.toISOString())
        .lte("end_time", endDate.toISOString());
    }

    const { data, error } = await query;

    if (error) {
      console.error("[BookingService] Error fetching bookings:", error);
      return [];
    }

    // Transform database format to Booking interface
    return (data || []).map((item: BookingRow) => ({
      id: item.id,
      memberId: item.member_id,
      memberName: item.member_name,
      memberPhone: item.member_phone,
      title: item.title,
      description: item.description,
      type: item.type,
      startTime: item.start_time,
      endTime: item.end_time,
      status: item.status,
      instructor: item.instructor,
      maxParticipants: item.max_participants,
      currentParticipants: item.current_participants || 0,
      color: item.color,
      notes: item.notes,
      created_at: item.created_at,
      updated_at: item.updated_at,
    })) as Booking[];
  } catch (err) {
    console.error("[BookingService] Exception fetching bookings:", err);
    return [];
  }
}

export async function createBooking(booking: Omit<Booking, "id" | "created_at" | "updated_at">): Promise<Booking | null> {
  if (!supabase) {
    console.warn("[BookingService] Supabase not configured");
    return null;
  }

  try {
    // Transform to database format
    const bookingData = {
      member_id: booking.memberId,
      member_name: booking.memberName,
      member_phone: booking.memberPhone || null,
      title: booking.title,
      description: booking.description || null,
      type: booking.type,
      start_time: booking.startTime,
      end_time: booking.endTime,
      status: booking.status || "confirmed",
      instructor: booking.instructor || null,
      max_participants: booking.maxParticipants || null,
      current_participants: booking.currentParticipants || 0,
      color: booking.color || null,
      notes: booking.notes || null,
    };

    const { data, error } = await supabase
      .from("bookings")
      .insert([bookingData])
      .select()
      .single();

    if (error) {
      console.error("[BookingService] Error creating booking:", error);
      return null;
    }

    // Transform back to Booking interface
    return {
      id: data.id,
      memberId: data.member_id,
      memberName: data.member_name,
      memberPhone: data.member_phone,
      title: data.title,
      description: data.description,
      type: data.type,
      startTime: data.start_time,
      endTime: data.end_time,
      status: data.status,
      instructor: data.instructor,
      maxParticipants: data.max_participants,
      currentParticipants: data.current_participants || 0,
      color: data.color,
      notes: data.notes,
      created_at: data.created_at,
      updated_at: data.updated_at,
    } as Booking;
  } catch (err) {
    console.error("[BookingService] Exception creating booking:", err);
    return null;
  }
}

export async function updateBooking(
  id: number,
  updates: Partial<Omit<Booking, "id" | "created_at" | "updated_at">>
): Promise<Booking | null> {
  if (!supabase) {
    console.warn("[BookingService] Supabase not configured");
    return null;
  }

  try {
    // Transform to database format
    const updateData: BookingUpdateData = {};
    if (updates.memberId !== undefined) updateData.member_id = updates.memberId;
    if (updates.memberName !== undefined) updateData.member_name = updates.memberName;
    if (updates.memberPhone !== undefined) updateData.member_phone = updates.memberPhone;
    if (updates.title !== undefined) updateData.title = updates.title;
    if (updates.description !== undefined) updateData.description = updates.description;
    if (updates.type !== undefined) updateData.type = updates.type;
    if (updates.startTime !== undefined) updateData.start_time = updates.startTime;
    if (updates.endTime !== undefined) updateData.end_time = updates.endTime;
    if (updates.status !== undefined) updateData.status = updates.status;
    if (updates.instructor !== undefined) updateData.instructor = updates.instructor;
    if (updates.maxParticipants !== undefined) updateData.max_participants = updates.maxParticipants;
    if (updates.currentParticipants !== undefined) updateData.current_participants = updates.currentParticipants;
    if (updates.color !== undefined) updateData.color = updates.color;
    if (updates.notes !== undefined) updateData.notes = updates.notes;

    const { data, error } = await supabase
      .from("bookings")
      .update(updateData)
      .eq("id", id)
      .select()
      .single();

    if (error) {
      console.error("[BookingService] Error updating booking:", error);
      return null;
    }

    // Transform back to Booking interface
    return {
      id: data.id,
      memberId: data.member_id,
      memberName: data.member_name,
      memberPhone: data.member_phone,
      title: data.title,
      description: data.description,
      type: data.type,
      startTime: data.start_time,
      endTime: data.end_time,
      status: data.status,
      instructor: data.instructor,
      maxParticipants: data.max_participants,
      currentParticipants: data.current_participants || 0,
      color: data.color,
      notes: data.notes,
      created_at: data.created_at,
      updated_at: data.updated_at,
    } as Booking;
  } catch (err) {
    console.error("[BookingService] Exception updating booking:", err);
    return null;
  }
}

export async function deleteBooking(id: number): Promise<boolean> {
  if (!supabase) {
    console.warn("[BookingService] Supabase not configured");
    return false;
  }

  try {
    const { error } = await supabase.from("bookings").delete().eq("id", id);

    if (error) {
      console.error("[BookingService] Error deleting booking:", error);
      return false;
    }

    return true;
  } catch (err) {
    console.error("[BookingService] Exception deleting booking:", err);
    return false;
  }
}

// Get bookings for a specific member
export async function fetchMemberBookings(memberId: number): Promise<Booking[]> {
  if (!supabase) {
    return [];
  }

  try {
    const { data, error } = await supabase
      .from("bookings")
      .select("*")
      .eq("member_id", memberId)
      .order("start_time", { ascending: true });

    if (error) {
      console.error("[BookingService] Error fetching member bookings:", error);
      return [];
    }

    return (data || []).map((item: BookingRow) => ({
      id: item.id,
      memberId: item.member_id,
      memberName: item.member_name,
      memberPhone: item.member_phone || undefined,
      title: item.title,
      description: item.description || undefined,
      type: item.type,
      startTime: item.start_time,
      endTime: item.end_time,
      status: item.status,
      instructor: item.instructor || undefined,
      maxParticipants: item.max_participants || undefined,
      currentParticipants: item.current_participants || 0,
      color: item.color || undefined,
      notes: item.notes || undefined,
      created_at: item.created_at,
      updated_at: item.updated_at,
    })) as Booking[];
  } catch (err) {
    console.error("[BookingService] Exception fetching member bookings:", err);
    return [];
  }
}

function sessionKey(b: Booking): string {
  return `${b.title}|${b.startTime}|${b.endTime}|${b.instructor || ""}`;
}

/** Open / group sessions for the member schedule (next N days) */
export async function fetchClassSessions(
  from: Date,
  to: Date
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
    (a, b) =>
      new Date(a.startTime).getTime() - new Date(b.startTime).getTime()
  );
}

export async function bookClassForMember(
  session: ClassSession,
  member: { id: number; name: string; phone: string }
): Promise<{ booking: Booking | null; error: string | null }> {
  if (
    session.maxParticipants &&
    session.bookedCount >= session.maxParticipants
  ) {
    return { booking: null, error: "Η ταξη ειναι γεματη" };
  }

  const mine = await fetchMemberBookings(member.id);
  const already = mine.some(
    (b) =>
      b.status !== "cancelled" &&
      b.title === session.title &&
      b.startTime === session.startTime
  );
  if (already) {
    return { booking: null, error: "Εχεις ηδη κλεισει αυτη τη θεση" };
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
      error: "Αποτυχια κρατησης. Ελεγξε αν υπαρχει ο πινακας bookings.",
    };
  }

  return { booking: created, error: null };
}

export async function cancelMemberBooking(
  bookingId: number,
  memberId: number
): Promise<boolean> {
  const mine = await fetchMemberBookings(memberId);
  const booking = mine.find((b) => b.id === bookingId);
  if (!booking) return false;
  const updated = await updateBooking(bookingId, { status: "cancelled" });
  return !!updated;
}

