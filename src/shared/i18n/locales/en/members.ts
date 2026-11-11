import type { LocaleShape } from "../../types";
import type el from "../el/members";

const members: LocaleShape<typeof el> = {
  page: {
    title: "Gym Members",
    newMember: "New Member",
    searchPlaceholder: "Search members (name, phone)...",
    filters: "Filters",
    export: "Export",
    addTitle: "Add New Member",
    editTitle: "Edit Member",
  },
  confirmDelete: "Are you sure you want to delete this member?",
  fields: {
    name: "Full Name",
    phone: "Phone",
    email: "Email",
    status: "Status",
    package: "Package",
    expiry: "Expiry",
    expiryDate: "Expiry Date",
    photo: "Profile Photo",
    actions: "Actions",
    yearAttendance: "Visits this year",
    notSet: "Not set",
  },
  actions: {
    view: "View",
    activateCard: "Activate Card",
    printNewCard: "Print New Card",
    cancelCard: "Cancel Card",
    cancelCardLost: "Cancel Card (Lost)",
  },
  cardLost: {
    confirmActivate: "Are you sure you want to activate {{name}}'s card?",
    confirmCancel:
      "Are you sure you want to cancel {{name}}'s card?\n\nThe card will be unusable until a new one is printed.",
    activated: "{{name}}'s card was activated successfully.",
    cancelled: "{{name}}'s card was cancelled. You can now print a new card.",
  },
  details: {
    title: "Member Details",
    backToList: "Back to List",
    errors: {
      noId: "Member ID not found",
      noDb: "The database connection is not available",
      notFoundById: "No member found with this ID",
      load: "Error loading data",
      notFound: "Member not found",
    },
  },
  attendance: {
    title: "Visits",
    chartTitle: "Visits per month",
    tooltip_one: "{{count}} visit",
    tooltip_other: "{{count}} visits",
    week: "Week",
    month: "Month",
    year: "Year",
  },
  logs: {
    empty: "No records",
    date: "Date",
    method: "Method",
    status: "Status",
    message: "Message",
  },
};

export default members;
