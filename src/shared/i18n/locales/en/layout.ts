import type { LocaleShape } from "../../types";
import type el from "../el/layout";

const layout: LocaleShape<typeof el> = {
  nav: {
    dashboard: "Dashboard",
    members: "Members",
    subscriptions: "Subscriptions",
    payments: "Payments",
    debts: "Debts",
    calendar: "Calendar",
    attendance: "Attendance",
    "qr-scanner": "Scan QR Code",
    "view-qr": "View QR Code",
    "print-qr-codes": "Cards",
    notifications: "Notifications",
    announcements: "Announcements",
    settings: "Settings",
    "member-portal": "Member portal",
  },
  topbar: {
    welcome: "Welcome to the management system",
    role: "Administrator",
    openMenu: "Open menu",
    closeMenu: "Close menu",
    notifications: "Notifications",
  },
  notFound: {
    title: "Page not found",
    back: "Back to Dashboard",
  },
};

export default layout;
