export interface Payment {
  id: number;
  /** Set when the payment was recorded for a known member. */
  memberId?: number;
  memberName: string;
  /** Package the payment renews (snapshot at payment time). */
  package?: string;
  amount: number;
  date: string;
  status: "completed" | "pending" | "failed";
  method: string;
}

export type PaymentInput = Omit<Payment, "id">;
