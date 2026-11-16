import { createCollection } from "@/shared/api/collection";
import type { Payment, PaymentInput } from "./types";

const payments = createCollection<Payment, PaymentInput>("payments");

export const fetchPayments = (): Promise<Payment[]> =>
  payments.list({ _sort: "id", _order: "desc" });

export const createPayment = (payment: PaymentInput): Promise<Payment | null> =>
  payments.create(payment);

export const updatePayment = (
  id: number,
  updates: Partial<PaymentInput>,
): Promise<Payment | null> => payments.update(id, updates);

export const deletePayment = (id: number): Promise<boolean> =>
  payments.remove(id);
