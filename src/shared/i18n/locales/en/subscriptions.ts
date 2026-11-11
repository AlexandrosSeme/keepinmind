import type { LocaleShape } from "../../types";
import type el from "../el/subscriptions";

const subscriptions: LocaleShape<typeof el> = {
  page: {
    title: "Subscription Packages",
    newPackage: "New Package",
    emptyTitle: "No subscription packages",
    emptyText: "Create your first subscription package to get started",
    createPackage: "Create Package",
  },
  confirmDelete: "Are you sure you want to delete the package “{{name}}”?",
  errors: {
    delete: "Delete failed. Check the database connection.",
    update: "Failed to update package.",
    create: "Failed to create package. Check the database connection.",
  },
  fields: {
    name: "Package name",
    namePlaceholder: "e.g. Monthly Unlimited",
    category: "Category",
    duration: "Duration",
    durationPlaceholder: "e.g. 30 days / 10 visits",
    price: "Price (€)",
    activeMembers: "Active members",
  },
  form: {
    newTitle: "New Package",
    editTitle: "Edit Package",
  },
};

export default subscriptions;
