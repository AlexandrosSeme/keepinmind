import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
  Calendar,
  Megaphone,
  QrCode,
  Bookmark,
  AlertTriangle,
} from "lucide-react";
import { StatusBadge } from "@/shared/ui";
import { intlLocale } from "@/shared/i18n";
import {
  fetchAnnouncements,
  type Announcement,
} from "@/features/announcements";
import { fetchMemberBookings, type Booking } from "@/features/bookings";
import { fetchMemberDebts, type Debt } from "@/features/debts";
import { useMemberSession } from "../session/useMemberSession";

const MemberHome: React.FC = () => {
  const { t } = useTranslation("memberPortal");
  const { member, session } = useMemberSession();
  const [announcement, setAnnouncement] = useState<Announcement | null>(null);
  const [upcoming, setUpcoming] = useState<Booking[]>([]);
  const [debts, setDebts] = useState<Debt[]>([]);

  useEffect(() => {
    if (!member) return;
    (async () => {
      const [anns, books, d] = await Promise.all([
        fetchAnnouncements(),
        fetchMemberBookings(member.id),
        fetchMemberDebts(member.name),
      ]);
      setAnnouncement(anns[0] || null);
      const now = Date.now();
      setUpcoming(
        books
          .filter(
            (b) =>
              b.status !== "cancelled" &&
              new Date(b.startTime).getTime() >= now,
          )
          .slice(0, 3),
      );
      setDebts(d);
    })();
  }, [member]);

  if (!member || !session) return null;

  const firstName = member.name.split(" ")[0];

  return (
    <div>
      <h1 className="mp-page-title">
        {t("home.greeting", { name: firstName })}
      </h1>
      <p className="mp-page-sub">{t("home.subtitle")}</p>

      <div className="mp-stat-row">
        <div className="mp-stat">
          <div className="mp-stat-label">{t("home.status")}</div>
          <div className="mt-2">
            <StatusBadge status={member.status} />
          </div>
        </div>
        <div className="mp-stat">
          <div className="mp-stat-label">{t("home.expiry")}</div>
          <div className="mp-stat-value mp-stat-value--sm">
            {member.expiry || "—"}
          </div>
        </div>
      </div>

      <div className="mp-card">
        <div className="mp-card-title">{t("home.package")}</div>
        <div className="fw-semibold">
          {member.package || t("home.noPackage")}
        </div>
        {member.card_lost && (
          <div className="mt-2">
            <StatusBadge status="card_lost" />
          </div>
        )}
      </div>

      {debts.length > 0 && (
        <div className="mp-card mp-card--danger">
          <div className="mp-card-title d-flex align-items-center gap-2">
            <AlertTriangle size={16} className="text-danger" />
            {t("home.debts")}
          </div>
          {debts.map((d) => (
            <div
              key={d.id}
              className="d-flex justify-content-between align-items-center mb-1"
            >
              <StatusBadge status={d.status} showDot={false} />
              <strong className="text-danger">€{d.amount}</strong>
            </div>
          ))}
          <small className="text-muted">{t("home.debtsHint")}</small>
        </div>
      )}

      {announcement && (
        <div className="mp-card">
          <div className="mp-card-title d-flex align-items-center gap-2">
            <Megaphone size={16} />
            {t("home.latestAnnouncement")}
          </div>
          <div className="fw-semibold mb-1">{announcement.title}</div>
          <p className="text-muted mb-2 mp-text-sm">
            {announcement.body.length > 120
              ? `${announcement.body.slice(0, 120)}…`
              : announcement.body}
          </p>
          <Link to="/member/app/announcements" className="mp-btn mp-btn-ghost">
            {t("home.allAnnouncements")}
          </Link>
        </div>
      )}

      <div className="mp-card">
        <div className="mp-card-title d-flex align-items-center gap-2">
          <Bookmark size={16} />
          {t("home.upcomingBookings")}
        </div>
        {upcoming.length === 0 ? (
          <div className="mp-empty py-3">{t("home.noBookings")}</div>
        ) : (
          upcoming.map((b) => (
            <div
              key={b.id}
              className="d-flex justify-content-between align-items-start mb-2 pb-2 border-bottom"
            >
              <div>
                <div className="fw-semibold">{b.title}</div>
                <div className="mp-session-time">
                  {new Date(b.startTime).toLocaleString(intlLocale(), {
                    weekday: "short",
                    day: "numeric",
                    month: "short",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </div>
              </div>
              <span className="mp-chip">{b.type}</span>
            </div>
          ))
        )}
        <div className="mp-actions">
          <Link to="/member/app/schedule" className="mp-btn mp-btn-primary">
            <Calendar size={16} />
            {t("home.schedule")}
          </Link>
          <Link to="/member/app/qr" className="mp-btn mp-btn-ghost">
            <QrCode size={16} />
            {t("home.entryQr")}
          </Link>
        </div>
      </div>
    </div>
  );
};

export default MemberHome;
