import { parseGRDate } from "@/shared/lib/date";
import { normalizePhone } from "@/shared/lib/phone";
import type { Booking } from "@/features/bookings";
import type { Debt } from "@/features/debts";
import type { EntranceLog } from "@/features/attendance";
import type { Member } from "@/features/members";
import type { Payment } from "@/features/payments";
import type { Package } from "@/features/subscriptions";
import type { UpcomingExpiry } from "../types";

/** Pure aggregations behind the role dashboards (no React, easy to test). */

const DAY_MS = 86400000;

export const startOfDay = (d: Date) =>
  new Date(d.getFullYear(), d.getMonth(), d.getDate());
export const addDays = (d: Date, days: number) =>
  new Date(d.getTime() + days * DAY_MS);
export const sameDay = (a: Date, b: Date) =>
  startOfDay(a).getTime() === startOfDay(b).getTime();
const sum = (values: number[]) => values.reduce((s, v) => s + v, 0);

/** % change from `previous` to `current`; null when there is no baseline. */
export function percentChange(current: number, previous: number): number | null {
  if (!previous) return null;
  return Math.round(((current - previous) / previous) * 100);
}

// ==================== REVENUE ====================

const paymentDate = (p: Payment) => parseGRDate(p.date);

/** Completed / pending totals for the last `months` calendar months (oldest first). */
export function revenueByMonth(payments: Payment[], months: number, now = new Date()) {
  const buckets = Array.from({ length: months }, (_, i) => {
    const d = new Date(now.getFullYear(), now.getMonth() - (months - 1 - i), 1);
    return { month: d.getMonth(), year: d.getFullYear(), completed: 0, pending: 0 };
  });
  payments.forEach((p) => {
    const d = paymentDate(p);
    if (!d) return;
    const bucket = buckets.find((b) => b.month === d.getMonth() && b.year === d.getFullYear());
    if (!bucket) return;
    if (p.status === "completed") bucket.completed += Number(p.amount) || 0;
    if (p.status === "pending") bucket.pending += Number(p.amount) || 0;
  });
  return buckets;
}

/** Month-to-date revenue vs the same days of the previous month. */
export function monthToDate(payments: Payment[], now = new Date()) {
  const day = now.getDate();
  let current = 0;
  let previous = 0;
  const prev = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  payments.forEach((p) => {
    const d = paymentDate(p);
    if (!d || p.status !== "completed" || d.getDate() > day) return;
    const amount = Number(p.amount) || 0;
    if (d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear()) {
      current += amount;
    } else if (d.getMonth() === prev.getMonth() && d.getFullYear() === prev.getFullYear()) {
      previous += amount;
    }
  });
  return { current, previous, change: percentChange(current, previous) };
}

const completedWithin = (payments: Payment[], days: number, now: Date) => {
  const from = addDays(startOfDay(now), -days);
  return payments.filter((p) => {
    const d = paymentDate(p);
    return d !== null && d >= from && p.status === "completed";
  });
};

/** Completed revenue per package over the last `days` (payments matched to members by name). */
export function revenueByPackage(
  payments: Payment[],
  members: Member[],
  days: number,
  now = new Date(),
) {
  const packageOf = new Map(members.map((m) => [m.name, m.package]));
  const totals = new Map<string, number>();
  completedWithin(payments, days, now).forEach((p) => {
    const key = packageOf.get(p.memberName) ?? "—";
    totals.set(key, (totals.get(key) ?? 0) + (Number(p.amount) || 0));
  });
  return [...totals.entries()].sort((a, b) => b[1] - a[1]);
}

/** Completed revenue per payment method over the last `days`. */
export function revenueByMethod(payments: Payment[], days: number, now = new Date()) {
  const totals = new Map<string, number>();
  completedWithin(payments, days, now).forEach((p) => {
    totals.set(p.method, (totals.get(p.method) ?? 0) + (Number(p.amount) || 0));
  });
  return [...totals.entries()].sort((a, b) => b[1] - a[1]);
}

// ==================== DEBTS & RENEWALS ====================

