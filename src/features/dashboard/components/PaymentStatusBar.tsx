import React from "react";
import { useNavigate } from "react-router-dom";
import { LinkButton, StatusBadge } from "@/shared/ui";
import { BRAND } from "@/shared/lib/brand";

interface PaymentStatusBarProps {
  /** [completed, pending, failed] */
  series: number[];
  isSample: boolean;
}

const PaymentStatusBar: React.FC<PaymentStatusBarProps> = ({
  series,
  isSample,
}) => {
  const navigate = useNavigate();

  const meters = [
    { label: "Ολοκληρωμενες", value: series[0], color: BRAND.paid },
    { label: "Εκκρεμεις", value: series[1], color: BRAND.pending },
    { label: "Αποτυχιες", value: series[2], color: BRAND.failed },
  ];
  const max = Math.max(...meters.map((m) => m.value), 1);

  return (
    <div className="card border-0 shadow-sm km-dashboard__payments-bar">
      <div className="km-dashboard__pay-status">
        <div className="km-dashboard__pay-status-head">
          <div className="d-flex align-items-center gap-2">
            <div className="km-stat-label mb-0">Κατασταση πληρωμων</div>
            {isSample && (
              <StatusBadge tone="neutral" label="Δειγμα" showDot={false} />
            )}
          </div>
          <LinkButton onClick={() => navigate("/payments")}>
            Λεπτομερειες
          </LinkButton>
        </div>
        <div className="km-dashboard__meters">
          {meters.map((meter) => (
            <div key={meter.label} className="km-dashboard__meter">
              <div className="km-dashboard__meter-meta">
                <span className="km-dashboard__meter-label">{meter.label}</span>
                <span className="km-dashboard__meter-value">{meter.value}</span>
              </div>
              <div className="km-dashboard__meter-track">
                {/* Width and color are data-driven. */}
                <div
                  className="km-dashboard__meter-fill"
                  style={{
                    width: `${Math.max(6, (meter.value / max) * 100)}%`,
                    backgroundColor: meter.color,
                  }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default PaymentStatusBar;
