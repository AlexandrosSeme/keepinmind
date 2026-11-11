import React from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Phone, ThumbsUp } from "lucide-react";
import { PanelCard } from "@/shared/ui";
import type { Member } from "@/features/members";
import DashboardEmpty from "../DashboardEmpty";

interface InactivePanelProps {
  rows: { member: Member; lastVisit: number | null }[];
  now: Date;
}

/** Members with a valid plan who stopped coming — a call list for trainers. */
const InactivePanel: React.FC<InactivePanelProps> = ({ rows, now }) => {
  const navigate = useNavigate();
  const { t } = useTranslation("dashboard");

  return (
    <PanelCard
      title={t("trainer.inactive.title")}
      badge={<span className="km-count-badge">{rows.length}</span>}
      className="km-dash-panel km-dash-panel--list"
      bodyClassName="p-0 km-dash-scroll"
    >
      <div className="km-dash-panel__hint">{t("trainer.inactive.hint")}</div>
      {rows.length === 0 ? (
        <DashboardEmpty
          icon={<ThumbsUp size={22} className="mb-1 opacity-50" />}
          text={t("trainer.inactive.empty")}
        />
      ) : (
        rows.slice(0, 12).map(({ member, lastVisit }) => (
          <div key={member.id} className="km-dashboard__row d-flex align-items-center gap-2">
            <button
              type="button"
              className="km-row-link min-w-0 flex-grow-1"
              onClick={() => navigate(`/members/${member.id}`)}
            >
              <div className="fw-semibold text-dark text-truncate">{member.name}</div>
              <small className="text-muted">
                {lastVisit === null
                  ? t("trainer.inactive.never")
                  : t("trainer.inactive.daysAgo", {
                      count: Math.floor((now.getTime() - lastVisit) / 86400000),
                    })}
              </small>
            </button>
            <a
              href={`tel:${member.phone}`}
              className="btn btn-outline-secondary btn-sm flex-shrink-0"
              aria-label={member.phone}
              title={member.phone}
            >
              <Phone size={14} />
            </a>
          </div>
        ))
      )}
    </PanelCard>
  );
};

export default InactivePanel;
