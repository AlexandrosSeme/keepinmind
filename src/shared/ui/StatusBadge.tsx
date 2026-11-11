import React from "react";
import { useTranslation } from "react-i18next";
import { STATUS_BADGE_MAP, type BadgeTone } from "./statusBadgeMap";
import type elCommon from "@/shared/i18n/locales/el/common";

type StatusKey = keyof typeof elCommon.status;
import "./StatusBadge.scss";

export interface StatusBadgeProps {
  status?: string;
  tone?: BadgeTone;
  label?: React.ReactNode;
  icon?: React.ReactNode;
  className?: string;
  showDot?: boolean;
}

const StatusBadge: React.FC<StatusBadgeProps> = ({
  status,
  tone,
  label,
  icon,
  className = "",
  showDot = true,
}) => {
  const { t } = useTranslation();
  const mappedTone = status ? STATUS_BADGE_MAP[status] : undefined;
  const resolvedTone = tone ?? mappedTone ?? "neutral";
  const resolvedLabel =
    label ?? (mappedTone ? t(`status.${status as StatusKey}`) : status) ?? "—";

  return (
    <span
      className={`km-badge km-badge--${resolvedTone} ${className}`.trim()}
      title={typeof resolvedLabel === "string" ? resolvedLabel : undefined}
    >
      {icon ? (
        <span className="km-badge__icon">{icon}</span>
      ) : showDot ? (
        <span className="km-badge__dot" aria-hidden />
      ) : null}
      <span className="km-badge__label">{resolvedLabel}</span>
    </span>
  );
};

export default StatusBadge;
