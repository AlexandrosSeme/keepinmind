import React from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { LinkButton } from "@/shared/ui";
import { BRAND } from "@/shared/lib/brand";
import type { monthPaymentStatus } from "../lib/analytics";
import { formatEuro } from "../lib/format";

interface PaymentStatusBarProps {
  status: ReturnType<typeof monthPaymentStatus>;
}

/** This month's payments by status: count, amount and share of the month's billing. */
const PaymentStatusBar: React.FC<PaymentStatusBarProps> = ({ status }) => {
  const navigate = useNavigate();
  const { t } = useTranslation("dashboard");

  const meters = [
    { key: "completed", color: BRAND.success },
    { key: "pending", color: BRAND.yellow },
    { key: "failed", color: BRAND.danger },
  ] as const;
  const billed = meters.reduce((s, m) => s + status[m.key].amount, 0) || 1;

  return (
    <div className="card border-0 shadow-sm km-dashboard__payments-bar">
      <div className="km-dashboard__pay-status">
        <div className="km-dashboard__pay-status-head">
          <div>
            <div className="km-stat-label mb-0">{t("paymentStatus.title")}</div>
            <small className="text-muted">
              {t("paymentStatus.billed", { amount: formatEuro(billed === 1 ? 0 : billed) })}
            </small>
          </div>
          <LinkButton onClick={() => navigate("/payments")}>{t("paymentStatus.details")}</LinkButton>
        </div>
        <div className="km-dashboard__meters">
          {meters.map(({ key, color }) => {
            const share = Math.round((status[key].amount / billed) * 100);
            return (
              <div key={key} className="km-dashboard__meter">
                <div className="km-dashboard__meter-meta">
                  <span className="km-dashboard__meter-label">
                    {t(`paymentStatus.${key}`)} · {status[key].count}
                  </span>
                  <span className="km-dashboard__meter-value">{formatEuro(status[key].amount)}</span>
                </div>
                <div className="km-dashboard__meter-track">
                  {/* Width and color are data-driven. */}
                  <div
                    className="km-dashboard__meter-fill"
                    style={{ width: `${Math.max(2, share)}%`, backgroundColor: color }}
                  />
                </div>
                <small className="text-muted">{share}%</small>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default PaymentStatusBar;
