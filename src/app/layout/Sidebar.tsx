import React from "react";
import { Link, useLocation } from "react-router-dom";
import { X } from "lucide-react";
import { navItems } from "./navItems";

interface SidebarProps {
  open: boolean;
  onClose: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ open, onClose }) => {
  const location = useLocation();

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
          >
            <X size={20} />
          </button>
        </div>

        <nav className="km-sidebar__nav p-3">
          <ul className="nav nav-pills flex-column gap-2">
            {navItems.map(({ id, name, icon: Icon, path, external }) => (
              <li key={id} className="nav-item">
                {external ? (
                  <a
                    href={path}
                    target="_blank"
                    rel="noreferrer"
                    className="nav-link w-100 text-start d-flex align-items-center gap-3 text-white"
                    onClick={onClose}
                  >
                    <span className="fs-5">
                      <Icon size={20} />
                    </span>
                    <span>{name}</span>
                  </a>
                ) : (
                  <Link
                    to={path}
                    className={`nav-link w-100 text-start d-flex align-items-center gap-3 ${
                      location.pathname === path ? "nav-buttons" : "text-white"
                    }`}
                    onClick={onClose}
                  >
                    <span className="fs-5">
                      <Icon size={20} />
                    </span>
                    <span>{name}</span>
                  </Link>
                )}
              </li>
            ))}
          </ul>
        </nav>
      </aside>
    </>
  );
};

export default Sidebar;
