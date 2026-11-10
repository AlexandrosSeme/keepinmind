import { supabase } from "@/shared/api/supabaseClient";
import type { Payment, PaymentInput } from "./types";

export async function fetchPayments(): Promise<Payment[]> {
  if (!supabase) return [];

  const { data, error } = await supabase
    .from("payments")
    .select("*")
    .order("id", { ascending: false });

  // The payments table may not exist yet — don't break the app.
  if (error) {
    console.warn(
      "[Supabase] Payments unavailable (run supabase/supabase-payments-setup.sql):",
      error.message,
    );
    return [];
  }

  return (data ?? []) as Payment[];
}

export async function createPayment(
  payment: PaymentInput,
): Promise<Payment | null> {
  if (!supabase) return null;

  const { data, error } = await supabase
    .from("payments")
    .insert([payment])
    .select()
    .single();

  if (error) {
    console.error("[Supabase] Error creating payment:", error);
    return null;
  }

  return data as Payment;
}

export async function updatePayment(
  id: number,
  updates: Partial<PaymentInput>,
): Promise<Payment | null> {
  if (!supabase) return null;

  const { data, error } = await supabase
    .from("payments")
    .update(updates)
    .eq("id", id)
    .select()
    .single();

  if (error) {
    console.error("[Supabase] Error updating payment:", error);
    return null;
  }

  return data as Payment;
}

export async function deletePayment(id: number): Promise<boolean> {
  if (!supabase) return false;

  const { error } = await supabase.from("payments").delete().eq("id", id);

  if (error) {
    console.error("[Supabase] Error deleting payment:", error);
    return false;
  }

  return true;
}
