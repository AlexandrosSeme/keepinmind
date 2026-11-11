import type { LocaleShape } from "../../types";
import type el from "../el/debts";

const debts: LocaleShape<typeof el> = {
  page: {
    title: "Debts",
    subtitle: "View and manage overdue debts",
    newDebt: "New Debt",
    confirmDelete: "Delete debt of {{name}} (€{{amount}})?",
    deleteError: "Delete failed. Check the database connection.",
    updateError: "Failed to update debt.",
    createError: "Failed to create debt. Check the database connection.",
  },
  fields: {
    member: "Member",
    amount: "Amount",
    amountEuro: "Amount (€)",
    daysOverdue: "Days overdue",
    status: "Status",
    lastContact: "Last contact",
    fullName: "Full name",
    phone: "Phone",
    email: "Email",
  },
  table: {
    actions: "Actions",
    empty: "No debts yet. Add the first one with “New Debt”.",
    days_one: "{{count}} day",
    days_other: "{{count}} days",
    call: "Call",
    noPhone: "No phone number.",
    noEmail: "No email.",
  },
  form: {
    editTitle: "Edit Debt",
    pickMember: "Select member",
    manualEntry: "— Manual entry —",
  },
};

export default debts;
