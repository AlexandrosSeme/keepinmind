import React, { type ReactNode } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { ShieldAlert } from "lucide-react";
import { hasAnyPermission, type Permission } from "../permissions";
import { useStaffAuth } from "../session/useStaffAuth";

interface RequirePermissionProps {
  /** Access is granted when the role has at least one of these permissions. */
  anyOf: readonly Permission[];
  children: ReactNode;
}

export const ForbiddenPage: React.FC = () => {
  const { t } = useTranslation("auth");
  return (
    <div className="card border-0 shadow-sm">
      <div className="card-body text-center py-5">
        <ShieldAlert size={40} className="text-danger mb-3" />
        <h5>{t("forbidden.title")}</h5>
        <p className="text-muted mb-4">{t("forbidden.text")}</p>
        <Link to="/dashboard" className="btn btn-primary">
          {t("forbidden.back")}
        </Link>
      </div>
    </div>
  );
};

const RequirePermission: React.FC<RequirePermissionProps> = ({
  anyOf,
  children,
}) => {
  const { role } = useStaffAuth();
  return hasAnyPermission(role, anyOf) ? <>{children}</> : <ForbiddenPage />;
};

export default RequirePermission;
