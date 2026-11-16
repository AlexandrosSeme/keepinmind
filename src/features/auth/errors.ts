import i18n from "@/shared/i18n";
import { logger } from "@/shared/lib/logger";
import { MIN_PASSWORD_LENGTH, StaffAuthError } from "./types";

/** Translated message for errors thrown by the staff API. */
export function staffAuthErrorMessage(error: unknown): string {
  if (error instanceof StaffAuthError) {
    return i18n.t(`auth:errors.${error.code}`, { min: MIN_PASSWORD_LENGTH });
  }
  logger.error("[Auth] Unexpected error:", error);
  return i18n.t("auth:errors.generic", {
    message: error instanceof Error ? error.message : String(error),
  });
}
