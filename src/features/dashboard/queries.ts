import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { useDebts, type Debt } from "@/features/debts";
import { useMembers, type Member } from "@/features/members";
import { usePayments, type Payment } from "@/features/payments";
import { usePackages, type Package } from "@/features/subscriptions";
import { fetchUpcomingExpiries } from "./api";
import type { Stats, UpcomingExpiry } from "./types";

export const dashboardKeys = {
  upcomingExpiries: ["upcoming-expiries"] as const,
};

export function useUpcomingExpiries() {
  const { data = [], ...rest } = useQuery({
    queryKey: dashboardKeys.upcomingExpiries,
    queryFn: fetchUpcomingExpiries,
  });
  return { upcomingExpiries: data, ...rest };
}

export function computeStats(
  members: Member[],
  packages: Package[],
  upcomingExpiries: UpcomingExpiry[],
  debts: Debt[],
  payments: Payment[],
): Stats {
  const sumAmounts = (status: Payment["status"]) =>
    payments
      .filter((p) => p.status === status)
      .reduce((sum, p) => sum + Number(p.amount || 0), 0);

  return {
    totalMembers: members.length,
    activeSubscriptions: packages.reduce(
      (sum, p) => sum + (p.category === "subscription" ? p.active : 0),
      0,
    ),
    expiringThisWeek: upcomingExpiries.length,
    overdueDebts: debts.filter(
      (d) => d.status === "overdue" || d.status === "critical",
    ).length,
    monthlyRevenue: String(sumAmounts("completed")),
    pendingPayments: String(sumAmounts("pending")),
  };
}

export function useDashboardData() {
  const { members } = useMembers();
  const { packages } = usePackages();
  const { upcomingExpiries } = useUpcomingExpiries();
  const { debts } = useDebts();
  const { payments } = usePayments();

  const stats = useMemo(
    () => computeStats(members, packages, upcomingExpiries, debts, payments),
    [members, packages, upcomingExpiries, debts, payments],
  );

  return { stats, members, upcomingExpiries, debts, payments };
}
