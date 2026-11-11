import React, { useCallback, useEffect, useState } from "react";
import { Bookmark } from "lucide-react";
import { useTranslation } from "react-i18next";
import { intlLocale } from "@/shared/i18n";
import { StatusBadge } from "@/shared/ui";
import {
  cancelMemberBooking,
  fetchMemberBookings,
  type Booking,
} from "@/features/bookings";
import { useMemberSession } from "../session/useMemberSession";

const MemberBookings: React.FC = () => {
  const { t } = useTranslation(["memberPortal", "common"]);
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
          new Date(a.startTime).getTime() - new Date(b.startTime).getTime(),
      ),
    );
    setLoading(false);
  }, [member]);

  useEffect(() => {
    reload();
  }, [reload]);

  const handleCancel = async (id: number) => {
    if (!member) return;
    if (!window.confirm(t("bookings.confirmCancel"))) return;
    setBusyId(id);
    await cancelMemberBooking(id, member.id);
    setBusyId(null);
    await reload();
  };

  const now = Date.now();
  const upcoming = bookings.filter(
    (b) => b.status !== "cancelled" && new Date(b.startTime).getTime() >= now,
  );
  const past = bookings.filter(
    (b) => b.status === "cancelled" || new Date(b.startTime).getTime() < now,
  );

  return (
    <div>
      <h1 className="mp-page-title">{t("bookings.title")}</h1>
      <p className="mp-page-sub">{t("bookings.subtitle")}</p>

      {loading ? (
        <div className="mp-empty">{t("common:loading")}</div>
      ) : (
        <>
          <div className="mp-card-title mb-2">{t("bookings.upcoming")}</div>
          {upcoming.length === 0 ? (
            <div className="mp-empty py-3">
              <Bookmark size={24} className="mb-2 opacity-50" />
              <div>{t("bookings.noUpcoming")}</div>
            </div>
          ) : (
            upcoming.map((b) => (
              <div key={b.id} className="mp-card">
                <div className="d-flex justify-content-between gap-2">
                  <div>
                    <div className="mp-card-title mb-1">{b.title}</div>
                    <div className="mp-session-time">
                      {new Date(b.startTime).toLocaleString(intlLocale(), {
                        weekday: "short",
                        day: "numeric",
                        month: "short",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </div>
                    {b.instructor && (
                      <small className="text-muted">
                        {t("bookings.instructor", { name: b.instructor })}
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
                  {busyId === b.id
                    ? t("bookings.cancelling")
                    : t("bookings.cancel")}
                </button>
              </div>
            ))
          )}

          {past.length > 0 && (
            <>
              <div className="mp-card-title mb-2 mt-3">
                {t("bookings.history")}
              </div>
              {past.slice(0, 10).map((b) => (
                <div key={b.id} className="mp-card">
                  <div className="d-flex justify-content-between gap-2">
                    <div>
                      <div className="fw-semibold">{b.title}</div>
                      <small className="text-muted">
                        {new Date(b.startTime).toLocaleString(intlLocale())}
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
