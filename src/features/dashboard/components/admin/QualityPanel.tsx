import React from "react";
import { useTranslation } from "react-i18next";
import { AlertOctagon, CheckCircle2, Info, TriangleAlert } from "lucide-react";
import { PanelCard } from "@/shared/ui";
import type { QualityCheck } from "../../lib/analytics";

const ICONS = {
  info: <Info size={15} />,
  warning: <TriangleAlert size={15} />,
  danger: <AlertOctagon size={15} />,
};

/** Checklist of data-integrity checks over the JSON database. */
const QualityPanel: React.FC<{ checks: QualityCheck[] }> = ({ checks }) => {
  const { t } = useTranslation("dashboard");
  return (
    <PanelCard
      title={t("admin.quality.title")}
      className="km-dash-panel"
      bodyClassName="p-0 km-dash-scroll"
    >
      <ul className="km-checklist">
        {checks.map((check) => {
          const ok = check.count === 0;
          return (
            <li key={check.key} className={`km-checklist__item is-${ok ? "ok" : check.severity}`}>
              <span className="km-checklist__icon">
                {ok ? <CheckCircle2 size={15} /> : ICONS[check.severity]}
              </span>
              <span className="km-checklist__label">{t(`admin.quality.checks.${check.key}`)}</span>
              <span className="km-checklist__value">{ok ? t("admin.quality.ok") : check.count}</span>
            </li>
          );
        })}
      </ul>
    </PanelCard>
  );
};

export default QualityPanel;
