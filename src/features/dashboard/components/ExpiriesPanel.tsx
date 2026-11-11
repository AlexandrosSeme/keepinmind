import React, { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Package } from "lucide-react";
import { LinkButton, PanelCard, StatusBadge } from "@/shared/ui";
import type { UpcomingExpiry } from "../types";
import DashboardEmpty from "./DashboardEmpty";

const ExpiriesPanel: React.FC<{ upcomingExpiries: UpcomingExpiry[] }> = ({
  upcomingExpiries,
}) => {
  const navigate = useNavigate();
  const { t } = useTranslation("dashboard");
  const sorted = useMemo(
    () => [...upcomingExpiries].sort((a, b) => a.days - b.days).slice(0, 6),
    [upcomingExpiries],
  );

  return (
    <PanelCard
      title={t("expiries.title")}
      action={
        <LinkButton onClick={() => navigate("/members")}>{t("all")}</LinkButton>
      }
      className="km-dashboard__panel"
      bodyClassName="p-0 km-dashboard__scroll"
    >
      {sorted.length === 0 ? (
        <DashboardEmpty
          icon={<Package size={22} className="mb-1 opacity-50" />}
          text={t("expiries.empty")}
        />
      ) : (
        sorted.map((exp) => (
          <div
            key={exp.id}
            className="km-dashboard__row d-flex align-items-center justify-content-between gap-2"
          >
            <div className="min-w-0">
              <div className="fw-semibold text-dark text-truncate">
                {exp.name}
              </div>
              <small className="text-muted text-truncate d-block">
                {exp.package}
              </small>
            </div>
            <StatusBadge
              tone={exp.days <= 3 ? "danger" : "warning"}
              label={t("expiries.days", { days: exp.days })}
              showDot={false}
            />
          </div>
        ))
      )}
    </PanelCard>
  );
};

export default ExpiriesPanel;
