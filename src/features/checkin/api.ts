import { supabase } from "@/shared/api/supabaseClient";
import type { Member } from "@/features/members";
import { logEntrance } from "@/features/attendance";
import type { ValidationResult } from "./types";

/** Looks up the member and decides whether they may enter. */
export async function validateMemberEntry(
  memberId: number,
): Promise<ValidationResult> {
  if (!supabase) {
    return {
      valid: false,
      member: null,
      message: "Σφαλμα συνδεσης",
      reason: "Η συνδεση με τη βαση δεδομενων δεν ειναι διαθεσιμη",
    };
  }

  try {
    const { data, error } = await supabase
      .from("members")
      .select("*")
      .eq("id", memberId)
      .single();

    if (error || !data) {
      return {
        valid: false,
        member: null,
        message: "Μη εγκυρο QR Code",
        reason: "Δεν βρεθηκε μελος με αυτο το ID",
      };
    }

    const member = data as Member;

    if (member.card_lost === true) {
      return {
        valid: false,
        member,
        message: "Καρτα Ακυρωμενη",
        reason:
          "Η καρτα εχει σημειωθει ως χαμενη/ακυρωμενη. Παρακαλω επικοινωνηστε με τον διαχειριστη.",
      };
    }

    switch (member.status) {
      case "expired":
        return {
          valid: false,
          member,
          message: "Ληγμενη Συνδρομη",
          reason: `Η συνδρομη εληξε στις ${member.expiry}`,
        };
      case "expiring_soon":
        return {
          valid: true,
          member,
          message: "Ενεργη Συνδρομη (Ληγει Συντομα)",
          reason: `Η συνδρομη ληγει στις ${member.expiry}`,
        };
      case "active":
        return { valid: true, member, message: "Ενεργη Συνδρομη" };
      default:
        return {
          valid: false,
          member,
          message: "Μη εγκυρη Κατασταση",
          reason: "Η κατασταση της συνδρομης δεν ειναι εγκυρη",
        };
    }
  } catch {
    return {
      valid: false,
      member: null,
      message: "Σφαλμα Επικυρωσης",
      reason: "Σφαλμα κατα την επικοινωνια με τη βαση δεδομενων",
    };
  }
}

/** Writes the entrance attempt to the log (only when a member was found). */
export async function recordEntrance(
  result: ValidationResult,
  entranceType: "qr_scan" | "manual",
): Promise<void> {
  const { member } = result;
  if (!member) return;

  const validationStatus = !result.valid
    ? "invalid"
    : member.status === "expiring_soon"
      ? "expiring_soon"
      : "valid";

  await logEntrance(
    member.id,
    member.name,
    member.phone,
    member.status,
    validationStatus,
    result.message,
    entranceType,
    result.reason,
  );
}
