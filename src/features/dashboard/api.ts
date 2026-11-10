import { supabase } from "@/shared/api/supabaseClient";
import type { UpcomingExpiry } from "./types";

export async function fetchUpcomingExpiries(): Promise<UpcomingExpiry[]> {
  if (!supabase) return [];

  const { data, error } = await supabase
    .from("upcoming_expiries")
    .select("*")
    .order("id", { ascending: true });

  if (error) throw error;
  return (data ?? []) as UpcomingExpiry[];
}
