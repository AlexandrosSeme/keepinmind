import type { LocaleShape } from "../../types";
import type el from "../el/attendance";

const attendance: LocaleShape<typeof el> = {
  page: {
    title: "Attendance",
    subtitle: "Manage program attendance and entrance logging",
    searchPlaceholder: "Search...",
  },
  tabs: {
    programs: "Programs & Appointments",
    entranceLogs: "Entrance Logs",
  },
  filters: {
    allCategories: "All categories",
    group: "Group",
    program: "Programs",
    appointment: "Appointments",
    class: "Classes",
    allStatuses: "All statuses",
  },
  fields: {
    date: "Date",
    time: "Time",
    dateTime: "Date/Time",
    program: "Program",
    category: "Category",
    instructor: "Instructor",
    stats: "Stats",
    actions: "Actions",
    member: "Member",
    name: "Name",
    phone: "Phone",
    status: "Status",
    recordedAt: "Recorded At",
    notes: "Notes",
    subscriptionStatus: "Subscription Status",
    validation: "Validation",
    type: "Type",
    message: "Message",
  },
  programs: {
    count_one: "{{count}} program",
    count_other: "{{count}} programs",
    empty: "No programs found",
    record: "Record",
  },
  records: {
    title: "Attendance Records",
    empty: "No records found",
  },
  entrance: {
    refresh: "Refresh logs",
    valid: "{{total}} Valid",
    invalid: "{{total}} Invalid",
    expiringSoon: "{{total}} Expiring Soon",
    empty: "No entrance logs",
    emptyHint: "Entrances from the QR scanner will appear here",
  },
  modal: {
    title: "Record Attendance - {{title}}",
    members: "Members",
    noMembers: "No members",
  },
};

export default attendance;
