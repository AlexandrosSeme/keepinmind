import { createContext } from "react";
import type { Member } from "@/features/members";
import type { MemberSession } from "../api";

export interface MemberSessionContextValue {
  session: MemberSession | null;
  member: Member | null;
  loading: boolean;
  login: (phone: string) => Promise<string | null>;
  logout: () => void;
  refreshMember: () => Promise<void>;
}

export const MemberSessionContext = createContext<
  MemberSessionContextValue | undefined
>(undefined);
