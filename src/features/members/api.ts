import { supabase } from "@/shared/api/supabaseClient";
import { withoutUndefined } from "@/shared/lib/object";
import type { Member, MemberInput } from "./types";

export async function fetchMembers(): Promise<Member[]> {
  if (!supabase) return [];

  const { data, error } = await supabase
    .from("members")
    .select("*")
    .order("id", { ascending: true });

  if (error) throw error;
  return (data ?? []) as Member[];
}

export async function fetchMemberById(id: number): Promise<Member | null> {
  if (!supabase) return null;

  const { data, error } = await supabase
    .from("members")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (error) {
    console.error("[Supabase] Error fetching member:", error);
    return null;
  }

  return (data as Member | null) ?? null;
}

export async function createMember(
  member: MemberInput,
): Promise<Member | null> {
  if (!supabase) return null;

  const { data, error } = await supabase
    .from("members")
    .insert([withoutUndefined(member)])
    .select()
    .single();

  if (error) {
    console.error("[Supabase] Error creating member:", error);
    return null;
  }

  return data as Member;
}

export async function updateMember(
  id: number,
  updates: Partial<MemberInput>,
): Promise<Member | null> {
  if (!supabase) return null;

  const { data, error } = await supabase
    .from("members")
    .update(withoutUndefined(updates))
    .eq("id", id)
    .select()
    .single();

  if (error) {
    console.error("[Supabase] Error updating member:", error);
    return null;
  }

  return data as Member;
}

export async function deleteMember(id: number): Promise<boolean> {
  if (!supabase) return false;

  const { error } = await supabase.from("members").delete().eq("id", id);

  if (error) {
    console.error("[Supabase] Error deleting member:", error);
    return false;
  }

  return true;
}
