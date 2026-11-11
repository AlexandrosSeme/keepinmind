import { supabase } from "@/shared/api/supabaseClient";
import i18n from "@/shared/i18n";
import { normalizePhone } from "@/shared/lib/phone";
import type { Member } from "@/features/members";

const SESSION_KEY = "melos_member_session";

export interface MemberSession {
  memberId: number;
  name: string;
  phone: string;
  loggedInAt: string;
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
  phoneInput: string,
): Promise<{ member: Member | null; error: string | null }> {
  const phone = normalizePhone(phoneInput);
  if (phone.length < 10) {
    return { member: null, error: i18n.t("memberPortal:errors.invalidPhone") };
  }

  if (!supabase) {
    return {
      member: null,
      error: i18n.t("memberPortal:errors.dbUnavailable"),
    };
  }

  try {
    const { data, error } = await supabase.from("members").select("*");

    if (error || !data) {
      return {
        member: null,
        error: i18n.t("memberPortal:errors.lookupFailed"),
      };
    }

    const member = (data as Member[]).find(
      (m) => normalizePhone(m.phone) === phone,
    );

    if (!member) {
      return {
        member: null,
        error: i18n.t("memberPortal:errors.notFound"),
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
    return { member: null, error: i18n.t("memberPortal:errors.loginError") };
  }
}
