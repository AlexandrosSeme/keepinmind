import { createCollection } from "@/shared/api/collection";
import { logger } from "@/shared/lib/logger";
import type { MemberStatus } from "@/features/members";
import type { EntranceLog } from "./types";

const entranceLogs = createCollection<EntranceLog>("entrance_logs");

// In-memory fallback when the JSON API is unavailable.
let entranceLogsCache: EntranceLog[] = [];

function addToCache(log: Omit<EntranceLog, "id">): EntranceLog {
  const cached = { ...log, id: entranceLogsCache.length + 1 };
  entranceLogsCache.unshift(cached);
  return cached;
}

export async function logEntrance(
  memberId: number,
  memberName: string,
  memberPhone: string,
  memberStatus: MemberStatus,
  validationStatus: EntranceLog["validationStatus"],
  validationMessage: string,
  entranceType: EntranceLog["entranceType"],
  notes?: string,
): Promise<EntranceLog | null> {
  const logData: Omit<EntranceLog, "id"> = {
    memberId,
    memberName,
    memberPhone,
    memberStatus,
    validationStatus,
    validationMessage,
    entranceType,
    timestamp: new Date().toISOString(),
    notes: notes || undefined,
  };

  logger.debug("[EntranceLog] Saving entrance log:", logData);
  const saved = await entranceLogs.create(logData);
  if (!saved) return addToCache(logData);

  entranceLogsCache.unshift(saved);
  return saved;
}

export async function getEntranceLogs(): Promise<EntranceLog[]> {
  try {
    const data = await entranceLogs.list({
      _sort: "timestamp",
      _order: "desc",
      _limit: 1000,
    });
    if (data.length > 0) entranceLogsCache = data;
  } catch (err) {
    logger.error("[EntranceLog] Error fetching logs:", err);
  }
  return [...entranceLogsCache];
}

export async function getEntranceLogsByMember(
  memberId: number,
): Promise<EntranceLog[]> {
  try {
    const data = await entranceLogs.list({
      memberId,
      _sort: "timestamp",
      _order: "desc",
      _limit: 100,
    });
    if (data.length > 0) return data;
  } catch (err) {
    logger.error("[EntranceLog] Error fetching by member:", err);
  }
  return entranceLogsCache.filter((log) => log.memberId === memberId);
}

/** Entrance logs with `from <= timestamp < to` (oldest first), for dashboards and trends. */
export function getEntranceLogsBetween(from: Date, to?: Date): Promise<EntranceLog[]> {
  return entranceLogs.list({
    timestamp_gte: from.toISOString(),
    timestamp_lte: to ? new Date(to.getTime() - 1).toISOString() : undefined,
    _sort: "timestamp",
    _order: "asc",
  });
}