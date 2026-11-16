import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { Bell, KeyRound, LogOut, Menu, User } from "lucide-react";
import { LanguageSwitcher } from "@/shared/ui";
import { ChangePasswordModal, useStaffAuth } from "@/features/auth";

interface TopBarProps {
  onMenuClick: () => void;
}

const TopBar: React.FC<TopBarProps> = ({ onMenuClick }) => {
  const { t } = useTranslation(["layout", "auth"]);
  const { profile, logout } = useStaffAuth();
  const [changingPassword, setChangingPassword] = useState(false);
  const displayName = profile?.fullName || profile?.email || "";

  return (
    <header className="km-topbar shadow-sm">
      <div className="container-fluid">
        <div className="row align-items-center py-3">
          <div className="col">
            <div className="d-flex align-items-center gap-3">
              <button
                type="button"
                className="btn btn-outline-secondary d-lg-none"
                onClick={onMenuClick}
                aria-label={t("topbar.openMenu")}
              >
                <Menu size={20} />
              </button>
              <div className="d-none d-sm-block">
                <small className="welcome-label">{t("topbar.welcome")}</small>
              </div>
            </div>
          </div>
          <div className="col-auto">
            <div className="d-flex align-items-center gap-3 gap-md-4">
              <LanguageSwitcher />
              <button
                type="button"
                className="btn btn-outline-secondary position-relative"
                aria-label={t("topbar.notifications")}
              >
                <Bell size={20} />
                <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger">
                  3
                </span>
              </button>
              <div className="d-flex align-items-center gap-2">
                <div className="km-avatar d-flex align-items-center justify-content-center">
                  <User size={20} />
                </div>
                <div className="d-none d-md-block">
                  <div className="admin-name">{displayName}</div>
                  {profile && (
                    <small className="welcome-label">
                      {t(`auth:roles.${profile.role}`)}
                    </small>
                  )}
                </div>
              </div>
              <button
                type="button"
                className="btn btn-outline-secondary"
                onClick={() => setChangingPassword(true)}
                aria-label={t("auth:changePassword.title")}
                title={t("auth:changePassword.title")}
              >
                <KeyRound size={20} />
              </button>
              <button
                type="button"
                className="btn btn-outline-secondary"
                onClick={logout}
                aria-label={t("auth:logout")}
                title={t("auth:logout")}
              >
                <LogOut size={20} />
              </button>
            </div>
          </div>
        </div>
      </div>
      {changingPassword && (
        <ChangePasswordModal onClose={() => setChangingPassword(false)} />
      )}
    </header>
  );
};

export default TopBar;
