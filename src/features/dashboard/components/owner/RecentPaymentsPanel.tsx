import React from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Receipt } from "lucide-react";
import { LinkButton, PanelCard, StatusBadge } from "@/shared/ui";
import { paymentMethodLabel, type Payment } from "@/features/payments";
import DashboardEmpty from "../DashboardEmpty";
import { formatEuro } from "../../lib/format";

/** Latest payments (any status), newest first. */
const RecentPaymentsPanel: React.FC<{ payments: Payment[] }> = ({ payments }) => {
  const navigate = useNavigate();
  const { t } = useTranslation("dashboard");

  return (
    <PanelCard
      title={t("finance.recent.title")}
      action={<LinkButton onClick={() => navigate("/payments")}>{t("all")}</LinkButton>}
      className="km-dash-panel"
      bodyClassName="p-0 km-dash-scroll"
    >
      {payments.length === 0 ? (
        <DashboardEmpty icon={<Receipt size={22} className="mb-1 opacity-50" />} text={t("finance.recent.empty")} />
      ) : (
        payments.map((p) => (
          <button
            key={p.id}
            type="button"
            className="km-feed__row km-pay-row"
            onClick={() => navigate(p.memberId ? `/members/${p.memberId}` : "/payments")}
          >
            <span className="km-pay-row__date">{p.date.slice(0, 5)}</span>
            <span className="min-w-0">
              <span className="km-feed__name d-block text-truncate">{p.memberName}</span>
              <small className="text-muted d-block text-truncate">
                {[p.package, paymentMethodLabel(p.method)].filter(Boolean).join(" · ")}
              </small>
            </span>
            <span className="text-end">
              <span className="km-pay-row__amount d-block">{formatEuro(p.amount)}</span>
              <StatusBadge status={p.status} showDot={false} />
            </span>
          </button>
        ))
      )}
    </PanelCard>
  );
};

export default RecentPaymentsPanel;
