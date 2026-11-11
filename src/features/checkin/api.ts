import { getOrNull } from "@/shared/api/httpClient";
import i18n from "@/shared/i18n";
import type { Member } from "@/features/members";
import { logEntrance } from "@/features/attendance";
import type { ValidationResult } from "./types";

/** Looks up the member and decides whether they may enter. */
export async function validateMemberEntry(
  memberId: number,
): Promise<ValidationResult> {
  try {
    const member = await getOrNull<Member>(`/members/${memberId}`);

    if (!member) {
      return {
        valid: false,
        member: null,
        message: i18n.t("checkin:validation.invalidCode"),
        reason: i18n.t("checkin:validation.memberNotFound"),
      };
    }

    if (member.card_lost === true) {
      return {
        valid: false,
        member,
        message: i18n.t("checkin:validation.cardLost"),
        reason: i18n.t("checkin:validation.cardLostReason"),
      };
    }

    switch (member.status) {
      case "expired":
        return {
          valid: false,
          member,
          message: i18n.t("checkin:validation.expired"),
          reason: i18n.t("checkin:validation.expiredReason", {
            date: member.expiry,
          }),
        };
      case "expiring_soon":
        return {
          valid: true,
          member,
          message: i18n.t("checkin:validation.expiringSoon"),
          reason: i18n.t("checkin:validation.expiringSoonReason", {
            date: member.expiry,
          }),
        };
      case "active":
        return {
          valid: true,
          member,
          message: i18n.t("checkin:validation.active"),
        };
      default:
        return {
          valid: false,
          member,
          message: i18n.t("checkin:validation.invalidStatus"),
          reason: i18n.t("checkin:validation.invalidStatusReason"),
        };
    }
  } catch {
    return {
      valid: false,
      member: null,
      message: i18n.t("checkin:validation.validationError"),
      reason: i18n.t("checkin:validation.dbError"),
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
