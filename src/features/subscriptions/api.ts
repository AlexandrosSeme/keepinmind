import { supabase } from "@/shared/api/supabaseClient";
import type { Package, PackageInput } from "./types";

export async function fetchPackages(): Promise<Package[]> {
  if (!supabase) return [];

  const { data, error } = await supabase
    .from("packages")
    .select("*")
    .order("id", { ascending: true });

  if (error) throw error;
  return (data ?? []) as Package[];
}

export async function createPackage(
  pkg: PackageInput,
): Promise<Package | null> {
  if (!supabase) return null;

  const { data, error } = await supabase
    .from("packages")
    .insert([pkg])
    .select()
    .single();

  if (error) {
    console.error("[Supabase] Error creating package:", error);
    return null;
  }

  return data as Package;
}

export async function updatePackage(
  id: number,
  updates: Partial<PackageInput>,
): Promise<Package | null> {
  if (!supabase) return null;

  const { data, error } = await supabase
    .from("packages")
    .update(updates)
    .eq("id", id)
    .select()
    .single();

  if (error) {
    console.error("[Supabase] Error updating package:", error);
    return null;
  }

  return data as Package;
}

export async function deletePackage(id: number): Promise<boolean> {
  if (!supabase) return false;

  const { error } = await supabase.from("packages").delete().eq("id", id);

  if (error) {
    console.error("[Supabase] Error deleting package:", error);
    return false;
  }

  return true;
}
