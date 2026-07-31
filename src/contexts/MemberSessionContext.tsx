import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import type { Member } from "../types";
import {
  clearMemberSession,
  fetchMemberById,
  loadMemberSession,
  loginMemberByPhone,
  type MemberSession,
} from "../services/memberAuthService";

interface MemberSessionContextType {
  session: MemberSession | null;
  member: Member | null;
  loading: boolean;
  login: (phone: string) => Promise<string | null>;
  logout: () => void;
  refreshMember: () => Promise<void>;
}

const MemberSessionContext = createContext<
  MemberSessionContextType | undefined
>(undefined);

export function useMemberSession() {
  const ctx = useContext(MemberSessionContext);
  if (!ctx) {
    throw new Error("useMemberSession must be used within MemberSessionProvider");
  }
  return ctx;
}

export function MemberSessionProvider({ children }: { children: ReactNode }) {
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
