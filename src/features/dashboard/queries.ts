import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { countRecords, pingApi } from "@/shared/api/httpClient";
import { getEntranceLogsBetween } from "@/features/attendance";
import { fetchBookings } from "@/features/bookings";
import { fetchUpcomingExpiries } from "./api";
import { addDays, startOfDay } from "./lib/analytics";

export const dashboardKeys = {
  upcomingExpiries: ["upcoming-expiries"] as const,
  visitsHistory: (days: number, today: number) =>
    ["dashboard", "visits", "history", days, today] as const,
  visitsToday: (today: number) => ["dashboard", "visits", "today", today] as const,
  bookings: (from: number, to: number) => ["dashboard", "bookings", from, to] as const,
  health: ["dashboard", "health"] as const,
  counts: ["dashboard", "counts"] as const,
};

/** Collections of the local JSON API, shown in the admin system view. */
export const COLLECTIONS = [
  "members",
  "payments",
  "debts",
  "packages",
  "bookings",
  "entrance_logs",
  "announcements",
  "upcoming_expiries",
  "staff",
] as const;
export type CollectionName = (typeof COLLECTIONS)[number];

const LIVE_REFRESH_MS = 60_000;
const CHECKIN_REFRESH_MS = 30_000;

export function useUpcomingExpiries() {
  const { data = [], ...rest } = useQuery({
    queryKey: dashboardKeys.upcomingExpiries,
    queryFn: fetchUpcomingExpiries,
  });
  return { upcomingExpiries: data, ...rest };
}

/**
 * Entrance logs of the last `days` days plus today. Past days are loaded once
 * (thousands of rows); only today's check-ins are polled, for the live views.
 */
export function useRecentVisits(days: number) {
  const today = startOfDay(new Date());
  const history = useQuery({
    queryKey: dashboardKeys.visitsHistory(days, today.getTime()),
    queryFn: () => getEntranceLogsBetween(addDays(today, -days), today),
    staleTime: 10 * 60_000,
  });
  const live = useQuery({
    queryKey: dashboardKeys.visitsToday(today.getTime()),
    queryFn: () => getEntranceLogsBetween(today),
    refetchInterval: CHECKIN_REFRESH_MS,
  });
  const logs = useMemo(
    () => [...(history.data ?? []), ...(live.data ?? [])],
    [history.data, live.data],
  );
  return { logs, isLoading: history.isLoading || live.isLoading };
}

/** Bookings between today+`fromDays` and today+`toDays` (both inclusive). */
export function useBookingsWindow(fromDays: number, toDays: number) {
  const { data = [], ...rest } = useQuery({
    queryKey: dashboardKeys.bookings(fromDays, toDays),
    queryFn: () => {
      const today = startOfDay(new Date());
      return fetchBookings(addDays(today, fromDays), addDays(today, toDays + 1));
    },
    refetchInterval: LIVE_REFRESH_MS,
  });
  return { bookings: data, ...rest };
}

export function useApiHealth() {
  return useQuery({
    queryKey: dashboardKeys.health,
    queryFn: pingApi,
    refetchInterval: 30_000,
    retry: false,
  });
}

export function useCollectionCounts() {
  const { data, ...rest } = useQuery({
    queryKey: dashboardKeys.counts,
    queryFn: async () => {
      const counts = await Promise.all(COLLECTIONS.map((c) => countRecords(c)));
      return COLLECTIONS.map((name, i) => ({ name, count: counts[i] }));
    },
    refetchInterval: LIVE_REFRESH_MS,
  });
  return { counts: data ?? [], ...rest };
}
