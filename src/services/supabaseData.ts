import { supabase } from "../lib/supabaseClient";
import type { Stats, Member, UpcomingExpiry, Debt, Package } from "../types";

export interface AppDataResponse {
  stats: Stats;
  members: Member[];
  upcomingExpiries: UpcomingExpiry[];
  debts: Debt[];
  packages: Package[];
}

// ==================== READ OPERATIONS ====================

export async function fetchAppData(): Promise<AppDataResponse | null> {
  if (!supabase) {
    return null;
  }

  const [membersRes, upcomingRes, debtsRes, packagesRes] = await Promise.all([
    supabase.from("members").select("*").order("id", { ascending: true }),
    supabase.from("upcoming_expiries").select("*").order("id", { ascending: true }),
    supabase.from("debts").select("*").order("id", { ascending: true }),
    supabase.from("packages").select("*").order("id", { ascending: true }),
  ]);

  const hasError =
    membersRes.error || upcomingRes.error || debtsRes.error || packagesRes.error;

  if (hasError) {
    console.error("[Supabase] Error fetching data", {
      membersError: membersRes.error,
      upcomingError: upcomingRes.error,
      debtsError: debtsRes.error,
      packagesError: packagesRes.error,
    });
    return null;
  }

  const members = (membersRes.data || []) as Member[];
  const upcomingExpiries = (upcomingRes.data || []) as UpcomingExpiry[];
  const debts = (debtsRes.data || []) as Debt[];
  const packages = (packagesRes.data || []) as Package[];

  const stats: Stats = {
    totalMembers: members.length,
    activeSubscriptions: packages.reduce(
      (sum, p) => sum + (p.category === "subscription" ? p.active : 0),
      0
    ),
    expiringThisWeek: upcomingExpiries.length,
    overdueDebts: debts.filter((d) => d.status === "overdue").length,
    monthlyRevenue: "0",
    pendingPayments: "0",
  };

  return {
    stats,
    members,
    upcomingExpiries,
    debts,
    packages,
  };
}

// ==================== MEMBERS CRUD ====================

export async function createMember(member: Omit<Member, "id">): Promise<Member | null> {
  if (!supabase) return null;

  // Filter out undefined values to avoid sending them to Supabase
  const memberData = Object.fromEntries(
    Object.entries(member).filter(([_, value]) => value !== undefined)
  ) as Omit<Member, "id">;

  const { data, error } = await supabase
    .from("members")
    .insert([memberData])
    .select()
    .single();

  if (error) {
    console.error("[Supabase] Error creating member:", error);
    return null;
  }

  return data as Member;
}

export async function updateMember(id: number, updates: Partial<Omit<Member, "id">>): Promise<Member | null> {
  if (!supabase) return null;

  // Filter out undefined values to avoid sending them to Supabase
  const updateData = Object.fromEntries(
    Object.entries(updates).filter(([_, value]) => value !== undefined)
  ) as Partial<Omit<Member, "id">>;

  const { data, error } = await supabase
    .from("members")
    .update(updateData)
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

// ==================== DEBTS CRUD ====================

export async function createDebt(debt: Omit<Debt, "id">): Promise<Debt | null> {
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

export async function updateDebt(id: number, updates: Partial<Omit<Debt, "id">>): Promise<Debt | null> {
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

// ==================== PACKAGES CRUD ====================

export async function createPackage(pkg: Omit<Package, "id">): Promise<Package | null> {
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

export async function updatePackage(id: number, updates: Partial<Omit<Package, "id">>): Promise<Package | null> {
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

// ==================== UPCOMING EXPIRIES CRUD ====================

export async function createUpcomingExpiry(expiry: Omit<UpcomingExpiry, "id">): Promise<UpcomingExpiry | null> {
  if (!supabase) return null;

  const { data, error } = await supabase
    .from("upcoming_expiries")
    .insert([expiry])
    .select()
    .single();

  if (error) {
    console.error("[Supabase] Error creating upcoming expiry:", error);
    return null;
  }

  return data as UpcomingExpiry;
}

export async function updateUpcomingExpiry(id: number, updates: Partial<Omit<UpcomingExpiry, "id">>): Promise<UpcomingExpiry | null> {
  if (!supabase) return null;

  const { data, error } = await supabase
    .from("upcoming_expiries")
    .update(updates)
    .eq("id", id)
    .select()
    .single();

  if (error) {
    console.error("[Supabase] Error updating upcoming expiry:", error);
    return null;
  }

  return data as UpcomingExpiry;
}

export async function deleteUpcomingExpiry(id: number): Promise<boolean> {
  if (!supabase) return false;

  const { error } = await supabase.from("upcoming_expiries").delete().eq("id", id);

  if (error) {
    console.error("[Supabase] Error deleting upcoming expiry:", error);
    return false;
  }

  return true;
}


