import React, { useState } from "react";
import { Link, useLocation, Outlet } from "react-router-dom";
import {
  Bell,
  Menu,
  X,
  User,
  BarChart3,
  Users,
  FileText,
  CreditCard,
  AlertTriangle,
  Calendar,
  Bell as BellIcon,
  Megaphone,
  Settings,
  ClipboardCheck,
  QrCode,
  Smartphone,
} from "lucide-react";
import GlobalQRScanner from "../components/GlobalQRScanner";
import "./MainLayout.scss";

const MainLayout: React.FC = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();

  const navigation = [
    {
      id: "dashboard",
      name: "Dashboard",
      icon: <BarChart3 size={20} />,
      path: "/dashboard",
    },
    {
      id: "members",
      name: "Μελη",
      icon: <Users size={20} />,
      path: "/members",
    },
    {
      id: "subscriptions",
      name: "Συνδρομες",
      icon: <FileText size={20} />,
      path: "/subscriptions",
    },
    {
      id: "payments",
      name: "Πληρωμες",
      icon: <CreditCard size={20} />,
      path: "/payments",
    },
    {
      id: "debts",
      name: "Οφειλες",
      icon: <AlertTriangle size={20} />,
      path: "/debts",
    },
    {
      id: "calendar",
      name: "Ημερολογιο",
      icon: <Calendar size={20} />,
      path: "/calendar",
    },
    {
      id: "attendance",
      name: "Προσελευση",
      icon: <ClipboardCheck size={20} />,
      path: "/attendance",
    },
    {
      id: "qr-scanner",
      name: "Σαρωση QR Code",
      icon: <QrCode size={20} />,
      path: "/qr-scanner",
    },
    {
      id: "view-qr",
      name: "Προβολη QR Code",
      icon: <Smartphone size={20} />,
      path: "/view-qr",
    },
    {
      id: "print-qr-codes",
      name: "Καρτες",
      icon: <QrCode size={20} />,
      path: "/print-qr-codes",
    },
    {
      id: "notifications",
      name: "Ειδοποιησεις",
      icon: <BellIcon size={20} />,
      path: "/notifications",
    },
    {
      id: "announcements",
      name: "Ανακοινωσεις",
      icon: <Megaphone size={20} />,
      path: "/announcements",
    },
    {
      id: "settings",
      name: "Ρυθμισεις",
      icon: <Settings size={20} />,
      path: "/settings",
    },
  ];

  return (
    <div className="d-flex vh-100 km-shell">
      {/* Mobile Overlay */}
      {sidebarOpen && (
        <div
          className="d-lg-none position-fixed top-0 start-0 w-100 h-100 bg-dark bg-opacity-50"
          style={{ zIndex: 1040 }}
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div
        className={`
        km-sidebar text-white d-flex flex-column
        ${sidebarOpen ? "position-fixed start-0 top-0" : "d-none"}
        d-lg-flex
        d-lg-block
      `}
        style={{
          width: "280px",
          minWidth: "280px",
          maxWidth: "280px",
          zIndex: 1050,
          height: "100vh",
          flexShrink: 0,
        }}
      >
        {/* Header */}
        <div className="p-3 py-4 d-flex align-items-center justify-content-between km-sidebar-brand">
          <div className="logo" aria-label="Melos">
            <span className="logo-mark">M</span>
            <span className="logo-name">Melos</span>
          </div>
          <div className="pt-1">
            <span className="km-brand-pipe mx-1">Gym Manager</span>
          </div>
          <button
            className="btn btn-link text-white p-0 d-lg-none"
            onClick={() => setSidebarOpen(false)}
          >
            <X size={20} />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-grow-1 p-3">
          <ul className="nav nav-pills flex-column gap-2">
            {navigation.map((item) => (
              <li key={item.id} className="nav-item">
                <Link
                  to={item.path}
                  className={`nav-link w-100 text-start d-flex align-items-center gap-3 ${location.pathname === item.path
                    ? "nav-buttons"
                    : "text-white"
                    }`}
                  onClick={() => setSidebarOpen(false)}
                >
                  <span className="fs-5">{item.icon}</span>
                  <span>{item.name}</span>
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </div>

      {/* Main Content */}
      <div
        className="flex-grow-1 d-flex flex-column km-main"
        style={{ overflow: "auto" }}
      >
        {/* Top Header */}
        <header className="km-topbar shadow-sm">
          <div className="container-fluid">
            <div className="row align-items-center py-3">
              <div className="col">
                <div className="d-flex align-items-center gap-3">
                  <button
                    className="btn btn-outline-secondary d-lg-none"
                    onClick={() => setSidebarOpen(true)}
                  >
                    <Menu size={20} />
                  </button>
                  <div>
                    <small className="welcome-label">
                      Καλως ηρθατε στο συστημα διαχειρισης
                    </small>
                  </div>
                </div>
              </div>
              <div className="col-auto">
                <div className="d-flex align-items-center gap-4">
                  <button className="btn btn-outline-secondary position-relative">
                    <Bell size={20} />
                    <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger">
                      3
                    </span>
                  </button>
                  <div className="d-flex align-items-center gap-2">
                    <div
                      className="km-avatar d-flex align-items-center justify-content-center"
                      style={{ width: "40px", height: "40px" }}
                    >
                      <User size={20} />
                    </div>
                    <div className="d-none d-md-block">
                      <div className="admin-name">Admin</div>
                      <small className="welcome-label">Διαχειριστης</small>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Content */}
        <main className="flex-grow-1 p-3 p-lg-4">
          <Outlet />
        </main>
      </div>

      {/* Global QR Scanner - Works on ALL pages */}
      <GlobalQRScanner />
    </div>
  );
};

export default MainLayout;
