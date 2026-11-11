import React from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { LinkButton, PanelCard } from "@/shared/ui";
import { BRAND } from "@/shared/lib/brand";
import type { debtAging } from "../../lib/analytics";
import { formatEuro } from "../../lib/format";

type Aging = ReturnType<typeof debtAging>;

const ROWS = [
  { key: "overdue", color: BRAND.yellow },
  { key: "warning", color: BRAND.yellowStrong },
  { key: "critical", color: BRAND.danger },
] as const;

/** Outstanding debt split by how long it has been overdue. */
const DebtAgingPanel: React.FC<{ aging: Aging }> = ({ aging }) => {
  const navigate = useNavigate();
  const { t } = useTranslation("dashboard");
  const max = Math.max(...ROWS.map((r) => aging[r.key].amount), 1);

  return (
    <PanelCard
      title={t("owner.aging.title")}
      action={<LinkButton onClick={() => navigate("/debts")}>{t("all")}</LinkButton>}
      className="km-dash-panel"
    >
      <div className="km-aging">
        <div className="km-aging__total">
          <span className="km-aging__total-label">{t("owner.aging.total")}</span>
          <span className="km-aging__total-value">{formatEuro(aging.total)}</span>
        </div>
        {ROWS.map(({ key, color }) => (
          <div key={key} className="km-aging__row">
            <div className="km-aging__meta">
              <span className="km-aging__label">{t(`owner.aging.${key}`)}</span>
              <span className="km-aging__amount">{formatEuro(aging[key].amount)}</span>
            </div>
            <div className="km-aging__track">
              <div
                className="km-aging__fill"
                style={{
                  width: `${Math.max(4, (aging[key].amount / max) * 100)}%`,
                  backgroundColor: color,
                }}
              />
            </div>
            <small className="text-muted">
              {t("owner.aging.count", { count: aging[key].count })}
            </small>
          </div>
        ))}
      </div>
    </PanelCard>
  );
};

export default DebtAgingPanel;
