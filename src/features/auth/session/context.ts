import { createContext } from "react";
import type { Permission, StaffRole } from "../permissions";
import type { StaffUser } from "../types";

export interface StaffAuthContextValue {
  /** Null when signed out. */
  profile: StaffUser | null;
  role: StaffRole | null;
  loading: boolean;
  /** True after an explicit sign-out, so the next login starts at the dashboard. */
  signedOut: boolean;
  /** Each resolves to a translated error message, or null on success. */
  login: (email: string, password: string) => Promise<string | null>;
  changePassword: (
    currentPassword: string,
    newPassword: string,
  ) => Promise<string | null>;
  logout: () => void;
  /** Reloads the signed-in user, e.g. after editing their own name. */
  refreshProfile: () => Promise<void>;
  can: (permission: Permission) => boolean;
}

export const StaffAuthContext = createContext<
  StaffAuthContextValue | undefined
>(undefined);
