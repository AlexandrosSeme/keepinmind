import React from "react";
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

interface MemberCardListProps extends MemberRowActions {
  members: Member[];
}

/** Mobile-only card layout of the members list. */
const MemberCardList: React.FC<MemberCardListProps> = ({
  members,
  onView,
  onEdit,
  onToggleCardLost,
  onPrintCard,
  onDelete,
  onPhotoClick,
}) => (
  <div className="d-md-none">
    {members.map((member) => (
      <div key={member.id} className="card border-0 shadow-sm mb-3">
        <div className="card-body">
          <div className="d-flex align-items-start justify-content-between mb-3">
            <div className="d-flex align-items-center">
              <MemberAvatar member={member} onPhotoClick={onPhotoClick} />
              <div>
                <h6
                  className="mb-1 km-clickable"
                  onClick={() => onView(member)}
                >
                  {member.name}
                </h6>
                <small className="text-muted">{member.phone}</small>
              </div>
            </div>
            <div className="d-flex flex-column align-items-end gap-1">
              <StatusBadge status={member.status} />
              {member.card_lost === true && (
                <StatusBadge
                  status="card_lost"
                  icon={<AlertTriangle size={11} />}
                  showDot={false}
                />
              )}
            </div>
          </div>
          <div className="row g-2 mb-3">
            <div className="col-6">
              <small className="text-muted d-block">Πακετο</small>
              <span className="text-dark">{member.package}</span>
            </div>
            <div className="col-6">
              <small className="text-muted d-block">Ληξη</small>
              <span className="text-dark">{member.expiry}</span>
            </div>
          </div>
          <div className="d-grid gap-2">
            <button
              className="btn btn-primary btn-sm"
              onClick={() => onView(member)}
            >
              <Eye size={14} className="me-1" />
              Προβολη
            </button>
            <button
              className="btn btn-outline-secondary btn-sm"
              onClick={() => onEdit(member)}
            >
              <Edit size={14} className="me-1" />
              Επεξεργασια
            </button>
            {member.card_lost === true ? (
              <>
                <button
                  className="btn btn-outline-secondary btn-sm"
                  onClick={() => onToggleCardLost(member)}
                >
                  <CreditCard size={14} className="me-1" />
                  Ενεργοποιηση Καρτας
                </button>
                <button
                  className="btn btn-outline-secondary btn-sm"
                  onClick={() => onPrintCard(member)}
                >
                  <Printer size={14} className="me-1" />
                  Εκτυπωση Νεας Καρτας
                </button>
              </>
            ) : (
              <button
                className="btn btn-outline-danger btn-sm"
                onClick={() => onToggleCardLost(member)}
              >
                <CreditCard size={14} className="me-1" />
                Ακυρωση Καρτας
              </button>
            )}
            <button
              className="btn btn-outline-danger btn-sm"
              onClick={() => onDelete(member)}
            >
              <Trash2 size={14} className="me-1" />
              Διαγραφη
            </button>
          </div>
        </div>
      </div>
    ))}
  </div>
);

export default MemberCardList;
