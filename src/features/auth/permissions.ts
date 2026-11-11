/**
 * Staff roles of the admin app. Members are not staff: they only use the
 * member portal (`/member`) with its own phone-based session.
 */
export const STAFF_ROLES = ["admin", "owner", "trainer"] as const;
export type StaffRole = (typeof STAFF_ROLES)[number];

export type Permission =
  /** Payments, debts, revenue, package prices and editing packages. */
  | "finance"
  /** Gym info, automatic notifications, appearance. */
  | "settings.business"
  /** Messaging providers, credentials, send rate (developer settings). */
  | "settings.dev"
  /** Create, edit and delete staff users (limited by `manageableRoles`). */
  | "staff.manage";

const ROLE_PERMISSIONS: Record<StaffRole, readonly Permission[]> = {
  admin: ["finance", "settings.business", "settings.dev", "staff.manage"],
  owner: ["finance", "settings.business", "staff.manage"],
  trainer: [],
};

/** Roles a user may create, edit, delete or assign. Owners cannot touch admins. */
const MANAGEABLE_ROLES: Record<StaffRole, readonly StaffRole[]> = {
  admin: STAFF_ROLES,
  owner: ["owner", "trainer"],
  trainer: [],
};

export function isStaffRole(value: unknown): value is StaffRole {
  return (
    typeof value === "string" &&
    (STAFF_ROLES as readonly string[]).includes(value)
  );
}

export function hasPermission(
  role: StaffRole | null | undefined,
  permission: Permission,
): boolean {
  return role ? ROLE_PERMISSIONS[role].includes(permission) : false;
}

export function hasAnyPermission(
  role: StaffRole | null | undefined,
  permissions: readonly Permission[],
): boolean {
  return permissions.some((p) => hasPermission(role, p));
}

export function manageableRoles(
  role: StaffRole | null | undefined,
): readonly StaffRole[] {
  return role ? MANAGEABLE_ROLES[role] : [];
}
