import React from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { LinkButton, PanelCard, StatusBadge } from "@/shared/ui";
import type { SubscriptionMixRow } from "../../lib/analytics";
import { formatEuro } from "../../lib/format";

interface SubscriptionMixPanelProps {
  rows: SubscriptionMixRow[];
}

/** Per package: price, members on it and its share of monthly recurring revenue. */
const SubscriptionMixPanel: React.FC<SubscriptionMixPanelProps> = ({ rows }) => {
  const navigate = useNavigate();
  const { t } = useTranslation("dashboard");
  const totalMonthly = rows.reduce((s, r) => s + r.monthly, 0) || 1;
  const totalMembers = rows.reduce((s, r) => s + r.members, 0);

  return (
    <PanelCard
      title={t("finance.mix.title")}
      action={
        <LinkButton onClick={() => navigate("/subscriptions")}>
          {t("finance.mix.manage")}
        </LinkButton>
      }
      className="km-dash-panel"
      bodyClassName="p-0 km-dash-scroll"
    >
      <table className="km-trainers km-mix">
        <thead>
          <tr>
            <th>{t("finance.mix.package")}</th>
            <th className="text-end">{t("finance.mix.price")}</th>
            <th className="text-end">{t("finance.mix.members")}</th>
            <th className="text-end">{t("finance.mix.monthly")}</th>
            <th>{t("finance.mix.share")}</th>
          </tr>
        </thead>
        <tbody>
          {rows.map(({ pkg, members, monthly }) => {
            const share = Math.round((monthly / totalMonthly) * 100);
            return (
              <tr key={pkg.id} onClick={() => navigate("/subscriptions")}>
                <td>
                  <div className="km-trainers__name">{pkg.name}</div>
                  <div className="d-flex align-items-center gap-2 mt-1">
                    <StatusBadge status={pkg.category} showDot={false} />
                    <small className="text-muted">{pkg.duration}</small>
                  </div>
                </td>
                <td className="text-end">{formatEuro(pkg.price)}</td>
                <td className="text-end fw-bold">{members}</td>
                <td className="text-end fw-bold">{formatEuro(monthly)}</td>
                <td>
                  <div className="km-trainers__fill">
                    <div className="km-trainers__track">
                      <div className="km-trainers__bar is-mid" style={{ width: `${Math.max(3, share)}%` }} />
                    </div>
                    <span>{share}%</span>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
        <tfoot>
          <tr>
            <td>{t("finance.mix.total")}</td>
            <td />
            <td className="text-end">{totalMembers}</td>
            <td className="text-end">{formatEuro(totalMonthly)}</td>
            <td />
          </tr>
        </tfoot>
      </table>
    </PanelCard>
  );
};

export default SubscriptionMixPanel;