export function debtAging(debts: Debt[]) {
  const group = (status: Debt["status"]) => {
    const rows = debts.filter((d) => d.status === status);
    return { count: rows.length, amount: sum(rows.map((d) => Number(d.amount) || 0)) };
  };
  return {
    overdue: group("overdue"),
    warning: group("warning"),
    critical: group("critical"),
    total: sum(debts.map((d) => Number(d.amount) || 0)),
  };
}

/** Value of the renewals coming up (package price of each expiring member). */
export function renewalValue(upcoming: UpcomingExpiry[], packages: Package[]) {
  const price = new Map(packages.map((p) => [p.name, Number(p.price) || 0]));
  return sum(upcoming.map((u) => price.get(u.package) ?? 0));
}

// ==================== VISITS ====================

const logDate = (l: EntranceLog) => new Date(l.timestamp);
const admitted = (l: EntranceLog) => l.validationStatus !== "invalid";

/** Admitted visits per day for the last `days` days including today (oldest first). */
export function visitsByDay(logs: EntranceLog[], days: number, now = new Date()) {
  const first = addDays(startOfDay(now), -(days - 1));
  const counts = Array.from({ length: days }, (_, i) => ({
    date: addDays(first, i),
    count: 0,
  }));
  logs.forEach((l) => {
    if (!admitted(l)) return;
    const index = Math.round(
      (startOfDay(logDate(l)).getTime() - first.getTime()) / DAY_MS,
    );
    if (index >= 0 && index < days) counts[index].count += 1;
  });
  return counts;
}

/** Admitted visits per hour (0-23) on `day`. */
export function visitsByHour(logs: EntranceLog[], day: Date) {
  const hours = Array<number>(24).fill(0);
  logs.forEach((l) => {
    const d = logDate(l);
    if (admitted(l) && sameDay(d, day)) hours[d.getHours()] += 1;
  });
  return hours;
}

/** Average admitted visits per hour on the same weekday as `day`, over the previous `weeks` weeks. */
export function averageVisitsByHour(logs: EntranceLog[], day: Date, weeks: number) {
  const from = addDays(startOfDay(day), -weeks * 7);
  const to = startOfDay(day);
  const hours = Array<number>(24).fill(0);
  const days = new Set<number>();
  logs.forEach((l) => {
    const d = logDate(l);
    if (admitted(l) && d >= from && d < to && d.getDay() === day.getDay()) {
      hours[d.getHours()] += 1;
      days.add(startOfDay(d).getTime());
    }
  });
  // Divide by the days actually loaded (older days may be outside the fetched window).
  const count = Math.max(1, days.size);
  return hours.map((h) => Math.round((h / count) * 10) / 10);
}

/** Distinct members admitted in the last `minutes` (a proxy for "in the gym now"). */
export function presentNow(logs: EntranceLog[], minutes: number, now = new Date()) {
  const from = now.getTime() - minutes * 60000;
  return new Set(
    logs
      .filter((l) => admitted(l) && logDate(l).getTime() >= from)
      .map((l) => l.memberId),
  ).size;
}

/** Non-expired members who have not visited for `days` days, longest absence first. */
export function inactiveMembers(
  members: Member[],
  logs: EntranceLog[],
  days: number,
  now = new Date(),
) {
  const lastVisit = new Map<number, number>();
  logs.forEach((l) => {
    if (!admitted(l)) return;
    const t = logDate(l).getTime();
    if (t > (lastVisit.get(l.memberId) ?? 0)) lastVisit.set(l.memberId, t);
  });
  const threshold = now.getTime() - days * DAY_MS;
  return members
    .filter((m) => m.status !== "expired" && !m.card_lost)
    .map((m) => ({ member: m, lastVisit: lastVisit.get(m.id) ?? null }))
    .filter((r) => r.lastVisit === null || r.lastVisit < threshold)
    .sort((a, b) => (a.lastVisit ?? 0) - (b.lastVisit ?? 0));
}

// ==================== CLASSES ====================

export interface ClassSlot {
  key: string;
  title: string;
  type: Booking["type"];
  start: Date;
  end: Date;
  instructor?: string;
  max: number | null;
  booked: number;
}

