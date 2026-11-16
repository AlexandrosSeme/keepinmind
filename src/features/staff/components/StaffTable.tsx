import React from "react";
import { useTranslation } from "react-i18next";
import { Edit, Trash2, UserCog } from "lucide-react";
import { IconAvatar } from "@/shared/ui";
import { intlLocale } from "@/shared/i18n";
import type { StaffUser } from "@/features/auth";

export interface StaffRow extends StaffUser {
  isSelf: boolean;
  canManage: boolean;
}

interface StaffTableProps {
  users: StaffRow[];
  onEdit: (user: StaffRow) => void;
  onDelete: (user: StaffRow) => void;
}

const formatDate = (iso: string | null) =>
  iso
    ? new Date(iso).toLocaleString(intlLocale(), {
        dateStyle: "short",
        timeStyle: "short",
      })
    : "—";

const StaffTable: React.FC<StaffTableProps> = ({ users, onEdit, onDelete }) => {
  const { t } = useTranslation(["staff", "auth", "common"]);

  return (
    <div className="card border-0 shadow-sm km-table-card">
      <div className="card-body p-0">
        <div className="table-responsive">
          <table className="table table-hover mb-0 km-table">
            <thead className="table-light">
              <tr>
                <th className="border-0 ps-4">{t("fields.fullName")}</th>
                <th className="border-0">{t("fields.role")}</th>
                <th className="border-0">{t("fields.lastSignIn")}</th>
                <th className="border-0 pe-4">{t("table.actions")}</th>
              </tr>
            </thead>
            <tbody>
              {users.length === 0 ? (
                <tr>
                  <td colSpan={4} className="text-center text-muted py-5">
                    {t("table.empty")}
                  </td>
                </tr>
              ) : (
                users.map((user) => (
                  <tr key={user.id}>
                    <td className="ps-4">
                      <div className="d-flex align-items-center">
                        <IconAvatar className="me-3">
                          <UserCog size={18} />
                        </IconAvatar>
                        <div className="min-w-0">
                          <div className="fw-semibold text-dark">
                            {user.fullName || user.email}
                            {user.isSelf && (
                              <span className="text-muted fw-normal ms-1">
                                ({t("table.you")})
                              </span>
                            )}
                          </div>
                          <small className="text-muted">{user.email}</small>
                        </div>
                      </div>
                    </td>
                    <td>{t(`auth:roles.${user.role}`)}</td>
                    <td>
                      <span className="text-muted">
                        {formatDate(user.lastSignInAt)}
                      </span>
                    </td>
                    <td className="pe-4">
                      <div className="d-flex align-items-center gap-3">
                        {(user.canManage || user.isSelf) && (
                          <button
                            type="button"
                            className="btn btn-link btn-sm km-action-link p-0"
                            onClick={() => onEdit(user)}
                            title={t("common:actions.edit")}
                            aria-label={t("common:actions.edit")}
                          >
                            <Edit size={16} />
                          </button>
                        )}
                        {user.canManage && (
                          <button
                            type="button"
                            className="btn btn-link btn-sm km-action-link km-action-danger p-0"
                            onClick={() => onDelete(user)}
                            title={t("common:actions.delete")}
                            aria-label={t("common:actions.delete")}
                          >
                            <Trash2 size={16} />
                          </button>
                        )}
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

export default StaffTable;
