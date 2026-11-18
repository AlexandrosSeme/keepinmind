import { parseGRDate } from "@/shared/lib/date";
import type { Payment } from "./types";

export interface MemberPaymentSummary {
  key: string;
  memberId?: number;
  memberName: string;
  firstPaymentDate: string;
  firstPaymentAmount: number;
  lastPaymentDate: string;
  lastPaymentAmount: number;
  /** Sum of completed payments only. */
  totalAmount: number;
  status: Payment["status"];
  /** Most recent payment, used by view / edit / delete. */
  latest: Payment;
}

const stamp = (payment: Payment) =>
  (parseGRDate(payment.date)?.getTime() ?? 0) * 100000 + payment.id;

/** One row per member, from that member's real payment history. */
export function summarizePayments(payments: Payment[]): MemberPaymentSummary[] {
  const groups = new Map<string, Payment[]>();
  for (const payment of payments) {
    const key =
      payment.memberId != null
        ? `id:${payment.memberId}`
        : `name:${payment.memberName}`;
    const list = groups.get(key);
    if (list) list.push(payment);
    else groups.set(key, [payment]);
  }

  return [...groups.entries()].map(([key, list]) => {
    const ordered = [...list].sort((a, b) => stamp(a) - stamp(b));
    const first = ordered[0];
    const last = ordered[ordered.length - 1];
    const totalAmount = ordered.reduce(
      (sum, payment) =>
        payment.status === "completed" ? sum + Number(payment.amount) : sum,
      0,
    );
    return {
      key,
      memberId: last.memberId,
      memberName: last.memberName,
      firstPaymentDate: first.date,
      firstPaymentAmount: Number(first.amount),
      lastPaymentDate: last.date,
      lastPaymentAmount: Number(last.amount),
      totalAmount,
      status: last.status,
      latest: last,
    };
  });
}
