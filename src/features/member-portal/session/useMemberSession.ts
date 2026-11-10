import { useContext } from "react";
import { MemberSessionContext } from "./context";

export function useMemberSession() {
  const ctx = useContext(MemberSessionContext);
  if (!ctx) {
    throw new Error("useMemberSession must be used within MemberSessionProvider");
  }
  return ctx;
}
