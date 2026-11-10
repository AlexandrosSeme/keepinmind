import React, { useCallback, useEffect, useMemo, useState } from "react";
import moment from "moment";
import { Plus } from "lucide-react";
import { useMembers } from "@/features/members";
import {
  createBooking,
  deleteBooking,
  fetchBookings,
  updateBooking,
} from "../api";
import type { Booking, BookingFormData, BookingType } from "../types";
import {
  GENERAL_CLASS_NAME,
  emptyBookingForm,
  getBookingColor,
} from "../lib/schedule";
import CalendarStats from "../components/CalendarStats";
import ScheduleControls from "../components/ScheduleControls";
import ScheduleGrid from "../components/ScheduleGrid";
import BookingFormModal from "../components/BookingFormModal";
import BookingDetailsModal from "../components/BookingDetailsModal";
import "./CalendarPage.scss";

moment.locale("el");

type FormState = {
  editing: Booking | null;
  initialValues: BookingFormData;
} | null;

const toFormData = (booking: Booking): BookingFormData => ({
  memberId: booking.memberId || null,
  title: booking.title,
  description: booking.description || "",
  type: booking.type,
  startTime: new Date(booking.startTime),
  endTime: new Date(booking.endTime),
  instructor: booking.instructor || "",
  maxParticipants: booking.maxParticipants || null,
  notes: booking.notes || "",
});

