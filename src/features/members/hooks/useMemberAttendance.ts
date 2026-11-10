import { useCallback, useEffect, useState } from "react";
import {
  getEntranceLogsByMember,
  type EntranceLog,
} from "@/features/attendance";
import { GREEK_MONTHS_SHORT } from "@/shared/lib/date";

const REFRESH_INTERVAL_MS = 5000;

export interface AttendanceStats {
  thisWeek: number;
  thisMonth: number;
  thisYear: number;
}

function startOfWeek(now: Date): Date {
  const d = new Date(now);
  const day = now.getDay();
  d.setDate(now.getDate() - (day === 0 ? 6 : day - 1)); // Monday-based week
  d.setHours(0, 0, 0, 0);
  return d;
}

function validDates(logs: EntranceLog[]): Date[] {
  return logs
    .map((log) => (log.timestamp ? new Date(log.timestamp) : null))
    .filter((d): d is Date => d !== null && !Number.isNaN(d.getTime()));
}

function computeStats(dates: Date[], now: Date): AttendanceStats {
  const weekStart = startOfWeek(now);
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const yearStart = new Date(now.getFullYear(), 0, 1);
  return {
    thisWeek: dates.filter((d) => d >= weekStart).length,
    thisMonth: dates.filter((d) => d >= monthStart).length,
    thisYear: dates.filter((d) => d >= yearStart).length,
  };
}

/** Counts per month of the current year (always 12 entries). */
function computeMonthly(dates: Date[], now: Date) {
  const year = now.getFullYear();
  const monthly = GREEK_MONTHS_SHORT.map((month) => ({ month, count: 0 }));
  dates.forEach((d) => {
    if (d.getFullYear() === year) monthly[d.getMonth()].count++;
  });
  return monthly;
}

/** Entrance logs + attendance stats for a member, auto-refreshing every few seconds. */
export function useMemberAttendance(memberId: number | undefined) {
  const [entranceLogs, setEntranceLogs] = useState<EntranceLog[]>([]);
  const [stats, setStats] = useState<AttendanceStats>({
    thisWeek: 0,
    thisMonth: 0,
    thisYear: 0,
  });
  const [monthly, setMonthly] = useState<{ month: string; count: number }[]>(
    [],
  );
  const [refreshing, setRefreshing] = useState(false);

  const reload = useCallback(
    async (showLoading = false) => {
      if (memberId === undefined) return;
      if (showLoading) setRefreshing(true);

      try {
        const logs = await getEntranceLogsByMember(memberId);
        const now = new Date();
        const dates = validDates(logs);
        setEntranceLogs(logs);
        setStats(computeStats(dates, now));
        setMonthly(computeMonthly(dates, now));
      } catch (error) {
        console.error("[MemberAttendance] Error loading entrance logs:", error);
      } finally {
        if (showLoading) setRefreshing(false);
      }
    },
    [memberId],
  );

  useEffect(() => {
    if (memberId === undefined) return;
    reload(false);
    const interval = setInterval(() => reload(false), REFRESH_INTERVAL_MS);
    return () => clearInterval(interval);
  }, [memberId, reload]);

  return { entranceLogs, stats, monthly, refreshing, reload };
}
