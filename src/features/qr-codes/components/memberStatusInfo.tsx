import React from "react";
import { CheckCircle, Clock, XCircle } from "lucide-react";
import i18n from "@/shared/i18n";
import type { MemberStatus } from "@/features/members";

export interface MemberStatusInfo {
  icon: React.ReactNode;
  text: string;
  color: string;
  bgColor: string;
}

/** Icon + label + bootstrap color classes for a membership status. */
export function getMemberStatusInfo(
  status: MemberStatus,
  iconSize: number,
): MemberStatusInfo | null {
  switch (status) {
    case "active":
      return {
        icon: <CheckCircle className="text-success" size={iconSize} />,
        text: i18n.t("qrCodes:status.active"),
        color: "text-success",
        bgColor: "bg-success bg-opacity-10",
      };
    case "expiring_soon":
      return {
        icon: <Clock className="text-warning" size={iconSize} />,
        text: i18n.t("qrCodes:status.expiring_soon"),
        color: "text-warning",
        bgColor: "bg-warning bg-opacity-10",
      };
    case "expired":
      return {
        icon: <XCircle className="text-danger" size={iconSize} />,
        text: i18n.t("qrCodes:status.expired"),
        color: "text-danger",
        bgColor: "bg-danger bg-opacity-10",
      };
    default:
      return null;
  }
}