const CalendarPage: React.FC = () => {
  const { members } = useMembers();
  const [currentWeek, setCurrentWeek] = useState(moment().startOf("week"));
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState<FormState>(null);
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState<BookingType | "all">("all");
  const [filterCoach, setFilterCoach] = useState("all");

  const coaches = useMemo(
    () =>
      Array.from(
        new Set(bookings.map((b) => b.instructor).filter(Boolean) as string[]),
      ).sort(),
    [bookings],
  );

  const loadBookings = useCallback(async () => {
    setLoading(true);
    try {
      const weekStart = currentWeek.clone().startOf("week").toDate();
      const weekEnd = currentWeek.clone().endOf("week").toDate();
      setBookings(await fetchBookings(weekStart, weekEnd));
    } catch (error) {
      console.error("Error loading bookings:", error);
    } finally {
      setLoading(false);
    }
  }, [currentWeek]);

  useEffect(() => {
    loadBookings();
  }, [loadBookings]);

  const getBookingsForSlot = (day: number, hour: number): Booking[] => {
    const slotStart = currentWeek
      .clone()
      .day(day)
      .hour(hour)
      .minute(0)
      .second(0);
    const slotEnd = slotStart.clone().add(1, "hour");
    const term = searchTerm.toLowerCase();

    return bookings
      .filter((booking) => {
        if (filterType !== "all" && booking.type !== filterType) return false;
        if (filterCoach !== "all" && booking.instructor !== filterCoach)
          return false;
        if (
          term &&
          !booking.title.toLowerCase().includes(term) &&
          !booking.memberName.toLowerCase().includes(term) &&
          !booking.instructor?.toLowerCase().includes(term)
        ) {
          return false;
        }
        return (
          moment(booking.startTime).isBefore(slotEnd) &&
          moment(booking.endTime).isAfter(slotStart)
        );
      })
      .sort((a, b) => moment(a.startTime).diff(moment(b.startTime)));
  };

  const openCreate = (start: Date, end: Date) =>
    setForm({ editing: null, initialValues: emptyBookingForm(start, end) });

  const handleSlotClick = (day: number, hour: number) => {
    const dayDate = currentWeek.clone().day(day);
    openCreate(
      dayDate.clone().hour(hour).minute(0).second(0).toDate(),
      dayDate
        .clone()
        .hour(hour + 1)
        .minute(0)
        .second(0)
        .toDate(),
    );
  };

  const closeAll = () => {
    setForm(null);
    setSelectedBooking(null);
  };

  const findMember = (memberId: number | null) =>
    memberId ? members.find((m) => m.id === memberId) : undefined;

  const handleCreate = async (values: BookingFormData) => {
    if (!values.title.trim() || !values.instructor.trim()) {
      alert("Παρακαλω συμπληρωστε τιτλο και προπονητη");
      return;
    }

    const member = findMember(values.memberId);
    try {
      const created = await createBooking({
        memberId: values.memberId || 0,
        memberName: member?.name || GENERAL_CLASS_NAME,
        memberPhone: member?.phone || undefined,
        title: values.title,
        description: values.description || undefined,
        type: values.type,
        startTime: values.startTime.toISOString(),
        endTime: values.endTime.toISOString(),
        status: "confirmed",
        instructor: values.instructor,
        maxParticipants: values.maxParticipants || undefined,
        color: getBookingColor(values.type),
        notes: values.notes || undefined,
      });
      if (created) {
        await loadBookings();
        closeAll();
      } else {
        alert("Σφαλμα κατα τη δημιουργια κρατησης");
      }
    } catch (error) {
      console.error("Error creating booking:", error);
      alert("Σφαλμα κατα τη δημιουργια κρατησης");
    }
  };

  const handleUpdate = async (editing: Booking, values: BookingFormData) => {
    if (!values.title.trim() || !values.instructor.trim()) return;

    const updates: Partial<Booking> = {
      title: values.title,
      description: values.description || undefined,
      type: values.type,
      startTime: values.startTime.toISOString(),
      endTime: values.endTime.toISOString(),
      instructor: values.instructor,
      maxParticipants: values.maxParticipants || undefined,
      notes: values.notes || undefined,
      color: getBookingColor(values.type),
    };

    const member = findMember(values.memberId);
    if (member) {
      updates.memberId = member.id;
      updates.memberName = member.name;
      updates.memberPhone = member.phone;
    }

    try {
      const updated = await updateBooking(editing.id, updates);
      if (updated) {
        await loadBookings();
        closeAll();
      } else {
        alert("Σφαλμα κατα την ενημερωση κρατησης");
      }
    } catch (error) {
      console.error("Error updating booking:", error);
      alert("Σφαλμα κατα την ενημερωση κρατησης");
    }
  };

  const handleDelete = async (bookingId: number) => {
    if (
      !window.confirm(
        "Ειστε σιγουροι οτι θελετε να διαγραψετε αυτη την κρατηση;",
      )
    )
      return;

    try {
      const success = await deleteBooking(bookingId);
      if (success) {
        await loadBookings();
        setSelectedBooking(null);
      } else {
        alert("Σφαλμα κατα τη διαγραφη κρατησης");
      }
    } catch (error) {
      console.error("Error deleting booking:", error);
      alert("Σφαλμα κατα τη διαγραφη κρατησης");
    }
  };

  const stats = useMemo(() => {
    const today = moment().startOf("day");
    const weekStart = currentWeek.clone().startOf("week");
    const weekEnd = currentWeek.clone().endOf("week");
    return {
      total: bookings.length,
      today: bookings.filter((b) => moment(b.startTime).isSame(today, "day"))
        .length,
      thisWeek: bookings.filter((b) =>
        moment(b.startTime).isBetween(weekStart, weekEnd, "day", "[]"),
      ).length,
      coaches: coaches.length,
    };
  }, [bookings, currentWeek, coaches]);

  return (
    <div className="schedule-container">
      <div className="schedule-header">
        <div className="header-content">
          <div>
            <h2 className="page-title">Προγραμμα Προπονησεων</h2>
            <p className="page-subtitle">
              Ταξεις & Προπονησεις - Εβδομαδιαιο Προγραμμα
            </p>
          </div>
          <button
            className="btn btn-primary btn-add-booking"
            onClick={() =>
              openCreate(new Date(), moment().add(1, "hour").toDate())
            }
          >
            <Plus size={20} />
            Νεα Ταξη/Προπονηση
          </button>
        </div>
      </div>

      <CalendarStats {...stats} />

      <ScheduleControls
        currentWeek={currentWeek}
        onPrevWeek={() =>
          setCurrentWeek((prev) => prev.clone().subtract(1, "week"))
        }
        onNextWeek={() => setCurrentWeek((prev) => prev.clone().add(1, "week"))}
        onToday={() => setCurrentWeek(moment().startOf("week"))}
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        filterType={filterType}
        onFilterTypeChange={setFilterType}
        filterCoach={filterCoach}
        onFilterCoachChange={setFilterCoach}
        coaches={coaches}
      />

      <ScheduleGrid
        currentWeek={currentWeek}
        loading={loading}
        getBookingsForSlot={getBookingsForSlot}
        onSlotClick={handleSlotClick}
        onBookingClick={setSelectedBooking}
      />

      {form && (
        <BookingFormModal
          isEdit={Boolean(form.editing)}
          initialValues={form.initialValues}
          members={members}
          onClose={closeAll}
          onSubmit={(values) =>
            form.editing
              ? handleUpdate(form.editing, values)
              : handleCreate(values)
          }
        />
      )}

      {selectedBooking && !form && (
        <BookingDetailsModal
          booking={selectedBooking}
          onClose={() => setSelectedBooking(null)}
          onEdit={() =>
            setForm({
              editing: selectedBooking,
              initialValues: toFormData(selectedBooking),
            })
          }
          onDelete={() => handleDelete(selectedBooking.id)}
        />
      )}
    </div>
  );
};

export default CalendarPage;
