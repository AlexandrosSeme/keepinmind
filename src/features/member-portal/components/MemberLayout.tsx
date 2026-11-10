import { NavLink, Outlet, Navigate } from "react-router-dom";
import {
  Home,
  Megaphone,
  Calendar,
  Bookmark,
  QrCode,
  User,
} from "lucide-react";
import { useMemberSession } from "../contexts/MemberSessionContext";
import "./MemberLayout.scss";

const MemberLayout: React.FC = () => {
  const { session, loading } = useMemberSession();

  if (loading) {
    return (
      <div className="mp-shell mp-shell--center">
        <div className="spinner-border text-warning" role="status" />
      </div>
    );
  }

  if (!session) {
    return <Navigate to="/member" replace />;
  }

  const nav = [
    { to: "/member/app", end: true, icon: <Home size={20} />, label: "Αρχικη" },
    {
      to: "/member/app/announcements",
      icon: <Megaphone size={20} />,
      label: "Νεα",
    },
    {
      to: "/member/app/schedule",
      icon: <Calendar size={20} />,
      label: "Προγραμμα",
    },
    {
      to: "/member/app/bookings",
      icon: <Bookmark size={20} />,
      label: "Κρατησεις",
    },
    { to: "/member/app/qr", icon: <QrCode size={20} />, label: "QR" },
    { to: "/member/app/profile", icon: <User size={20} />, label: "Προφιλ" },
  ];

  return (
    <div className="mp-shell">
      <header className="mp-top">
        <div className="mp-brand">
          <div className="mp-brand-mark">
            <span>M</span>
          </div>
          <div>
            <div className="mp-brand-name">Melos</div>
            <div className="mp-brand-sub">Member</div>
          </div>
        </div>
      </header>

      <main className="mp-main">
        <Outlet />
      </main>

      <nav className="mp-nav" aria-label="Member navigation">
        {nav.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.end}
            className={({ isActive }) =>
              `mp-nav-item${isActive ? " is-active" : ""}`
            }
          >
            {item.icon}
            <span>{item.label}</span>
          </NavLink>
        ))}
      </nav>
    </div>
  );
};

export default MemberLayout;
