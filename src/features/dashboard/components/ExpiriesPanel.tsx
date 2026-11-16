import React from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Package } from "lucide-react";
import { LinkButton, PanelCard, StatusBadge } from "@/shared/ui";
import type { UpcomingExpiry } from "../types";
import { formatEuro } from "../lib/format";
import DashboardEmpty from "./DashboardEmpty";

interface ExpiriesPanelProps {
  upcomingExpiries: UpcomingExpiry[];
  /** When given (finance view), shows the renewal value per member and in total. */
  priceOf?: (packageName: string) => number;
}

const ExpiriesPanel: React.FC<ExpiriesPanelProps> = ({ upcomingExpiries, priceOf }) => {
  const navigate = useNavigate();
  const { t } = useTranslation("dashboard");
  const total = priceOf ? upcomingExpiries.reduce((s, e) => s + priceOf(e.package), 0) : 0;

  return (
    <PanelCard
      title={t("expiries.title")}
      badge={
        priceOf && upcomingExpiries.length > 0 ? (
          <span className="km-chip km-chip--brand">{formatEuro(total)}</span>
        ) : (
          upcomingExpiries.length > 0 && <span className="km-chip">{upcomingExpiries.length}</span>
        )
      }
      action={
        <LinkButton onClick={() => navigate("/members")}>{t("all")}</LinkButton>
      }
      className="km-dashboard__panel"
      bodyClassName="p-0 km-dashboard__scroll"
    >
      {upcomingExpiries.length === 0 ? (
        <DashboardEmpty
          icon={<Package size={22} className="mb-1 opacity-50" />}
          text={t("expiries.empty")}
        />
      ) : (
        upcomingExpiries.map((exp) => (
          <button
            key={exp.id}
            type="button"
            className="km-feed__row km-expiry-row"
            onClick={() => navigate(`/members/${exp.id}`)}
          >
            <span className="min-w-0">
              <span className="fw-semibold text-dark text-truncate d-block">{exp.name}</span>
              <small className="text-muted text-truncate d-block">{exp.package}</small>
            </span>
            <span className="text-end">
              {priceOf && (
                <span className="km-pay-row__amount d-block">{formatEuro(priceOf(exp.package))}</span>
              )}
              <StatusBadge
                tone={exp.days <= 3 ? "danger" : "warning"}
                label={exp.days === 0 ? t("expiries.today") : t("expiries.days", { days: exp.days })}
                showDot={false}
              />
            </span>
          </button>
        ))
      )}
    </PanelCard>
  );
};

export default ExpiriesPanel;
