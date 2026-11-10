import React, { useCallback, useEffect, useState } from "react";
import { Calendar, Check } from "lucide-react";
import { useMemberSession } from "../../contexts/MemberSessionContext";
import {
  bookClassForMember,
  fetchClassSessions,
  fetchMemberBookings,
} from "../../services/bookingService";
import type { ClassSession, Booking } from "../../types";

function buildDemoSessions(): ClassSession[] {
  const base = new Date();
  base.setMinutes(0, 0, 0);
  const mk = (dayOffset: number, hour: number, title: string, instructor: string) => {
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
  const { member } = useMemberSession();
  const [sessions, setSessions] = useState<ClassSession[]>([]);
  const [myBookings, setMyBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [busyKey, setBusyKey] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
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
      (b) => b.title === session.title && b.startTime === session.startTime
    );

  const handleBook = async (session: ClassSession) => {
    if (!member) return;
    if (usingDemo) {
      setMessage(
        "Δειγμα προγραμματος. Δημιουργησε ταξεις απο το admin Ημερολογιο για πραγματικες κρατησεις."
      );
      return;
    }
    if (member.status === "expired") {
      setMessage("Η συνδρομη σου εχει ληξει. Ανανεωσε στη reception.");
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
      setMessage(error);
      return;
    }
    setMessage("Η θεση κλειστηκε επιτυχως!");
    await reload();
  };

  return (
    <div>
      <h1 className="mp-page-title">Προγραμμα</h1>
      <p className="mp-page-sub">
        Κλεισε θεση σε ταξεις και προπονησεις (επομενες 14 ημερες).
      </p>

      {usingDemo && (
        <div className="mp-card" style={{ background: "var(--km-brand-soft)" }}>
          <small>
            Εμφανιζεται δειγμα προγραμματος. Οταν ο γυμναστης προσθεσει ταξεις στο
            Ημερολογιο, θα φαινονται εδω για κρατηση.
          </small>
        </div>
      )}

      {message && (
        <div
          className="mp-card"
          style={{
            borderColor: message.includes("επιτυχως")
              ? "rgba(31,157,99,0.4)"
              : "rgba(214,59,59,0.35)",
          }}
        >
          {message}
        </div>
      )}

      {loading ? (
        <div className="mp-empty">Φορτωση προγραμματος...</div>
      ) : sessions.length === 0 ? (
        <div className="mp-empty">
          <Calendar size={28} className="mb-2 opacity-50" />
          <div>Δεν υπαρχουν διαθεσιμα slots</div>
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
                    {new Date(s.startTime).toLocaleString("el-GR", {
                      weekday: "short",
                      day: "numeric",
                      month: "short",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                    {" – "}
                    {new Date(s.endTime).toLocaleTimeString("el-GR", {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </div>
                  {s.instructor && (
                    <small className="text-muted d-block mt-1">
                      Προπονητης: {s.instructor}
                    </small>
                  )}
                  {s.maxParticipants && (
                    <small className="text-muted d-block">
                      Θεσεις: {s.bookedCount}/{s.maxParticipants}
                    </small>
                  )}
                </div>
                <span className="mp-chip">{s.type}</span>
              </div>

              {booked ? (
                <button type="button" className="mp-btn mp-btn-ghost mt-3" disabled>
                  <Check size={16} />
                  Κλεισμενο
                </button>
              ) : (
                <button
                  type="button"
                  className="mp-btn mp-btn-primary mt-3"
                  disabled={full || busyKey === s.key}
                  onClick={() => handleBook(s)}
                >
                  {full
                    ? "Γεματο"
                    : busyKey === s.key
                      ? "Κρατηση..."
                      : "Κλεισε θεση"}
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
