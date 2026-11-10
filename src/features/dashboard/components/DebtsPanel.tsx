import React, { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { CheckCircle } from "lucide-react";
import { LinkButton, PanelCard, StatusBadge } from "@/shared/ui";
import type { Debt } from "@/features/debts";
import DashboardEmpty from "./DashboardEmpty";

const DebtsPanel: React.FC<{ debts: Debt[] }> = ({ debts }) => {
  const navigate = useNavigate();
  const sorted = useMemo(
    () =>
      [...debts]
        .sort((a, b) => b.daysOverdue - a.daysOverdue || b.amount - a.amount)
        .slice(0, 6),
    [debts],
  );

  return (
    <PanelCard
      title="Οφειλες"
      action={<LinkButton onClick={() => navigate("/debts")}>Ολα</LinkButton>}
      className="km-dashboard__panel"
      bodyClassName="p-0 km-dashboard__scroll"
    >
      {sorted.length === 0 ? (
        <DashboardEmpty
          icon={<CheckCircle size={22} className="mb-1 opacity-50" />}
          text="Καμια οφειλη"
        />
      ) : (
        sorted.map((debt) => (
          <div
            key={debt.id}
            className="km-dashboard__row d-flex align-items-center justify-content-between gap-2"
          >
            <div className="min-w-0">
              <div className="fw-semibold text-dark text-truncate">
                {debt.name}
              </div>
              <small className="text-muted">
                {debt.daysOverdue} ημ. ·{" "}
                <LinkButton
                  className="align-baseline"
                  onClick={() => navigate("/payments")}
                >
                  Πληρωμη
                </LinkButton>
              </small>
            </div>
            <div className="text-end flex-shrink-0">
              <div className="fw-bold text-danger km-dashboard__debt-amount">
                €{debt.amount}
              </div>
              <StatusBadge status={debt.status} showDot={false} />
            </div>
          </div>
        ))
      )}
    </PanelCard>
  );
};

export default DebtsPanel;
