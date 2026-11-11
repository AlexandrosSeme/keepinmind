import type { LocaleShape } from "../../types";
import type el from "../el/dashboard";

const dashboard: LocaleShape<typeof el> = {
  title: "Dashboard",
  all: "All",
  quickActions: {
    member: "Member",
    payment: "Payment",
    qr: "QR",
    debt: "Debt",
  },
  kpi: {
    members: "Members",
    active: "Active",
    expiring: "Expiring",
    debts: "Debts",
    revenue: "Revenue",
    pending: "Pending",
  },
  expiries: {
    title: "Upcoming Expiries",
    empty: "No expiries",
    days: "{{days}}d",
  },
  debts: {
    title: "Debts",
    empty: "No debts",
    days_one: "{{count}} day",
    days_other: "{{count}} days",
    payment: "Payment",
  },
  distribution: {
    title: "Member Distribution",
    empty: "No members yet",
    center: "MEMBERS",
    tooltip_one: "{{label}}: {{count}} member",
    tooltip_other: "{{label}}: {{count}} members",
    labels: {
      active: "Active",
      expiring: "Expiring",
      expired: "Expired",
    },
  },
  revenue: {
    title: "Revenue (6 months)",
    dataset: "Revenue",
    payments: "Payments",
  },
  paymentStatus: {
    title: "Payment status",
    details: "Details",
    completed: "Completed",
    pending: "Pending",
    failed: "Failed",
  },
};

export default dashboard;
