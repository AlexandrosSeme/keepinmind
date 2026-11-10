import React from "react";
import { Edit, Trash2 } from "lucide-react";
import { StatusBadge } from "@/shared/ui";
import type { Package } from "../types";

interface PackageCardProps {
  pkg: Package;
  onEdit: (pkg: Package) => void;
  onDelete: (pkg: Package) => void;
}

const PackageCard: React.FC<PackageCardProps> = ({ pkg, onEdit, onDelete }) => (
  <div className="card border-0 shadow-sm h-100">
    <div className="card-body">
      <div className="d-flex align-items-start justify-content-between mb-3 gap-2">
        <h5 className="card-title mb-0">{pkg.name}</h5>
        <StatusBadge status={pkg.category} />
      </div>

      <div className="mb-3">
        <small className="text-muted d-block">Διαρκεια</small>
        <span className="text-dark">{pkg.duration}</span>
      </div>

      <div className="mb-3">
        <div className="km-stat-value text-primary">€{pkg.price}</div>
      </div>

      <div className="mb-4">
        <small className="text-muted d-block">Ενεργα μελη</small>
        <span className="fw-semibold text-dark">{pkg.active}</span>
      </div>

      <div className="d-flex align-items-center gap-3">
        <button
          type="button"
          className="btn btn-link btn-sm km-action-link p-0"
          onClick={() => onEdit(pkg)}
        >
          <Edit size={16} className="me-1" />
          Επεξεργασια
        </button>
        <button
          type="button"
          className="btn btn-link btn-sm km-action-link km-action-danger p-0"
          onClick={() => onDelete(pkg)}
        >
          <Trash2 size={16} className="me-1" />
          Διαγραφη
        </button>
      </div>
    </div>
  </div>
);

export default PackageCard;
