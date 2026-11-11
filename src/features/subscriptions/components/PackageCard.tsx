import React from "react";
import { useTranslation } from "react-i18next";
import { Edit, Trash2 } from "lucide-react";
import { StatusBadge } from "@/shared/ui";
import type { Package } from "../types";

interface PackageCardProps {
  pkg: Package;
  /** Members currently on this package (derived from the members list). */
  activeMembers: number;
  showPrice: boolean;
  /** Edit/delete actions are rendered only when both handlers are given. */
  onEdit?: (pkg: Package) => void;
  onDelete?: (pkg: Package) => void;
}

const PackageCard: React.FC<PackageCardProps> = ({
  pkg,
  activeMembers,
  showPrice,
  onEdit,
  onDelete,
}) => {
  const { t } = useTranslation(["subscriptions", "common"]);

  return (
    <div className="card border-0 shadow-sm h-100">
      <div className="card-body">
        <div className="d-flex align-items-start justify-content-between mb-3 gap-2">
          <h5 className="card-title mb-0">{pkg.name}</h5>
          <StatusBadge status={pkg.category} />
        </div>

        <div className="mb-3">
          <small className="text-muted d-block">{t("fields.duration")}</small>
          <span className="text-dark">{pkg.duration}</span>
        </div>

        {showPrice && (
          <div className="mb-3">
            <div className="km-stat-value text-primary">€{pkg.price}</div>
          </div>
        )}

        <div className={onEdit && onDelete ? "mb-4" : undefined}>
          <small className="text-muted d-block">
            {t("fields.activeMembers")}
          </small>
          <span className="fw-semibold text-dark">{activeMembers}</span>
        </div>

        {onEdit && onDelete && (
        <div className="d-flex align-items-center gap-3">
          <button
            type="button"
            className="btn btn-link btn-sm km-action-link p-0"
            onClick={() => onEdit(pkg)}
          >
            <Edit size={16} className="me-1" />
            {t("common:actions.edit")}
          </button>
          <button
            type="button"
            className="btn btn-link btn-sm km-action-link km-action-danger p-0"
            onClick={() => onDelete(pkg)}
          >
            <Trash2 size={16} className="me-1" />
            {t("common:actions.delete")}
          </button>
        </div>
        )}
      </div>
    </div>
  );
};

export default PackageCard;
