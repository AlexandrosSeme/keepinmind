import React from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { DoorOpen, QrCode, Hand } from "lucide-react";
import { LinkButton, PanelCard, StatusBadge } from "@/shared/ui";
import type { EntranceLog } from "@/features/attendance";
import { formatTime } from "../../lib/format";
import DashboardEmpty from "../DashboardEmpty";

/** Most recent check-ins of today, newest first; `total` = all of today's check-ins. */
const CheckinFeed: React.FC<{ logs: EntranceLog[]; total?: number }> = ({ logs, total }) => {
  const navigate = useNavigate();
  const { t } = useTranslation("dashboard");

  return (
    <PanelCard
      title={
        <span className="d-inline-flex align-items-center gap-2">
          <span className="km-live-dot" />
          {t("trainer.checkins.title")}
        </span>
      }
      badge={
        total !== undefined && (
          <span className="km-chip km-chip--brand">{t("trainer.checkins.today", { count: total })}</span>
        )
      }
      action={<LinkButton onClick={() => navigate("/attendance")}>{t("all")}</LinkButton>}
      className="km-dash-panel km-dash-panel--tall"
      bodyClassName="p-0 km-dash-scroll"
    >
      {logs.length === 0 ? (
        <DashboardEmpty
          icon={<DoorOpen size={22} className="mb-1 opacity-50" />}
          text={t("trainer.checkins.empty")}
        />
      ) : (
        logs.map((log) => (
          <button
            key={log.id}
            type="button"
            className="km-feed__row"
            onClick={() => navigate(`/members/${log.memberId}`)}
          >
            <span className="km-feed__time">{formatTime(new Date(log.timestamp))}</span>
            <span className="km-feed__icon">
              {log.entranceType === "qr_scan" ? <QrCode size={14} /> : <Hand size={14} />}
            </span>
            <span className="km-feed__name text-truncate">{log.memberName}</span>
            <StatusBadge status={log.validationStatus} showDot={false} />
          </button>
        ))
      )}
    </PanelCard>
  );
};

export default CheckinFeed;
