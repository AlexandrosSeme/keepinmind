import { api, ApiError, getOrNull, query } from "@/shared/api/httpClient";
import { hasPermission, isStaffRole, manageableRoles } from "./permissions";
import {
  MIN_PASSWORD_LENGTH,
  StaffAuthError,
  type NewStaffUser,
  type StaffUser,
  type StaffUserUpdate,
} from "./types";

/**
 * Staff accounts in the `staff` collection of the local JSON API (db/db.json).
 * json-server has no auth, so passwords are stored in plain text and the role
 * rules below are enforced only here in the client. Fine for local use only.
 */

interface StaffRecord extends StaffUser {
  password: string;
}

const SESSION_KEY = "km.staff.session";
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const toUser = (r: StaffRecord): StaffUser => ({
  id: r.id,
  email: r.email,
  fullName: r.fullName,
  role: r.role,
  createdAt: r.createdAt,
  lastSignInAt: r.lastSignInAt,
});

const normalizeEmail = (email: string) => email.trim().toLowerCase();

/** Maps network/API failures to a friendly error code. */
async function call<T>(action: () => Promise<T>): Promise<T> {
  try {
    return await action();
  } catch (error) {
    if (error instanceof StaffAuthError) throw error;
    if (error instanceof ApiError && error.status === 404) {
      throw new StaffAuthError("not_found");
    }
    throw new StaffAuthError("api_unavailable");
  }
}

const findByEmail = (email: string) =>
  api.get<StaffRecord[]>(`/staff${query({ email: normalizeEmail(email) })}`);

function checkPassword(password: string) {
  if (password.length < MIN_PASSWORD_LENGTH) {
    throw new StaffAuthError("weak_password");
  }
}

/** Throws unless `actor` may manage users with `role`. */
function assertCanManage(actor: StaffUser, role: StaffUser["role"]) {
  if (
    !hasPermission(actor.role, "staff.manage") ||
    !manageableRoles(actor.role).includes(role)
  ) {
    throw new StaffAuthError("forbidden");
  }
}

// ==================== SESSION ====================

export async function getSessionUser(): Promise<StaffUser | null> {
  const id = Number(localStorage.getItem(SESSION_KEY));
  if (!id) return null;
  const record = await getOrNull<StaffRecord>(`/staff/${id}`).catch(() => null);
  if (!record || !isStaffRole(record.role)) {
    localStorage.removeItem(SESSION_KEY);
    return null;
  }
  return toUser(record);
}

export const signIn = (email: string, password: string) =>
  call(async () => {
    const [record] = await findByEmail(email);
    if (!record || record.password !== password || !isStaffRole(record.role)) {
      throw new StaffAuthError("invalid_credentials");
    }
    const updated = await api.patch<StaffRecord>(`/staff/${record.id}`, {
      lastSignInAt: new Date().toISOString(),
    });
    localStorage.setItem(SESSION_KEY, String(record.id));
    return toUser(updated);
  });

export function signOut() {
  localStorage.removeItem(SESSION_KEY);
}

export const changeOwnPassword = (
  actor: StaffUser,
  currentPassword: string,
  newPassword: string,
) =>
  call(async () => {
    const record = await api.get<StaffRecord>(`/staff/${actor.id}`);
    if (record.password !== currentPassword) {
      throw new StaffAuthError("wrong_password");
    }
    checkPassword(newPassword);
    await api.patch(`/staff/${actor.id}`, { password: newPassword });
  });

// ==================== USER MANAGEMENT ====================

export const listStaff = (actor: StaffUser) =>
  call(async () => {
    if (!hasPermission(actor.role, "staff.manage")) {
      throw new StaffAuthError("forbidden");
    }
    const records = await api.get<StaffRecord[]>("/staff");
    return records
      .filter((r) => isStaffRole(r.role))
      .map(toUser)
      .sort((a, b) => a.email.localeCompare(b.email));
  });

export const createStaff = (actor: StaffUser, input: NewStaffUser) =>
  call(async () => {
    assertCanManage(actor, input.role);
    const email = normalizeEmail(input.email);
    if (!EMAIL_RE.test(email)) throw new StaffAuthError("invalid_email");
    checkPassword(input.password);
    if ((await findByEmail(email)).length > 0) {
      throw new StaffAuthError("already_exists");
    }
    const created = await api.post<StaffRecord>("/staff", {
      email,
      password: input.password,
      fullName: input.fullName.trim() || null,
      role: input.role,
      createdAt: new Date().toISOString(),
      lastSignInAt: null,
    });
    return toUser(created);
  });

export const updateStaff = (actor: StaffUser, update: StaffUserUpdate) =>
  call(async () => {
    const target = await api.get<StaffRecord>(`/staff/${update.id}`);
    const isSelf = actor.id === update.id;
    if (isSelf) {
      if (update.role !== target.role) {
        throw new StaffAuthError("cannot_change_own_role");
      }
    } else {
      assertCanManage(actor, target.role);
      assertCanManage(actor, update.role);
    }

    const changes: Partial<StaffRecord> = {
      fullName: update.fullName.trim() || null,
      role: update.role,
    };
    if (update.password) {
      // Own password changes go through changeOwnPassword (needs the current one).
      if (isSelf) throw new StaffAuthError("forbidden");
      checkPassword(update.password);
      changes.password = update.password;
    }
    return toUser(
      await api.patch<StaffRecord>(`/staff/${update.id}`, changes),
    );
  });

export const deleteStaff = (actor: StaffUser, id: number) =>
  call(async () => {
    if (actor.id === id) throw new StaffAuthError("cannot_delete_self");
    const target = await api.get<StaffRecord>(`/staff/${id}`);
    assertCanManage(actor, target.role);
    await api.delete(`/staff/${id}`);
  });
