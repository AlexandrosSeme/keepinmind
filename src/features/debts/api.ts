import { supabase } from "@/shared/api/supabaseClient";
import type { Debt, DebtInput } from "./types";

export async function fetchDebts(): Promise<Debt[]> {
  if (!supabase) return [];

  const { data, error } = await supabase
    .from("debts")
    .select("*")
    .order("id", { ascending: true });

  if (error) throw error;
  return (data ?? []) as Debt[];
}

export async function fetchMemberDebts(memberName: string): Promise<Debt[]> {
  if (!supabase) return [];
  const { data, error } = await supabase
    .from("debts")
    .select("*")
    .ilike("name", memberName);
  if (error || !data) return [];
  return data as Debt[];
}

export async function createDebt(debt: DebtInput): Promise<Debt | null> {
  if (!supabase) return null;

  const { data, error } = await supabase
    .from("debts")
    .insert([debt])
    .select()
    .single();

  if (error) {
    console.error("[Supabase] Error creating debt:", error);
    return null;
  }

  return data as Debt;
}

export async function updateDebt(
  id: number,
  updates: Partial<DebtInput>,
): Promise<Debt | null> {
  if (!supabase) return null;

  const { data, error } = await supabase
    .from("debts")
    .update(updates)
    .eq("id", id)
    .select()
    .single();

  if (error) {
    console.error("[Supabase] Error updating debt:", error);
    return null;
  }

  return data as Debt;
}

export async function deleteDebt(id: number): Promise<boolean> {
  if (!supabase) return false;

  const { error } = await supabase.from("debts").delete().eq("id", id);

  if (error) {
    console.error("[Supabase] Error deleting debt:", error);
    return false;
  }

  return true;
}
