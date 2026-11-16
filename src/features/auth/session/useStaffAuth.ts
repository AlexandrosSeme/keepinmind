import { useContext } from "react";
import { StaffAuthContext } from "./context";

export function useStaffAuth() {
  const ctx = useContext(StaffAuthContext);
  if (!ctx) {
    throw new Error("useStaffAuth must be used within StaffAuthProvider");
  }
  return ctx;
}
