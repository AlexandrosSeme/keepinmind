import { Suspense } from "react";
import { NavLink, Outlet, Navigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
  Home,
  Megaphone,
  Calendar,
  Bookmark,
  QrCode,
  User,
} from "lucide-react";
import { LanguageSwitcher, PageLoader } from "@/shared/ui";
import { useMemberSession } from "../session/useMemberSession";
import "../styles/memberPortal.scss";

const MemberLayout: React.FC = () => {
  const { t } = useTranslation("memberPortal");
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
    {
      to: "/member/app",
      end: true,
      icon: <Home size={20} />,
      label: t("nav.home"),
    },
    {
      to: "/member/app/announcements",
      icon: <Megaphone size={20} />,
      label: t("nav.announcements"),
    },
    {
      to: "/member/app/schedule",
      icon: <Calendar size={20} />,
      label: t("nav.schedule"),
    },
    {
      to: "/member/app/bookings",
      icon: <Bookmark size={20} />,
      label: t("nav.bookings"),
    },
    { to: "/member/app/qr", icon: <QrCode size={20} />, label: t("nav.qr") },
    {
      to: "/member/app/profile",
      icon: <User size={20} />,
      label: t("nav.profile"),
    },
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
        <LanguageSwitcher className="mp-lang" />
      </header>

      <main className="mp-main">
        <Suspense fallback={<PageLoader />}>
          <Outlet />
        </Suspense>
      </main>

      <nav className="mp-nav" aria-label={t("nav.ariaLabel")}>
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
