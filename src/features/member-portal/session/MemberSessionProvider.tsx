import { useEffect, useState, type ReactNode } from "react";
import { fetchMemberById, type Member } from "@/features/members";
import {
  clearMemberSession,
  loadMemberSession,
  loginMemberByPhone,
  type MemberSession,
} from "../api";
import { MemberSessionContext } from "./context";

export default function MemberSessionProvider({
  children,
}: {
  children: ReactNode;
}) {
  const [session, setSession] = useState<MemberSession | null>(null);
  const [member, setMember] = useState<Member | null>(null);
  const [loading, setLoading] = useState(true);

  const refreshMember = async () => {
    const s = loadMemberSession();
    if (!s) {
      setSession(null);
      setMember(null);
      return;
    }
    setSession(s);
    const m = await fetchMemberById(s.memberId);
    setMember(m);
  };

  useEffect(() => {
    (async () => {
      setLoading(true);
      await refreshMember();
      setLoading(false);
    })();
  }, []);

  const login = async (phone: string) => {
    const { member: m, error } = await loginMemberByPhone(phone);
    if (error || !m) return error || "Αποτυχια συνδεσης";
    setSession(loadMemberSession());
    setMember(m);
    return null;
  };

  const logout = () => {
    clearMemberSession();
    setSession(null);
    setMember(null);
  };

  return (
    <MemberSessionContext.Provider
      value={{ session, member, loading, login, logout, refreshMember }}
    >
      {children}
    </MemberSessionContext.Provider>
  );
}
