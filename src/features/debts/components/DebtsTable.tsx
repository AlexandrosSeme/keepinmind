import React from "react";
import { useTranslation } from "react-i18next";
import { Clock, Edit, Euro, Mail, Phone, Trash2 } from "lucide-react";
import i18n from "@/shared/i18n";
import { IconAvatar, StatusBadge } from "@/shared/ui";
import type { Debt } from "../types";

interface DebtsTableProps {
  debts: Debt[];
  onEdit: (debt: Debt) => void;
  onDelete: (debt: Debt) => void;
}

const callPhone = (phone?: string) => {
  if (!phone) {
    alert(i18n.t("debts:table.noPhone"));
    return;
  }
  window.location.href = `tel:${phone}`;
};

const sendMail = (email?: string) => {
  if (!email) {
    alert(i18n.t("debts:table.noEmail"));
    return;
  }
  window.location.href = `mailto:${email}`;
};

const DebtsTable: React.FC<DebtsTableProps> = ({ debts, onEdit, onDelete }) => {
  const { t } = useTranslation(["debts", "common"]);

  return (
    <div className="card border-0 shadow-sm km-table-card">
      <div className="card-body p-0">
        <div className="table-responsive">
          <table className="table table-hover mb-0 km-table">
            <thead className="table-light">
              <tr>
                <th className="border-0 ps-4">{t("fields.member")}</th>
                <th className="border-0">{t("fields.amount")}</th>
                <th className="border-0">{t("fields.daysOverdue")}</th>
                <th className="border-0">{t("fields.status")}</th>
                <th className="border-0">{t("fields.lastContact")}</th>
                <th className="border-0 pe-4">{t("table.actions")}</th>
              </tr>
            </thead>
            <tbody>
              {debts.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center text-muted py-5">
                    {t("table.empty")}
                  </td>
                </tr>
              ) : (
                debts.map((debt) => (
                  <tr key={debt.id}>
                    <td className="ps-4">
                      <div className="d-flex align-items-center">
                        <IconAvatar className="me-3">
                          <Euro size={18} />
                        </IconAvatar>
                        <div>
                          <div className="fw-semibold text-dark">
                            {debt.name}
                          </div>
                          <small className="text-muted">
                            {debt.phone || "—"}
                          </small>
                        </div>
                      </div>
                    </td>
                    <td>
                      <span className="fw-semibold text-danger">
                        €{debt.amount}
                      </span>
                    </td>
                    <td>
                      <div className="d-flex align-items-center gap-2 text-muted">
                        <Clock size={16} />
                        <span className="fw-semibold text-dark">
                          {t("table.days", { count: debt.daysOverdue })}
                        </span>
                      </div>
                    </td>
                    <td>
                      <StatusBadge status={debt.status} />
                    </td>
                    <td>
                      <small className="text-muted">
                        {debt.lastContact || "—"}
                      </small>
                    </td>
                    <td className="pe-4">
                      <div className="d-flex align-items-center gap-2">
                        <button
                          type="button"
                          className="btn btn-link btn-sm km-action-link"
                          title={t("table.call")}
                          onClick={() => callPhone(debt.phone)}
                        >
                          <Phone size={16} />
                        </button>
                        <button
                          type="button"
                          className="btn btn-link btn-sm km-action-link"
                          title={t("fields.email")}
                          onClick={() => sendMail(debt.email)}
                        >
                          <Mail size={16} />
                        </button>
                        <button
                          type="button"
                          className="btn btn-link btn-sm km-action-link"
                          title={t("common:actions.edit")}
                          onClick={() => onEdit(debt)}
                        >
                          <Edit size={16} />
                        </button>
                        <button
                          type="button"
                          className="btn btn-link btn-sm km-action-link km-action-danger"
                          title={t("common:actions.delete")}
                          onClick={() => onDelete(debt)}
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

export default DebtsTable;
