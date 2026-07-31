import { supabase } from "../lib/supabaseClient";
import type { Member, Debt } from "../types";

const SESSION_KEY = "melos_member_session";

export interface MemberSession {
  memberId: number;
  name: string;
  phone: string;
  loggedInAt: string;
}

function normalizePhone(phone: string): string {
  return phone.replace(/\D/g, "");
}

export function loadMemberSession(): MemberSession | null {
  try {
    const raw = sessionStorage.getItem(SESSION_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as MemberSession;
  } catch {
    return null;
  }
}

export function saveMemberSession(session: MemberSession): void {
  sessionStorage.setItem(SESSION_KEY, JSON.stringify(session));
}

export function clearMemberSession(): void {
  sessionStorage.removeItem(SESSION_KEY);
}

/** Login by phone — must match an existing member record */
export async function loginMemberByPhone(
  phoneInput: string
): Promise<{ member: Member | null; error: string | null }> {
  const phone = normalizePhone(phoneInput);
  if (phone.length < 10) {
    return { member: null, error: "Βαλε εγκυρο αριθμο τηλεφωνου" };
  }

  if (!supabase) {
    return { member: null, error: "Η συνδεση με τη βαση δεν ειναι διαθεσιμη" };
  }

  try {
    const { data, error } = await supabase.from("members").select("*");

    if (error || !data) {
      return { member: null, error: "Αποτυχια αναζητησης μελους" };
    }

    const member = (data as Member[]).find(
      (m) => normalizePhone(m.phone) === phone
    );

    if (!member) {
      return {
        member: null,
        error: "Δεν βρεθηκε μελος με αυτο το τηλεφωνο. Μιλησε στη reception.",
      };
    }

    saveMemberSession({
      memberId: member.id,
      name: member.name,
      phone: member.phone,
      loggedInAt: new Date().toISOString(),
    });

    return { member, error: null };
  } catch {
    return { member: null, error: "Σφαλμα κατα τη συνδεση" };
  }
}

export async function fetchMemberById(id: number): Promise<Member | null> {
  if (!supabase) return null;
  const { data, error } = await supabase
    .from("members")
    .select("*")
    .eq("id", id)
    .single();
  if (error || !data) return null;
  return data as Member;
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
