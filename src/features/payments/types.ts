export interface Payment {
  id: number;
  memberName: string;
  amount: number;
  date: string;
  status: "completed" | "pending" | "failed";
  method: string;
}

export type PaymentInput = Omit<Payment, "id">;
