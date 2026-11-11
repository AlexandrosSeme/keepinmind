import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import type { Member } from "@/features/members";
import type { Payment } from "@/features/payments";
import { monthShort, parseGRDate } from "@/shared/lib/date";
import type { Stats } from "../types";

function lastSixMonthBuckets(lng: string) {
  const now = new Date();
  const buckets: { key: string; label: string }[] = [];
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    buckets.push({
      key: `${d.getFullYear()}-${d.getMonth()}`,
      label: monthShort(d.getMonth(), lng),
    });
  }
  return buckets;
}

/**
 * Chart-ready figures for the dashboard. Falls back to sample data
 * while the payments table is still empty.
 */
export function useDashboardMetrics(
  stats: Stats,
  members: Member[],
  payments: Payment[],
) {
  const { t, i18n } = useTranslation("dashboard");

  const memberDistribution = useMemo(() => {
    const active = members.filter((m) => m.status === "active").length;
    const expiring = members.filter((m) => m.status === "expiring_soon").length;
    const expired = members.filter((m) => m.status === "expired").length;
    const total = active + expiring + expired;
    return {
      series: total > 0 ? [active, expiring, expired] : [0, 0, 0],
      total,
      labels: [
        t("distribution.labels.active"),
        t("distribution.labels.expiring"),
        t("distribution.labels.expired"),
      ],
    };
  }, [members, t]);

  const sampleRevenue = useMemo(() => {
    const base = Math.max(members.length, 8);
    return [72, 85, 78, 98, 105, 118].map((factor) =>
      Math.round(base * factor),
    );
  }, [members.length]);

  const samplePaymentStatus = useMemo(
    () => [
      Math.max(12, Math.round(members.length * 1.4)),
      Math.max(2, Math.round(members.length * 0.25)),
      Math.max(1, Math.round(members.length * 0.08)),
    ],
    [members.length],
  );

  const revenueSeries = useMemo(() => {
    const buckets = lastSixMonthBuckets(i18n.language);
    const totals = buckets.map(() => 0);

    payments.forEach((p) => {
      if (p.status !== "completed") return;
      const d = parseGRDate(p.date);
      if (!d) return;
      const idx = buckets.findIndex(
        (b) => b.key === `${d.getFullYear()}-${d.getMonth()}`,
      );
      if (idx >= 0) totals[idx] += Number(p.amount) || 0;
    });

    const hasReal = totals.some((v) => v > 0);
    return {
      categories: buckets.map((b) => b.label),
      data: hasReal ? totals : sampleRevenue,
      hasReal,
    };
  }, [payments, sampleRevenue, i18n.language]);

  const paymentStatus = useMemo(() => {
    const completed = payments.filter((p) => p.status === "completed").length;
    const pending = payments.filter((p) => p.status === "pending").length;
    const failed = payments.filter((p) => p.status === "failed").length;
    const total = completed + pending + failed;
    const hasReal = total > 0;
    return {
      series: hasReal ? [completed, pending, failed] : samplePaymentStatus,
      hasReal,
    };
  }, [payments, samplePaymentStatus]);

  const latestSample = sampleRevenue[sampleRevenue.length - 1];
  const displayRevenue = revenueSeries.hasReal
    ? stats.monthlyRevenue
    : String(latestSample);
  const displayPending = paymentStatus.hasReal
    ? stats.pendingPayments
    : String(Math.round(latestSample * 0.12));

  return {
    memberDistribution,
    revenueSeries,
    paymentStatus,
    displayRevenue,
    displayPending,
  };
}
