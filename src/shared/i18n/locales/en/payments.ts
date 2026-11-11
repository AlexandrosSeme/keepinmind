import type { LocaleShape } from "../../types";
import type el from "../el/payments";

const payments: LocaleShape<typeof el> = {
  page: {
    title: "Payments",
    newPayment: "New Payment",
    confirmDelete: "Delete payment of €{{amount}} from {{name}}?",
    deleteError: "Delete failed. Make sure the API is running (npm run api).",
    updateError: "Update failed. Make sure the API is running (npm run api).",
    createError:
      "Failed to create payment. Make sure the API is running (npm run api).",
  },
  fields: {
    member: "Member",
    amount: "Amount",
    amountEuro: "Amount (€)",
    date: "Date",
    method: "Method",
    status: "Status",
    fullName: "Full name",
  },
  table: {
    actions: "Actions",
    empty: "No payments yet. Add the first one with “New Payment”.",
    view: "View",
  },
  form: {
    editTitle: "Edit Payment",
    pickMember: "Select member",
    manualEntry: "— Manual entry —",
  },
  details: {
    title: "Payment Details",
  },
  methods: {
    cash: "Cash",
    card: "Card",
    bankTransfer: "Bank Transfer",
    iris: "IRIS",
    other: "Other",
  },
};

export default payments;
