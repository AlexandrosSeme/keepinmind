export interface Debt {
  id: number;
  name: string;
  amount: number;
  daysOverdue: number;
  status: "overdue" | "warning" | "critical";
  lastContact?: string;
  phone?: string;
  email?: string;
}

export type DebtInput = Omit<Debt, "id">;
