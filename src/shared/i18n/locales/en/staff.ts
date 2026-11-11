import type { LocaleShape } from "../../types";
import type el from "../el/staff";

const staff: LocaleShape<typeof el> = {
  page: {
    title: "Users",
    subtitle: "Staff accounts and roles",
    add: "New user",
  },
  fields: {
    email: "Email",
    fullName: "Full name",
    role: "Role",
    lastSignIn: "Last sign in",
    password: "Password",
    newPassword: "New password",
  },
  table: {
    actions: "Actions",
    empty: "No users",
    you: "you",
  },
  form: {
    createTitle: "New user",
    editTitle: "Edit user",
    passwordHint:
      'Initial password (at least {{min}} characters). The user can change it via "Change password".',
    resetPasswordHint: "Leave empty to keep the current password.",
  },
  confirmDelete: "Delete user {{email}}? They will no longer be able to sign in.",
};

export default staff;
