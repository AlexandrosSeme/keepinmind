import React from "react";
import { useTranslation } from "react-i18next";
import { CreditCard, Edit, Eye, Trash2 } from "lucide-react";
import { IconAvatar, StatusBadge } from "@/shared/ui";
import type { Payment } from "../types";
import { paymentMethodLabel } from "../methods";

interface PaymentsTableProps {
  payments: Payment[];
  onView: (payment: Payment) => void;
  onEdit: (payment: Payment) => void;
  onDelete: (payment: Payment) => void;
}

const PaymentsTable: React.FC<PaymentsTableProps> = ({
  payments,
  onView,
  onEdit,
  onDelete,
}) => {
  const { t } = useTranslation(["payments", "common"]);

  return (
    <div className="card border-0 shadow-sm km-table-card">
      <div className="card-body p-0">
        <div className="table-responsive">
          <table className="table table-hover mb-0 km-table">
            <thead className="table-light">
              <tr>
                <th className="border-0 ps-4">{t("fields.member")}</th>
                <th className="border-0">{t("fields.amount")}</th>
                <th className="border-0">{t("fields.date")}</th>
                <th className="border-0">{t("fields.method")}</th>
                <th className="border-0">{t("fields.status")}</th>
                <th className="border-0 pe-4">{t("table.actions")}</th>
              </tr>
            </thead>
            <tbody>
              {payments.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center text-muted py-5">
                    {t("table.empty")}
                  </td>
                </tr>
              ) : (
                payments.map((payment) => (
                  <tr key={payment.id}>
                    <td className="ps-4">
                      <div className="d-flex align-items-center">
                        <IconAvatar className="me-3">
                          <CreditCard size={18} />
                        </IconAvatar>
                        <div className="fw-semibold text-dark">
                          {payment.memberName}
                        </div>
                      </div>
                    </td>
                    <td>
                      <span className="fw-semibold">€{payment.amount}</span>
                    </td>
                    <td>
                      <span className="text-muted">{payment.date}</span>
                    </td>
                    <td>
                      <span className="text-muted">
                        {paymentMethodLabel(payment.method)}
                      </span>
                    </td>
                    <td>
                      <StatusBadge status={payment.status} />
                    </td>
                    <td className="pe-4">
                      <div className="d-flex align-items-center gap-2">
                        <button
                          type="button"
                          className="btn btn-link btn-sm km-action-link"
                          title={t("table.view")}
                          onClick={() => onView(payment)}
                        >
                          <Eye size={16} />
                        </button>
                        <button
                          type="button"
                          className="btn btn-link btn-sm km-action-link"
                          title={t("common:actions.edit")}
                          onClick={() => onEdit(payment)}
                        >
                          <Edit size={16} />
                        </button>
                        <button
                          type="button"
                          className="btn btn-link btn-sm km-action-link km-action-danger"
                          title={t("common:actions.delete")}
                          onClick={() => onDelete(payment)}
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default PaymentsTable;
