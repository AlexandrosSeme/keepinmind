import { supabase } from "@/shared/api/supabaseClient";
import { logger } from "@/shared/lib/logger";
import type { MemberStatus } from "@/features/members";
import type { EntranceLog } from "./types";

/** Row shape of the `entrance_logs` table. */
interface EntranceLogRow {
  id: number;
  member_id: number;
  member_name: string;
  member_phone: string;
  member_status: EntranceLog["memberStatus"];
  validation_status: EntranceLog["validationStatus"];
  validation_message: string;
  entrance_type: EntranceLog["entranceType"];
  notes: string | null;
  timestamp?: string | null;
  created_at?: string | null;
}

type EntranceLogInsert = Omit<
  EntranceLogRow,
  "id" | "timestamp" | "created_at"
>;

// In-memory fallback when Supabase is unavailable or the table is missing.
let entranceLogsCache: EntranceLog[] = [];

const fromRow = (row: EntranceLogRow): EntranceLog => ({
  id: row.id,
  memberId: row.member_id,
  memberName: row.member_name,
  memberPhone: row.member_phone,
  memberStatus: row.member_status,
  validationStatus: row.validation_status,
  validationMessage: row.validation_message,
  entranceType: row.entrance_type,
  timestamp: row.timestamp || row.created_at || new Date().toISOString(),
  notes: row.notes || undefined,
});

function addToCache(logData: EntranceLogInsert): EntranceLog {
  const log = fromRow({ ...logData, id: entranceLogsCache.length + 1 });
  entranceLogsCache.unshift(log);
  return log;
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
  const logData: EntranceLogInsert = {
    member_id: memberId,
    member_name: memberName,
    member_phone: memberPhone,
    member_status: memberStatus,
    validation_status: validationStatus,
    validation_message: validationMessage,
    entrance_type: entranceType,
    notes: notes || null,
  };

  if (!supabase) return addToCache(logData);

  try {
    logger.debug("[EntranceLog] Saving entrance log to Supabase:", logData);
    const { data, error } = await supabase
      .from("entrance_logs")
      .insert([logData])
      .select()
      .single();

    if (error) {
      console.error("[EntranceLog] Error saving to Supabase:", error);
      return addToCache(logData);
    }

    if (data) {
      const log = fromRow(data as EntranceLogRow);
      entranceLogsCache.unshift(log);
      return log;
    }
  } catch (err) {
    console.error("[EntranceLog] Exception saving to Supabase:", err);
    return addToCache(logData);
  }

  return addToCache(logData);
}

export async function getEntranceLogs(): Promise<EntranceLog[]> {
  if (!supabase) return [...entranceLogsCache];

  try {
    const { data, error } = await supabase
      .from("entrance_logs")
      .select("*")
      .order("timestamp", { ascending: false, nullsFirst: false })
      .limit(1000);

    if (error) {
      console.error("[EntranceLog] Error fetching from Supabase:", error);
      return [...entranceLogsCache];
    }

    if (data && data.length > 0) {
      entranceLogsCache = (data as EntranceLogRow[]).map(fromRow);
    }
    return [...entranceLogsCache];
  } catch (err) {
    console.error("[EntranceLog] Exception fetching from Supabase:", err);
    return [...entranceLogsCache];
  }
}

export async function getEntranceLogsByMember(
  memberId: number,
): Promise<EntranceLog[]> {
  const fromCache = () =>
    entranceLogsCache.filter((log) => log.memberId === memberId);
  if (!supabase) return fromCache();

  try {
    const { data, error } = await supabase
      .from("entrance_logs")
      .select("*")
      .eq("member_id", memberId)
      .order("timestamp", { ascending: false })
      .limit(100);

    if (error) {
      console.error("[EntranceLog] Error fetching by member:", error);
      return fromCache();
    }

    if (data && data.length > 0) {
      return (data as EntranceLogRow[]).map(fromRow);
    }
  } catch (err) {
    console.error("[EntranceLog] Exception fetching by member:", err);
  }

  return fromCache();
}
