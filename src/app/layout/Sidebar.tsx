import React from "react";
import { Link, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { X } from "lucide-react";
import { hasAnyPermission, useStaffAuth } from "@/features/auth";
import { staffPages, type StaffPage } from "@/app/router/staffPages";

interface SidebarProps {
  open: boolean;
  onClose: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ open, onClose }) => {
  const location = useLocation();
  const { t } = useTranslation("layout");
  const { role } = useStaffAuth();
  const visible = staffPages.filter(
    (item) => !item.anyOf || hasAnyPermission(role, item.anyOf),
  );
  const main = visible.filter((item) => item.section !== "finance");
  const finance = visible.filter((item) => item.section === "finance");

  const itemLink = (item: StaffPage) => {
    const Icon = item.icon;
    const href = `/${item.path}`;
    const label = (
      <>
        <span className="fs-5">
          <Icon size={20} />
        </span>
        <span>{t(`nav.${item.id}`)}</span>
      </>
    );
    if (item.external) {
      return (
        <a
          href={href}
          target="_blank"
          rel="noreferrer"
          className="nav-link w-100 text-start d-flex align-items-center gap-3 text-white"
          onClick={onClose}
        >
          {label}
        </a>
      );
    }
    return (
      <Link
        to={href}
        className={`nav-link w-100 text-start d-flex align-items-center gap-3 ${
          location.pathname === href ? "nav-buttons" : "text-white"
        }`}
        onClick={onClose}
      >
        {label}
      </Link>
    );
  };

  return (
    <>
      {open && (
        <div
          className="km-sidebar-backdrop d-lg-none position-fixed top-0 start-0 w-100 h-100 bg-dark bg-opacity-50"
          onClick={onClose}
        />
      )}

      <aside className={`km-sidebar text-white ${open ? "is-open" : ""}`}>
        <div className="p-3 py-4 d-flex align-items-center justify-content-between km-sidebar-brand flex-shrink-0">
          <div className="logo" aria-label="Melos">
            <span className="logo-mark">M</span>
            <span className="logo-name">Melos</span>
          </div>
          <div className="pt-1">
            <span className="km-brand-pipe mx-1">Gym Manager</span>
          </div>
          <button
            type="button"
            className="btn btn-link text-white p-0 d-lg-none"
            onClick={onClose}
            aria-label={t("topbar.closeMenu")}
          >
            <X size={20} />
          </button>
        </div>

        <nav className="km-sidebar__nav p-3">
          <ul className="nav nav-pills flex-column gap-2">
            {main.map((item) => (
              <li key={item.id} className="nav-item">
                {itemLink(item)}
              </li>
            ))}
          </ul>

          {finance.length > 0 && (
            <div className="km-nav-section">
              <div className="km-nav-section__label">{t("nav.financeSection")}</div>
              <ul className="nav nav-pills flex-column gap-2">
                {finance.map((item) => (
                  <li key={item.id} className="nav-item">
                    {itemLink(item)}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </nav>
      </aside>
    </>
  );
};

export default Sidebar;
