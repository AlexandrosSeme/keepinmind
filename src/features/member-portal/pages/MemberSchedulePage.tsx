import React, { useCallback, useEffect, useState } from "react";
import { Calendar, Check } from "lucide-react";
import { useTranslation } from "react-i18next";
import { intlLocale } from "@/shared/i18n";
import {
  bookClassForMember,
  fetchClassSessions,
  fetchMemberBookings,
  type Booking,
  type ClassSession,
} from "@/features/bookings";
import { useMemberSession } from "../session/useMemberSession";

function buildDemoSessions(): ClassSession[] {
  const base = new Date();
  base.setMinutes(0, 0, 0);
  const mk = (
    dayOffset: number,
    hour: number,
    title: string,
    instructor: string,
  ) => {
    const start = new Date(base);
    start.setDate(start.getDate() + dayOffset);
    start.setHours(hour, 0, 0, 0);
    const end = new Date(start);
    end.setHours(hour + 1);
    return {
      key: `${title}|${start.toISOString()}`,
      title,
      type: "class" as const,
      startTime: start.toISOString(),
      endTime: end.toISOString(),
      instructor,
      maxParticipants: 12,
      bookedCount: 3,
      color: "#f5c400",
    };
  };
  return [
    mk(0, 18, "Boxing Class", "Νικος"),
    mk(1, 9, "Mobility", "Ελενη"),
    mk(1, 19, "Hyrox Prep", "Γιωργος"),
    mk(2, 18, "Muay Thai", "Νικος"),
    mk(3, 10, "Yoga Flow", "Μαρια"),
  ];
}

const MemberSchedule: React.FC = () => {
  const { t } = useTranslation("memberPortal");
  const { member } = useMemberSession();
  const [sessions, setSessions] = useState<ClassSession[]>([]);
  const [myBookings, setMyBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [busyKey, setBusyKey] = useState<string | null>(null);
  const [message, setMessage] = useState<{
    text: string;
    ok: boolean;
  } | null>(null);
  const [usingDemo, setUsingDemo] = useState(false);

  const reload = useCallback(async () => {
    if (!member) return;
    setLoading(true);
    const from = new Date();
    const to = new Date();
    to.setDate(to.getDate() + 14);
    const [sess, mine] = await Promise.all([
      fetchClassSessions(from, to),
      fetchMemberBookings(member.id),
    ]);
    if (sess.length === 0) {
      setSessions(buildDemoSessions());
      setUsingDemo(true);
    } else {
      setSessions(sess);
      setUsingDemo(false);
    }
    setMyBookings(mine.filter((b) => b.status !== "cancelled"));
    setLoading(false);
  }, [member]);

  useEffect(() => {
    reload();
  }, [reload]);

  const isBooked = (session: ClassSession) =>
    myBookings.some(
      (b) => b.title === session.title && b.startTime === session.startTime,
    );

  const handleBook = async (session: ClassSession) => {
    if (!member) return;
    if (usingDemo) {
      setMessage({ text: t("schedule.demoBookNotice"), ok: false });
      return;
    }
    if (member.status === "expired") {
      setMessage({ text: t("schedule.expired"), ok: false });
      return;
    }
    setBusyKey(session.key);
    setMessage(null);
    const { error } = await bookClassForMember(session, {
      id: member.id,
      name: member.name,
      phone: member.phone,
    });
    setBusyKey(null);
    if (error) {
      setMessage({ text: error, ok: false });
      return;
    }
    setMessage({ text: t("schedule.booked"), ok: true });
    await reload();
  };

  return (
    <div>
      <h1 className="mp-page-title">{t("schedule.title")}</h1>
      <p className="mp-page-sub">{t("schedule.subtitle")}</p>

      {usingDemo && (
        <div className="mp-card mp-card--brand">
          <small>{t("schedule.demoBanner")}</small>
        </div>
      )}

      {message && (
        <div
          className={`mp-card ${
            message.ok ? "mp-card--success" : "mp-card--danger"
          }`}
        >
          {message.text}
        </div>
      )}

      {loading ? (
        <div className="mp-empty">{t("schedule.loading")}</div>
      ) : sessions.length === 0 ? (
        <div className="mp-empty">
          <Calendar size={28} className="mb-2 opacity-50" />
          <div>{t("schedule.empty")}</div>
        </div>
      ) : (
        sessions.map((s) => {
          const booked = isBooked(s);
          const full =
            !!s.maxParticipants && s.bookedCount >= s.maxParticipants;
          return (
            <div key={s.key} className="mp-card">
              <div className="d-flex justify-content-between align-items-start gap-2">
                <div>
                  <div className="mp-card-title mb-1">{s.title}</div>
                  <div className="mp-session-time">
                    {new Date(s.startTime).toLocaleString(intlLocale(), {
                      weekday: "short",
                      day: "numeric",
                      month: "short",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                    {" – "}
                    {new Date(s.endTime).toLocaleTimeString(intlLocale(), {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </div>
                  {s.instructor && (
                    <small className="text-muted d-block mt-1">
                      {t("schedule.instructor", { name: s.instructor })}
                    </small>
                  )}
                  {s.maxParticipants && (
                    <small className="text-muted d-block">
                      {t("schedule.spots", {
                        booked: s.bookedCount,
                        max: s.maxParticipants,
                      })}
                    </small>
                  )}
                </div>
                <span className="mp-chip">{s.type}</span>
              </div>

              {booked ? (
                <button
                  type="button"
                  className="mp-btn mp-btn-ghost mt-3"
                  disabled
                >
                  <Check size={16} />
                  {t("schedule.alreadyBooked")}
                </button>
              ) : (
                <button
                  type="button"
                  className="mp-btn mp-btn-primary mt-3"
                  disabled={full || busyKey === s.key}
                  onClick={() => handleBook(s)}
                >
                  {full
                    ? t("schedule.full")
                    : busyKey === s.key
                      ? t("schedule.booking")
                      : t("schedule.book")}
                </button>
              )}
            </div>
          );
        })
      )}
    </div>
  );
};

export default MemberSchedule;
