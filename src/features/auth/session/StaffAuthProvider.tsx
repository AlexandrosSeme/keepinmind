import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { useQueryClient } from "@tanstack/react-query";
import { changeOwnPassword, getSessionUser, signIn, signOut } from "../api";
import { staffAuthErrorMessage } from "../errors";
import { hasPermission, type Permission } from "../permissions";
import { StaffAuthError, type StaffUser } from "../types";
import { StaffAuthContext, type StaffAuthContextValue } from "./context";

/** Runs an API call; resolves to a translated error message or null. */
async function attempt(action: () => Promise<unknown>): Promise<string | null> {
  try {
    await action();
    return null;
  } catch (error) {
    return staffAuthErrorMessage(error);
  }
}

export default function StaffAuthProvider({
  children,
}: {
  children: ReactNode;
}) {
  const queryClient = useQueryClient();
  const [profile, setProfile] = useState<StaffUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [signedOut, setSignedOut] = useState(false);

  useEffect(() => {
    let active = true;
    getSessionUser()
      .then((user) => {
        if (active) setProfile(user);
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);

  const login = useCallback(
    (email: string, password: string) =>
      attempt(async () => {
        setProfile(await signIn(email, password));
        setSignedOut(false);
      }),
    [],
  );

  const changePassword = useCallback(
    (currentPassword: string, newPassword: string) =>
      attempt(async () => {
        if (!profile) throw new StaffAuthError("not_signed_in");
        await changeOwnPassword(profile, currentPassword, newPassword);
      }),
    [profile],
  );

  const logout = useCallback(() => {
    signOut();
    // Never leak cached data from one staff user to the next.
    queryClient.clear();
    setProfile(null);
    setSignedOut(true);
  }, [queryClient]);

  const refreshProfile = useCallback(async () => {
    setProfile(await getSessionUser());
  }, []);

  const value = useMemo<StaffAuthContextValue>(() => {
    const role = profile?.role ?? null;
    return {
      profile,
      role,
      loading,
      signedOut,
      login,
      changePassword,
      logout,
      refreshProfile,
      can: (permission: Permission) => hasPermission(role, permission),
    };
  }, [profile, loading, signedOut, login, changePassword, logout, refreshProfile]);

  return (
    <StaffAuthContext.Provider value={value}>
      {children}
    </StaffAuthContext.Provider>
  );
}
