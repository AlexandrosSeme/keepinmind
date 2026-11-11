import React from "react";
import { useTranslation } from "react-i18next";
import { Bell, Menu, User } from "lucide-react";
import { LanguageSwitcher } from "@/shared/ui";

interface TopBarProps {
  onMenuClick: () => void;
}

const TopBar: React.FC<TopBarProps> = ({ onMenuClick }) => {
  const { t } = useTranslation("layout");
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
                  <div className="admin-name">Admin</div>
                  <small className="welcome-label">{t("topbar.role")}</small>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default TopBar;
