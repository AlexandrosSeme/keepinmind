import type { Member } from "@/features/members";

export interface ValidationResult {
  valid: boolean;
  member: Member | null;
  message: string;
  reason?: string;
}
