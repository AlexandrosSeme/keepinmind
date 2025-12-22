import { supabase } from "../lib/supabaseClient";
import type { EntranceLog } from "../types";

// In-memory fallback storage
let entranceLogsCache: EntranceLog[] = [];

export async function logEntrance(
  memberId: number,
  memberName: string,
  memberPhone: string,
  memberStatus: 'active' | 'expiring_soon' | 'expired',
  validationStatus: 'valid' | 'invalid' | 'expiring_soon',
  validationMessage: string,
  entranceType: 'qr_scan' | 'manual',
  notes?: string
): Promise<EntranceLog | null> {
  const logData = {
    member_id: memberId,
    member_name: memberName,
    member_phone: memberPhone,
    member_status: memberStatus,
    validation_status: validationStatus,
    validation_message: validationMessage,
    entrance_type: entranceType,
    notes: notes || null,
  };

  // Try to save to Supabase
  if (supabase) {
    try {
      const { data, error } = await supabase
        .from("entrance_logs")
        .insert([logData])
        .select()
        .single();

      if (error) {
        console.error("[EntranceLog] Error saving to Supabase:", error);
        // Fallback to in-memory storage
        return addToCache(logData);
      }

      if (data) {
        const log: EntranceLog = {
          id: data.id,
          memberId: data.member_id,
          memberName: data.member_name,
          memberPhone: data.member_phone,
          memberStatus: data.member_status,
          validationStatus: data.validation_status,
          validationMessage: data.validation_message,
          entranceType: data.entrance_type,
          timestamp: data.timestamp || data.created_at || new Date().toISOString(),
          notes: data.notes || undefined,
        };
        
        // Add to cache for immediate access
        entranceLogsCache.unshift(log);
        return log;
      }
    } catch (err) {
      console.error("[EntranceLog] Exception saving to Supabase:", err);
      // Fallback to in-memory storage
      return addToCache(logData);
    }
  }

  // Fallback to in-memory storage if Supabase is not available
  return addToCache(logData);
}

function addToCache(logData: any): EntranceLog {
  const log: EntranceLog = {
    id: entranceLogsCache.length + 1,
    memberId: logData.member_id,
    memberName: logData.member_name,
    memberPhone: logData.member_phone,
    memberStatus: logData.member_status,
    validationStatus: logData.validation_status,
    validationMessage: logData.validation_message,
    entranceType: logData.entrance_type,
    timestamp: new Date().toISOString(),
    notes: logData.notes || undefined,
  };

  entranceLogsCache.unshift(log);
  return log;
}

export async function getEntranceLogs(): Promise<EntranceLog[]> {
  // Try to fetch from Supabase
  if (supabase) {
    try {
      const { data, error } = await supabase
        .from("entrance_logs")
        .select("*")
        .order("timestamp", { ascending: false })
        .limit(1000); // Limit to last 1000 logs

      if (error) {
        console.error("[EntranceLog] Error fetching from Supabase:", error);
        // Fallback to cache
        return [...entranceLogsCache];
      }

      if (data && data.length > 0) {
        const logs: EntranceLog[] = data.map((item: any) => ({
          id: item.id,
          memberId: item.member_id,
          memberName: item.member_name,
          memberPhone: item.member_phone,
          memberStatus: item.member_status,
          validationStatus: item.validation_status,
          validationMessage: item.validation_message,
          entranceType: item.entrance_type,
          timestamp: item.timestamp || item.created_at || new Date().toISOString(),
          notes: item.notes || undefined,
        }));

        // Update cache
        entranceLogsCache = logs;
        return logs;
      }
    } catch (err) {
      console.error("[EntranceLog] Exception fetching from Supabase:", err);
      // Fallback to cache
      return [...entranceLogsCache];
    }
  }

  // Fallback to cache if Supabase is not available
  return [...entranceLogsCache];
}

export async function getEntranceLogsByMember(memberId: number): Promise<EntranceLog[]> {
  if (supabase) {
    try {
      const { data, error } = await supabase
        .from("entrance_logs")
        .select("*")
        .eq("member_id", memberId)
        .order("timestamp", { ascending: false })
        .limit(100);

      if (error) {
        console.error("[EntranceLog] Error fetching by member:", error);
        return entranceLogsCache.filter(log => log.memberId === memberId);
      }

      if (data && data.length > 0) {
        return data.map((item: any) => ({
          id: item.id,
          memberId: item.member_id,
          memberName: item.member_name,
          memberPhone: item.member_phone,
          memberStatus: item.member_status,
          validationStatus: item.validation_status,
          validationMessage: item.validation_message,
          entranceType: item.entrance_type,
          timestamp: item.timestamp || item.created_at || new Date().toISOString(),
          notes: item.notes || undefined,
        }));
      }
    } catch (err) {
      console.error("[EntranceLog] Exception fetching by member:", err);
    }
  }

  return entranceLogsCache.filter(log => log.memberId === memberId);
}

export async function getEntranceLogsByStatus(status: 'valid' | 'invalid' | 'expiring_soon'): Promise<EntranceLog[]> {
  if (supabase) {
    try {
      const { data, error } = await supabase
        .from("entrance_logs")
        .select("*")
        .eq("validation_status", status)
        .order("timestamp", { ascending: false })
        .limit(100);

      if (error) {
        console.error("[EntranceLog] Error fetching by status:", error);
        return entranceLogsCache.filter(log => log.validationStatus === status);
      }

      if (data && data.length > 0) {
        return data.map((item: any) => ({
          id: item.id,
          memberId: item.member_id,
          memberName: item.member_name,
          memberPhone: item.member_phone,
          memberStatus: item.member_status,
          validationStatus: item.validation_status,
          validationMessage: item.validation_message,
          entranceType: item.entrance_type,
          timestamp: item.timestamp || item.created_at || new Date().toISOString(),
          notes: item.notes || undefined,
        }));
      }
    } catch (err) {
      console.error("[EntranceLog] Exception fetching by status:", err);
    }
  }

  return entranceLogsCache.filter(log => log.validationStatus === status);
}

export async function getEntranceLogsByType(type: 'qr_scan' | 'manual'): Promise<EntranceLog[]> {
  if (supabase) {
    try {
      const { data, error } = await supabase
        .from("entrance_logs")
        .select("*")
        .eq("entrance_type", type)
        .order("timestamp", { ascending: false })
        .limit(100);

      if (error) {
        console.error("[EntranceLog] Error fetching by type:", error);
        return entranceLogsCache.filter(log => log.entranceType === type);
      }

      if (data && data.length > 0) {
        return data.map((item: any) => ({
          id: item.id,
          memberId: item.member_id,
          memberName: item.member_name,
          memberPhone: item.member_phone,
          memberStatus: item.member_status,
          validationStatus: item.validation_status,
          validationMessage: item.validation_message,
          entranceType: item.entrance_type,
          timestamp: item.timestamp || item.created_at || new Date().toISOString(),
          notes: item.notes || undefined,
        }));
      }
    } catch (err) {
      console.error("[EntranceLog] Exception fetching by type:", err);
    }
  }

  return entranceLogsCache.filter(log => log.entranceType === type);
}

export function clearEntranceLogs(): void {
  entranceLogsCache = [];
}
