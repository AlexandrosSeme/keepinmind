import type { MemberStatus } from "@/features/members";

export interface Program {
  id: number;
  title: string;
  date: string;
  time: string;
  type: "group" | "program" | "appointment" | "class";
  instructor?: string;
  maxParticipants?: number;
}

export interface AttendanceRecord {
  id: number;
  programId?: number;
  memberId: number;
  memberName: string;
  status: "attended" | "absent" | "cancelled";
  recordedAt: string;
  notes?: string;
}

export interface EntranceLog {
  id: number;
  memberId: number;
  memberName: string;
  memberPhone: string;
  memberStatus: MemberStatus;
  validationStatus: "valid" | "invalid" | "expiring_soon";
  validationMessage: string;
  entranceType: "qr_scan" | "manual";
  timestamp: string;
  notes?: string;
}
