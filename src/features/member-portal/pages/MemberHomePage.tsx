import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  Calendar,
  Megaphone,
  QrCode,
  Bookmark,
  AlertTriangle,
} from "lucide-react";
import { useMemberSession } from "../../contexts/MemberSessionContext";
import StatusBadge from "../ui/StatusBadge";
import { fetchAnnouncements } from "../../services/announcementService";
import { fetchMemberBookings } from "../../services/bookingService";
import { fetchMemberDebts } from "../../services/memberAuthService";
import type { Announcement, Booking, Debt } from "../../types";

const MemberHome: React.FC = () => {
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
              new Date(b.startTime).getTime() >= now
          )
          .slice(0, 3)
      );
      setDebts(d);
    })();
  }, [member]);

  if (!member || !session) return null;

  const firstName = member.name.split(" ")[0];

  return (
    <div>
      <h1 className="mp-page-title">Γεια σου, {firstName}</h1>
      <p className="mp-page-sub">Ο λογαριασμος σου Melos με μια ματια.</p>

      <div className="mp-stat-row">
        <div className="mp-stat">
          <div className="mp-stat-label">Κατασταση</div>
          <div className="mt-2">
            <StatusBadge status={member.status} />
          </div>
        </div>
        <div className="mp-stat">
          <div className="mp-stat-label">Ληξη</div>
          <div className="mp-stat-value" style={{ fontSize: "1.1rem" }}>
            {member.expiry || "—"}
          </div>
        </div>
      </div>

      <div className="mp-card">
        <div className="mp-card-title">Πακετο</div>
        <div className="fw-semibold">{member.package || "Δεν εχει οριστει"}</div>
        {member.card_lost && (
          <div className="mt-2">
            <StatusBadge status="card_lost" />
          </div>
        )}
      </div>

      {debts.length > 0 && (
        <div className="mp-card" style={{ borderColor: "rgba(214,59,59,0.35)" }}>
          <div className="mp-card-title d-flex align-items-center gap-2">
            <AlertTriangle size={16} className="text-danger" />
            Οφειλες
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
          <small className="text-muted">
            Περασε απο reception για εξοφληση.
          </small>
        </div>
      )}

      {announcement && (
        <div className="mp-card">
          <div className="mp-card-title d-flex align-items-center gap-2">
            <Megaphone size={16} />
            Τελευταια ανακοινωση
          </div>
          <div className="fw-semibold mb-1">{announcement.title}</div>
          <p className="text-muted mb-2" style={{ fontSize: "0.9rem" }}>
            {announcement.body.length > 120
              ? `${announcement.body.slice(0, 120)}…`
              : announcement.body}
          </p>
          <Link to="/member/app/announcements" className="mp-btn mp-btn-ghost">
            Ολες οι ανακοινωσεις
          </Link>
        </div>
      )}

      <div className="mp-card">
        <div className="mp-card-title d-flex align-items-center gap-2">
          <Bookmark size={16} />
          Επομενες κρατησεις
        </div>
        {upcoming.length === 0 ? (
          <div className="mp-empty py-3">
            Δεν εχεις κλεισει ακομα. Δες το προγραμμα.
          </div>
        ) : (
          upcoming.map((b) => (
            <div
              key={b.id}
              className="d-flex justify-content-between align-items-start mb-2 pb-2 border-bottom"
            >
              <div>
                <div className="fw-semibold">{b.title}</div>
                <div className="mp-session-time">
                  {new Date(b.startTime).toLocaleString("el-GR", {
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
            Προγραμμα
          </Link>
          <Link to="/member/app/qr" className="mp-btn mp-btn-ghost">
            <QrCode size={16} />
            QR εισοδου
          </Link>
        </div>
      </div>
    </div>
  );
};

export default MemberHome;
