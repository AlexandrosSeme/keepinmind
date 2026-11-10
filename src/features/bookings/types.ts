export type BookingType =
  | "class"
  | "personal_training"
  | "appointment"
  | "event";

export interface Booking {
  id: number;
  memberId: number;
  memberName: string;
  memberPhone?: string;
  title: string;
  description?: string;
  type: BookingType;
  startTime: string; // ISO datetime string
  endTime: string; // ISO datetime string
  status: "confirmed" | "pending" | "cancelled" | "completed";
  instructor?: string;
  maxParticipants?: number;
  currentParticipants?: number;
  color?: string;
  notes?: string;
  created_at?: string;
  updated_at?: string;
}

export interface BookingFormData {
  memberId: number | null;
  title: string;
  description: string;
  type: BookingType;
  startTime: Date;
  endTime: Date;
  instructor: string;
  maxParticipants: number | null;
  notes: string;
}

/** Group class / slot shown in member schedule */
export interface ClassSession {
  key: string;
  title: string;
  description?: string;
  type: BookingType;
  startTime: string;
  endTime: string;
  instructor?: string;
  maxParticipants?: number;
  bookedCount: number;
  color?: string;
  templateId?: number;
}
