import React from "react";
import { useTranslation } from "react-i18next";
import {
  AlertTriangle,
  CreditCard,
  Edit,
  Eye,
  Printer,
  Trash2,
} from "lucide-react";
import { StatusBadge } from "@/shared/ui";
import type { Member } from "../types";
import type { MemberRowActions } from "./memberActions";
import MemberAvatar from "./MemberAvatar";

interface MembersTableProps extends MemberRowActions {
  members: Member[];
}

const MembersTable: React.FC<MembersTableProps> = ({
  members,
  onView,
  onEdit,
  onToggleCardLost,
  onPrintCard,
  onDelete,
  onPhotoClick,
}) => {
  const { t } = useTranslation(["members", "common"]);

  return (
    <div className="card border-0 shadow-sm km-table-card">
      <div className="card-body p-0">
        <div className="table-responsive">
          <table className="table table-hover mb-0 km-table">
            <thead className="table-light">
              <tr>
                <th className="border-0 ps-4">{t("fields.name")}</th>
                <th className="border-0">{t("fields.phone")}</th>
                <th className="border-0 d-none d-md-table-cell">
                  {t("fields.package")}
                </th>
                <th className="border-0 d-none d-lg-table-cell">
                  {t("fields.expiry")}
                </th>
                <th className="border-0">{t("fields.status")}</th>
                <th className="border-0 pe-4">{t("fields.actions")}</th>
              </tr>
            </thead>
            <tbody>
              {members.map((member) => (
                <tr key={member.id}>
                  <td className="ps-4">
                    <div className="d-flex align-items-center">
                      <MemberAvatar
                        member={member}
                        onPhotoClick={onPhotoClick}
                      />
                      <div>
                        <div
                          className="fw-semibold text-dark km-clickable"
                          onClick={() => onView(member)}
                        >
                          {member.name}
                        </div>
                        <small className="text-muted d-md-none">
                          {member.phone}
                        </small>
                      </div>
                    </div>
                  </td>
                  <td className="d-none d-md-table-cell">
                    <span className="text-muted">{member.phone}</span>
                  </td>
                  <td className="d-none d-md-table-cell">
                    <span className="text-muted">{member.package}</span>
                  </td>
                  <td className="d-none d-lg-table-cell">
                    <span className="text-muted">{member.expiry}</span>
                  </td>
                  <td>
                    <div className="d-flex flex-column align-items-start gap-1">
                      <StatusBadge status={member.status} />
                      {member.card_lost === true && (
                        <StatusBadge
                          status="card_lost"
                          icon={<AlertTriangle size={11} />}
                          showDot={false}
                        />
                      )}
                    </div>
                  </td>
                  <td className="pe-4">
                    <div className="btn-group" role="group">
                      <button
                        className="btn btn-link btn-sm km-action-link p-0 me-2"
                        onClick={() => onView(member)}
                        title={t("actions.view")}
                      >
                        <Eye size={16} />
                      </button>
                      <button
                        className="btn btn-link btn-sm km-action-link p-0 me-2"
                        onClick={() => onEdit(member)}
                        title={t("common:actions.edit")}
                      >
                        <Edit size={16} />
                      </button>
                      {member.card_lost === true ? (
                        <>
                          <button
                            className="btn btn-link btn-sm km-action-link p-0 me-2"
                            onClick={() => onToggleCardLost(member)}
                            title={t("actions.activateCard")}
                          >
                            <CreditCard size={16} />
                          </button>
                          <button
                            className="btn btn-link btn-sm km-action-link p-0 me-2"
                            onClick={() => onPrintCard(member)}
                            title={t("actions.printNewCard")}
                          >
                            <Printer size={16} />
                          </button>
                        </>
                      ) : (
                        <button
                          className="btn btn-link btn-sm km-action-link km-action-danger p-0 me-2"
                          onClick={() => onToggleCardLost(member)}
                          title={t("actions.cancelCardLost")}
                        >
                          <CreditCard size={16} />
                        </button>
                      )}
                      <button
                        className="btn btn-link btn-sm km-action-link km-action-danger p-0"
                        onClick={() => onDelete(member)}
                        title={t("common:actions.delete")}
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default MembersTable;