/** Groups bookings into sessions (same title + start) and counts real participants. */
export function classSlots(bookings: Booking[]): ClassSlot[] {
  const slots = new Map<string, ClassSlot>();
  bookings.forEach((b) => {
    if (b.status === "cancelled") return;
    const key = `${b.title}|${b.startTime}`;
    const slot = slots.get(key) ?? {
      key,
      title: b.title,
      type: b.type,
      start: new Date(b.startTime),
      end: new Date(b.endTime),
      instructor: b.instructor,
      max: b.maxParticipants ?? null,
      booked: 0,
    };
    if (b.memberId > 0) slot.booked += 1;
    slots.set(key, slot);
  });
  return [...slots.values()].sort((a, b) => a.start.getTime() - b.start.getTime());
}

/** Average fill rate (%) per class title, over slots that have a capacity. */
export function occupancyByClass(slots: ClassSlot[]) {
  const totals = new Map<string, { booked: number; capacity: number }>();
  slots.forEach((s) => {
    if (!s.max || s.type !== "class") return;
    const t = totals.get(s.title) ?? { booked: 0, capacity: 0 };
    t.booked += s.booked;
    t.capacity += s.max;
    totals.set(s.title, t);
  });
  return [...totals.entries()]
    .map(([title, t]) => ({ title, rate: Math.round((t.booked / t.capacity) * 100) }))
    .sort((a, b) => b.rate - a.rate);
}

export interface TrainerStats {
  name: string;
  sessions: number;
  bookings: number;
  /** Average fill (%) over sessions with a capacity; null when none. */
  fill: number | null;
  next: ClassSlot | null;
}

/** Workload per instructor over the given slots (e.g. the next 7 days). */
export function trainerStats(slots: ClassSlot[], now = new Date()): TrainerStats[] {
  const byName = new Map<string, ClassSlot[]>();
  slots.forEach((s) => {
    if (!s.instructor) return;
    byName.set(s.instructor, [...(byName.get(s.instructor) ?? []), s]);
  });
  return [...byName.entries()]
    .map(([name, list]) => {
      const capped = list.filter((s) => s.max);
      const booked = capped.reduce((n, s) => n + s.booked, 0);
      const capacity = capped.reduce((n, s) => n + (s.max ?? 0), 0);
      return {
        name,
        sessions: list.length,
        bookings: list.reduce((n, s) => n + s.booked, 0),
        fill: capacity ? Math.round((booked / capacity) * 100) : null,
        next: list.find((s) => s.end > now) ?? null,
      };
    })
    .sort((a, b) => b.sessions - a.sessions || a.name.localeCompare(b.name));
}
// ==================== DATA QUALITY (admin) ====================

export interface QualityCheck {
  key:
    | "missingEmail"
    | "invalidPhone"
    | "duplicatePhone"
    | "statusMismatch"
    | "cardLost"
    | "orphanPayments"
    | "orphanDebts";
  count: number;
  severity: "info" | "warning" | "danger";
}

export function dataQuality(
  members: Member[],
  payments: Payment[],
  debts: Debt[],
  now = new Date(),
): QualityCheck[] {
  const today = startOfDay(now);
  const phones = new Map<string, number>();
  members.forEach((m) => {
    const p = normalizePhone(m.phone);
    phones.set(p, (phones.get(p) ?? 0) + 1);
  });
  const names = new Set(members.map((m) => m.name));
  const statusMismatch = members.filter((m) => {
    const expiry = parseGRDate(m.expiry);
    if (!expiry) return true;
    return expiry < today !== (m.status === "expired");
  }).length;

  return [
    { key: "missingEmail", count: members.filter((m) => !m.email).length, severity: "info" },
    {
      key: "invalidPhone",
      count: members.filter((m) => normalizePhone(m.phone).length !== 10).length,
      severity: "warning",
    },
    {
      key: "duplicatePhone",
      count: [...phones.values()].filter((c) => c > 1).reduce((s, c) => s + c, 0),
      severity: "danger",
    },
    { key: "statusMismatch", count: statusMismatch, severity: "warning" },
    { key: "cardLost", count: members.filter((m) => m.card_lost).length, severity: "info" },
    {
      key: "orphanPayments",
      count: payments.filter((p) => !names.has(p.memberName)).length,
      severity: "warning",
    },
    {
      key: "orphanDebts",
      count: debts.filter((d) => !names.has(d.name)).length,
      severity: "warning",
    },
  ];
}
