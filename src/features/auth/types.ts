import type { StaffRole } from "./permissions";

export interface StaffUser {
  id: number;
  email: string;
  fullName: string | null;
  role: StaffRole;
  createdAt: string;
  lastSignInAt: string | null;
}

export interface NewStaffUser {
  email: string;
  fullName: string;
  role: StaffRole;
  password: string;
}

export interface StaffUserUpdate {
  id: number;
  fullName: string;
  role: StaffRole;
  /** Optional reset by an admin/owner; empty keeps the current password. */
  password?: string;
}

/** `code` matches a key of `auth:errors`. */
export type StaffAuthErrorCode =
  | "invalid_credentials"
  | "not_signed_in"
  | "forbidden"
  | "not_found"
  | "invalid_email"
  | "weak_password"
  | "wrong_password"
  | "already_exists"
  | "cannot_change_own_role"
  | "cannot_delete_self"
  | "api_unavailable";

export class StaffAuthError extends Error {
  readonly code: StaffAuthErrorCode;

  constructor(code: StaffAuthErrorCode) {
    super(code);
    this.code = code;
  }
}

export const MIN_PASSWORD_LENGTH = 6;
