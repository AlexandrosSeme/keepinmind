import type { LocaleShape } from "../../types";
import type el from "../el/bookings";

const bookings: LocaleShape<typeof el> = {
  page: {
    title: "Training Schedule",
    subtitle: "Classes & Sessions - Weekly Schedule",
    newSession: "New Class/Session",
  },
  stats: {
    total: "Total Sessions",
    today: "Today",
    thisWeek: "This Week",
    coaches: "Coaches",
  },
  controls: {
    today: "Today",
    searchPlaceholder: "Search class, coach or member...",
    allTypes: "All types",
    allCoaches: "All coaches",
  },
  grid: {
    loading: "Loading schedule...",
  },
  days: {
    "0": "Monday",
    "1": "Tuesday",
    "2": "Wednesday",
    "3": "Thursday",
    "4": "Friday",
    "5": "Saturday",
    "6": "Sunday",
  },
  types: {
    class: "Class",
    personal_training: "Personal Training",
    appointment: "Appointment",
    event: "Event",
  },
  details: {
    coach: "Coach",
    type: "Type",
    dateTime: "Date & Time",
    member: "Member",
    participants: "Participants",
    description: "Description",
    notes: "Notes",
  },
  form: {
    editTitle: "Edit Session",
    createTitle: "New Class/Session",
    title: "Class/Session Title",
    titlePlaceholder: "e.g. Boxing Class, Muay Thai, Personal Training",
    coach: "Coach",
    coachPlaceholder: "Coach name",
    type: "Type",
    start: "Start",
    end: "End",
    memberOptional: "Member (Optional)",
    generalClass: "General Class (No specific member)",
    maxParticipants: "Maximum Participants",
    unlimited: "Unlimited",
    description: "Description",
    descriptionPlaceholder: "Class/session description...",
    notes: "Notes",
    notesPlaceholder: "Internal notes...",
  },
  alerts: {
    requiredFields: "Please fill in the title and coach",
    createError: "Error creating booking",
    updateError: "Error updating booking",
    deleteConfirm: "Are you sure you want to delete this booking?",
    deleteError: "Error deleting booking",
  },
  errors: {
    classFull: "The class is full",
    alreadyBooked: "You have already booked this slot",
    bookingFailed: "Booking failed. Check that the bookings table exists.",
  },
};

export default bookings;
