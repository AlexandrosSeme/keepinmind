import type { LocaleShape } from "../../types";
import type el from "../el/auth";

const auth: LocaleShape<typeof el> = {
  roles: {
    admin: "Administrator (Dev)",
    owner: "Owner",
    trainer: "Trainer",
  },
  logout: "Sign out",
  fields: {
    email: "Email",
    password: "Password",
    confirmPassword: "Confirm password",
    passwordHint: "At least {{min}} characters.",
  },
  login: {
    subtitle: "Staff sign in",
    submit: "Sign in",
    submitting: "Signing in...",
    forgotHint:
      "Forgot your password? Ask the administrator or the owner to reset it.",
    memberHint: "Are you a member?",
    memberLink: "Go to the member portal",
  },
  changePassword: {
    title: "Change password",
    current: "Current password",
    new: "New password",
    success: "Your password has been changed.",
  },
  errors: {
    invalid_credentials: "Wrong email or password.",
    not_signed_in: "Your session has expired. Please sign in again.",
    forbidden: "You are not allowed to do this.",
    not_found: "User not found.",
    invalid_email: "Invalid email.",
    weak_password: "The password must be at least {{min}} characters.",
    wrong_password: "The current password is wrong.",
    password_mismatch: "The passwords do not match.",
    already_exists: "A user with this email already exists.",
    cannot_change_own_role: "You cannot change your own role.",
    cannot_delete_self: "You cannot delete yourself.",
    api_unavailable:
      'Cannot reach the API. Make sure "npm run api" is running.',
    generic: "Error: {{message}}",
  },
  forbidden: {
    title: "Access denied",
    text: "Your role does not allow viewing this page.",
    back: "Back to Dashboard",
  },
};

export default auth;
