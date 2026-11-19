import { useEffect, useMemo } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { countRecords, pingApi } from "@/shared/api/httpClient";
import { parseGRDate } from "@/shared/lib/date";
import { getEntranceLogsBetween, subscribeEntrances } from "@/features/attendance";
import type { EntranceLog } from "@/features/attendance";
import { fetchBookings } from "@/features/bookings";
import { useMembers } from "@/features/members";
import { addDays, startOfDay } from "./lib/analytics";
import type { UpcomingExpiry } from "./types";

export const dashboardKeys = {
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
  "staff",
] as const;
export type CollectionName = (typeof COLLECTIONS)[number];

const LIVE_REFRESH_MS = 60_000;
const CHECKIN_REFRESH_MS = 5_000;

/** Members whose subscription ends within `days` days (today included), soonest first. */
export function useUpcomingExpiries(days = 14) {
  const { members, ...rest } = useMembers();
  const upcomingExpiries = useMemo<UpcomingExpiry[]>(() => {
    const today = startOfDay(new Date());
    return members
      .flatMap((m) => {
        const expiry = parseGRDate(m.expiry);
        if (!expiry || m.card_lost) return [];
        const left = Math.round((startOfDay(expiry).getTime() - today.getTime()) / 86400000);
        if (left < 0 || left > days) return [];
        return [{ id: m.id, name: m.name, phone: m.phone, expiry: m.expiry, days: left, package: m.package }];
      })
      .sort((a, b) => a.days - b.days);
  }, [members, days]);
  return { upcomingExpiries, ...rest };
}

/**
 * Entrance logs of the last `days` days plus today. Past days are loaded once
 * (thousands of rows); only today's check-ins are polled, for the live views.
 */
export function useRecentVisits(days: number) {
  const queryClient = useQueryClient();
  const today = startOfDay(new Date());
  const todayMs = today.getTime();
  const history = useQuery({
    queryKey: dashboardKeys.visitsHistory(days, todayMs),
    queryFn: () => getEntranceLogsBetween(addDays(today, -days), today),
    staleTime: 10 * 60_000,
  });
  const live = useQuery({
    queryKey: dashboardKeys.visitsToday(todayMs),
    queryFn: () => getEntranceLogsBetween(today),
    staleTime: 0,
    refetchInterval: CHECKIN_REFRESH_MS,
    refetchIntervalInBackground: true,
  });

  useEffect(() => {
    return subscribeEntrances((log) => {
      const stamp = new Date(log.timestamp).getTime();
      if (!Number.isFinite(stamp) || stamp < todayMs) return;
      const key = dashboardKeys.visitsToday(todayMs);
      void queryClient.cancelQueries({ queryKey: key });
      queryClient.setQueryData<EntranceLog[]>(key, (current) => {
        const list = current ?? [];
        if (list.some((item) => item.id === log.id)) return list;
        return [...list, log];
      });
      void queryClient.invalidateQueries({ queryKey: key });
    });
  }, [queryClient, todayMs]);
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
