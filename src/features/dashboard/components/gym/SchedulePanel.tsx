import React from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { CalendarX } from "lucide-react";
import { LinkButton, PanelCard } from "@/shared/ui";
import { sameDay, type ClassSlot } from "../../lib/analytics";
import { formatTime, weekdayShort } from "../../lib/format";
import DashboardEmpty from "../DashboardEmpty";

interface SchedulePanelProps {
  /** Sessions of the selected day. */
  slots: ClassSlot[];
  days: Date[];
  selectedDay: Date;
  onSelectDay: (day: Date) => void;
  /** Instructor to highlight with a "You" chip (the signed-in trainer). */
  me?: string;
  labelOf?: (instructor: string) => string;
  now: Date;
}

/** A day's sessions as a timeline with occupancy and live/done state, plus a 7-day picker. */
const SchedulePanel: React.FC<SchedulePanelProps> = ({
  slots,
  days,
  selectedDay,
  onSelectDay,
  me = "",
  labelOf = (name) => name,
  now,
}) => {
  const navigate = useNavigate();
  const { t } = useTranslation("dashboard");

  return (
    <PanelCard
      title={t("trainer.schedule.title")}
      action={
        <LinkButton onClick={() => navigate("/calendar")}>
          {t("quickActions.calendar")}
        </LinkButton>
      }
      className="km-dash-panel km-dash-panel--tall"
      bodyClassName="p-0 d-flex flex-column min-h-0"
    >
      <div className="km-day-picker" role="tablist">
        {days.map((day, i) => {
          const active = sameDay(day, selectedDay);
          return (
            <button
              key={day.toISOString()}
              type="button"
              role="tab"
              aria-selected={active}
              className={`km-day-picker__day${active ? " is-active" : ""}`}
              onClick={() => onSelectDay(day)}
            >
              <span>{i === 0 ? t("trainer.schedule.today") : weekdayShort(day)}</span>
              <strong>{day.getDate()}</strong>
            </button>
          );
        })}
      </div>

      <div className="km-dash-scroll">
        {slots.length === 0 ? (
          <DashboardEmpty
            icon={<CalendarX size={22} className="mb-1 opacity-50" />}
            text={t("trainer.schedule.empty")}
          />
        ) : (
          <ul className="km-timeline">
            {slots.map((slot) => {
              const live = slot.start <= now && now < slot.end;
              const done = slot.end <= now;
              const mine = !!me && slot.instructor === me;
              const fill = slot.max ? Math.min(100, (slot.booked / slot.max) * 100) : 0;
              return (
                <li
                  key={slot.key}
                  className={`km-timeline__item${live ? " is-live" : ""}${done ? " is-done" : ""}${mine ? " is-mine" : ""}`}
                >
                  <div className="km-timeline__time">
                    <strong>{formatTime(slot.start)}</strong>
                    <span>{formatTime(slot.end)}</span>
                  </div>
                  <div className="km-timeline__dot" />
                  <div className="km-timeline__body">
                    <div className="d-flex align-items-center gap-2 flex-wrap">
                      <span className="km-timeline__title">{slot.title}</span>
                      {mine && <span className="km-chip km-chip--brand">{t("trainer.schedule.you")}</span>}
                      {live && <span className="km-chip km-chip--live">{t("trainer.schedule.now")}</span>}
                      {done && <span className="km-chip">{t("trainer.schedule.done")}</span>}
                    </div>
                    <div className="km-timeline__meta">
                      {slot.instructor && <span>{labelOf(slot.instructor)}</span>}
                      {slot.max ? (
                        <span>{t("trainer.schedule.spots", { booked: slot.booked, max: slot.max })}</span>
                      ) : (
                        <span>{t("trainer.schedule.booked", { count: slot.booked })}</span>
                      )}
                    </div>
                    {slot.max ? (
                      <div className="km-timeline__track">
                        <div
                          className={`km-timeline__fill${fill >= 90 ? " is-full" : ""}`}
                          style={{ width: `${Math.max(3, fill)}%` }}
                        />
                      </div>
                    ) : null}
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </PanelCard>
  );
};

export default SchedulePanel;
