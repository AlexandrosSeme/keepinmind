import React, { useCallback, useEffect, useState } from "react";
import { Bookmark } from "lucide-react";
import { useMemberSession } from "../../contexts/MemberSessionContext";
import {
  cancelMemberBooking,
  fetchMemberBookings,
} from "../../services/bookingService";
import type { Booking } from "../../types";
import StatusBadge from "../ui/StatusBadge";

const MemberBookings: React.FC = () => {
  const { member } = useMemberSession();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState<number | null>(null);

  const reload = useCallback(async () => {
    if (!member) return;
    setLoading(true);
    const data = await fetchMemberBookings(member.id);
    setBookings(
      data.sort(
        (a, b) =>
          new Date(a.startTime).getTime() - new Date(b.startTime).getTime()
      )
    );
    setLoading(false);
  }, [member]);

  useEffect(() => {
    reload();
  }, [reload]);

  const handleCancel = async (id: number) => {
    if (!member) return;
    if (!window.confirm("Ακυρωση αυτης της κρατησης;")) return;
    setBusyId(id);
    await cancelMemberBooking(id, member.id);
    setBusyId(null);
    await reload();
  };

  const now = Date.now();
  const upcoming = bookings.filter(
    (b) => b.status !== "cancelled" && new Date(b.startTime).getTime() >= now
  );
  const past = bookings.filter(
    (b) =>
      b.status === "cancelled" || new Date(b.startTime).getTime() < now
  );

  return (
    <div>
      <h1 className="mp-page-title">Οι κρατησεις μου</h1>
      <p className="mp-page-sub">Επερχομενα και ιστορικο.</p>

      {loading ? (
        <div className="mp-empty">Φορτωση...</div>
      ) : (
        <>
          <div className="mp-card-title mb-2">Επερχομενα</div>
          {upcoming.length === 0 ? (
            <div className="mp-empty py-3">
              <Bookmark size={24} className="mb-2 opacity-50" />
              <div>Καμια επερχομενη κρατηση</div>
            </div>
          ) : (
            upcoming.map((b) => (
              <div key={b.id} className="mp-card">
                <div className="d-flex justify-content-between gap-2">
                  <div>
                    <div className="mp-card-title mb-1">{b.title}</div>
                    <div className="mp-session-time">
                      {new Date(b.startTime).toLocaleString("el-GR", {
                        weekday: "short",
                        day: "numeric",
                        month: "short",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </div>
                    {b.instructor && (
                      <small className="text-muted">
                        Προπονητης: {b.instructor}
                      </small>
                    )}
                  </div>
                  <StatusBadge status={b.status} showDot={false} />
                </div>
                <button
                  type="button"
                  className="mp-btn mp-btn-danger mt-3"
                  disabled={busyId === b.id}
                  onClick={() => handleCancel(b.id)}
                >
                  {busyId === b.id ? "Ακυρωση..." : "Ακυρωση κρατησης"}
                </button>
              </div>
            ))
          )}

          {past.length > 0 && (
            <>
              <div className="mp-card-title mb-2 mt-3">Ιστορικο</div>
              {past.slice(0, 10).map((b) => (
                <div key={b.id} className="mp-card">
                  <div className="d-flex justify-content-between gap-2">
                    <div>
                      <div className="fw-semibold">{b.title}</div>
                      <small className="text-muted">
                        {new Date(b.startTime).toLocaleString("el-GR")}
                      </small>
                    </div>
                    <StatusBadge status={b.status} showDot={false} />
                  </div>
                </div>
              ))}
            </>
          )}
        </>
      )}
    </div>
  );
};

export default MemberBookings;
