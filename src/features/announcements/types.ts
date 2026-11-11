export interface Announcement {
  id: number;
  title: string;
  body: string;
  audience: "all" | "active" | "expiring" | "members";
  published: boolean;
  created_at: string;
}

export type MessageChannel = "sms" | "viber" | "email" | "both";

export type RecipientGroup =
  | "all"
  | "active"
  | "expiring"
  | "overdue"
  | "monthly"
  | "yearly";

/** An announcement sent from the admin panel during this session. */
export interface SentAnnouncement {
  id: number;
  title: string;
  recipientCount: number;
  channel: string;
  date: string;
  status: "sent" | "scheduled" | "draft";
  successful: number;
}

export interface SendResult {
  success: boolean;
  message: string;
}
