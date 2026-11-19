import React, { useEffect, useRef, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
  Bell,
  ChevronDown,
  ExternalLink,
  KeyRound,
  LogOut,
  Megaphone,
  Menu,
  QrCode,
  Settings,
  Smartphone,
  User,
  UserCog,
} from "lucide-react";
import { LanguageSwitcher } from "@/shared/ui";
import { ChangePasswordModal, useStaffAuth } from "@/features/auth";

interface TopBarProps {
  onMenuClick: () => void;
}

const TopBar: React.FC<TopBarProps> = ({ onMenuClick }) => {
  const { t } = useTranslation(["layout", "auth"]);
  const { profile, logout, can } = useStaffAuth();
  const location = useLocation();
  const menuRef = useRef<HTMLDivElement>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [changingPassword, setChangingPassword] = useState(false);
  const displayName = profile?.fullName || profile?.email || "";
  const canSettings = can("settings.business") || can("settings.dev");

  useEffect(() => {
    setMenuOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    if (!menuOpen) return;
    const onPointer = (event: PointerEvent) => {
      if (!menuRef.current?.contains(event.target as Node)) setMenuOpen(false);
    };
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setMenuOpen(false);
    };
    document.addEventListener("pointerdown", onPointer);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("pointerdown", onPointer);
      document.removeEventListener("keydown", onKey);
    };
  }, [menuOpen]);

  const closeAnd = (action?: () => void) => {
    setMenuOpen(false);
    action?.();
  };

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
            <div className="d-flex align-items-center gap-3">
              <LanguageSwitcher />
              <div className="km-account" ref={menuRef}>
                <button
                  type="button"
                  className="km-account__trigger"
                  aria-haspopup="menu"
                  aria-expanded={menuOpen}
                  aria-label={t("topbar.accountMenu")}
                  onClick={() => setMenuOpen((open) => !open)}
                >
                  <span className="km-avatar d-flex align-items-center justify-content-center">
                    <User size={20} />
                  </span>
                  <ChevronDown size={16} className={menuOpen ? "is-open" : ""} />
                </button>
                {menuOpen && (
                  <div className="km-account__menu" role="menu">
                    <div className="km-account__who">
                      <div className="admin-name">{displayName}</div>
                      {profile && (
                        <small className="welcome-label">
                          {t(`auth:roles.${profile.role}`)}
                        </small>
                      )}
                      {profile?.email && (
                        <div className="km-account__email">{profile.email}</div>
                      )}
                    </div>
                    <Link
                      to="/notifications"
                      className="km-account__item"
                      role="menuitem"
                      onClick={() => setMenuOpen(false)}
                    >
                      <Bell size={16} />
                      {t("nav.notifications")}
                    </Link>
                    <Link
                      to="/qr-scanner"
                      className="km-account__item"
                      role="menuitem"
                      onClick={() => setMenuOpen(false)}
                    >
                      <QrCode size={16} />
                      {t("nav.qr-scanner")}
                    </Link>
                    <Link
                      to="/announcements"
                      className="km-account__item"
                      role="menuitem"
                      onClick={() => setMenuOpen(false)}
                    >
                      <Megaphone size={16} />
                      {t("nav.announcements")}
                    </Link>
                    {canSettings && (
                      <Link
                        to="/settings"
                        className="km-account__item"
                        role="menuitem"
                        onClick={() => setMenuOpen(false)}
                      >
                        <Settings size={16} />
                        {t("nav.settings")}
                      </Link>
                    )}
                    {can("staff.manage") && (
                      <Link
                        to="/staff"
                        className="km-account__item"
                        role="menuitem"
                        onClick={() => setMenuOpen(false)}
                      >
                        <UserCog size={16} />
                        {t("nav.staff")}
                      </Link>
                    )}
                    <a
                      href="/member"
                      target="_blank"
                      rel="noreferrer"
                      className="km-account__item"
                      role="menuitem"
                      onClick={() => setMenuOpen(false)}
                    >
                      <Smartphone size={16} />
                      <span className="flex-grow-1">{t("nav.member-portal")}</span>
                      <ExternalLink size={14} />
                    </a>
                    <div className="km-account__rule" />
                    <button
                      type="button"
                      className="km-account__item"
                      role="menuitem"
                      onClick={() => closeAnd(() => setChangingPassword(true))}
                    >
                      <KeyRound size={16} />
                      {t("auth:changePassword.title")}
                    </button>
                    <button
                      type="button"
                      className="km-account__item is-danger"
                      role="menuitem"
                      onClick={() => closeAnd(logout)}
                    >
                      <LogOut size={16} />
                      {t("auth:logout")}
                    </button>
                  </div>
                )}
              </div>
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
