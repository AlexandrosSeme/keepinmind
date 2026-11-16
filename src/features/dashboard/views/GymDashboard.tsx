import React, { useMemo, useState, type ReactNode } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Bar, Chart } from "react-chartjs-2";
import type { ChartData } from "chart.js";
import "@/shared/lib/chartjs";
import {
  Ban,
  CalendarDays,
  DoorOpen,
  Dumbbell,
  QrCode,
  UserCheck,
  UserPlus,
  Users,
} from "lucide-react";
import { PanelCard } from "@/shared/ui";
import { BRAND } from "@/shared/lib/brand";
import { useStaffAuth } from "@/features/auth";
import { useMembers } from "@/features/members";
import { useBookingsWindow, useRecentVisits, useUpcomingExpiries } from "../queries";
import {
  addDays,
  averageVisitsByHour,
  classSlots,
  inactiveMembers,
  occupancyByClass,
  presentNow,
  sameDay,
  startOfDay,
  trainerStats,
  visitsByDay,
  visitsByHour,
  type TrainerStats,
} from "../lib/analytics";
import { cartesianOptions } from "../lib/chartOptions";
import { formatTime, weekdayShort } from "../lib/format";
import DashboardHeader from "../components/DashboardHeader";
import StatTile from "../components/StatTile";
import ExpiriesPanel from "../components/ExpiriesPanel";
import SchedulePanel from "../components/gym/SchedulePanel";
import CheckinFeed from "../components/gym/CheckinFeed";
import InactivePanel from "../components/gym/InactivePanel";
import TrainerSelect from "../components/gym/TrainerSelect";
import TrainersOverview from "../components/gym/TrainersOverview";
import { useTrainerDirectory } from "../components/gym/useTrainerDirectory";

/** Hours (start of each slot) the gym is open: Mon–Fri 07–23, Sat 09–20, Sun 09–17. */
const openingHours = (day: Date) => {
  const [open, close] = day.getDay() === 0 ? [9, 17] : day.getDay() === 6 ? [9, 20] : [7, 23];
  return Array.from({ length: close - open }, (_, i) => open + i);
};
const WINDOW_DAYS = 7;

interface GymViewProps {
  /** Owner/admin monitoring all trainers vs a trainer looking at their own day. */
  mode: "manager" | "self";
  /** Instructor to focus on; empty = all trainers (manager mode only). */
  trainer: string;
  /** Signed-in trainer's instructor name (self mode), highlighted as "You". */
  me: string;
  labelOf: (instructor: string) => string;
  filter?: ReactNode;
  overview?: (stats: TrainerStats[]) => ReactNode;
  /** Rendered inside another page header (admin tabs): show only a toolbar. */
  embedded?: boolean;
}

/** Floor view: schedule, live check-ins, traffic, class occupancy and follow-ups. No finances. */
const GymView: React.FC<GymViewProps> = ({
  mode,
  trainer,
  me,
  labelOf,
  filter,
  overview,
  embedded = false,
}) => {
  const navigate = useNavigate();
  const { t } = useTranslation("dashboard");
  const { members } = useMembers();
  const { upcomingExpiries } = useUpcomingExpiries();
  const { logs } = useRecentVisits(28);
  const { bookings } = useBookingsWindow(0, WINDOW_DAYS - 1);
  const [selectedDay, setSelectedDay] = useState(() => startOfDay(new Date()));
  /** Days back shown on the peak-hours chart (0 = today). */
  const [peakOffset, setPeakOffset] = useState(0);

  const now = new Date();
  const manager = mode === "manager";
  const days = Array.from({ length: WINDOW_DAYS }, (_, i) => addDays(startOfDay(now), i));

  const allSlots = useMemo(() => classSlots(bookings), [bookings]);
  const stats = useMemo(() => trainerStats(allSlots), [allSlots]);
  // Managers can narrow everything down to one trainer.
  const slots = manager && trainer ? allSlots.filter((s) => s.instructor === trainer) : allSlots;
  const daySlots = slots.filter((s) => sameDay(s.start, selectedDay));
  const todaySlots = slots.filter((s) => sameDay(s.start, now));
  const occupancy = useMemo(() => occupancyByClass(slots), [slots]);

  const focus = manager ? trainer : me;
  const focusStats = stats.find((s) => s.name === focus);
  const trainersToday = new Set(
    allSlots.filter((s) => sameDay(s.start, now) && s.instructor).map((s) => s.instructor),
  ).size;

  const todayLogs = logs.filter((l) => sameDay(new Date(l.timestamp), now));
  const admittedToday = todayLogs.filter((l) => l.validationStatus !== "invalid").length;
  const rejectedToday = todayLogs.length - admittedToday;
  const yesterday = addDays(now, -1);
  const yesterdayByNow = logs.filter((l) => {
    const d = new Date(l.timestamp);
    return (
      sameDay(d, yesterday) &&
      l.validationStatus !== "invalid" &&
      d.getHours() * 60 + d.getMinutes() <= now.getHours() * 60 + now.getMinutes()
    );
  }).length;
  const feed = [...todayLogs]
    .sort((a, b) => b.timestamp.localeCompare(a.timestamp))
    .slice(0, 30);

  const week = visitsByDay(logs, 7);
  const inactive = useMemo(() => inactiveMembers(members, logs, 14), [members, logs]);

  // Peak-hours chart: today (actual so far + estimate for the rest) or a past day (full).
  const peakDay = addDays(startOfDay(now), -peakOffset);
  const isToday = peakOffset === 0;
  const hourActual = visitsByHour(logs, peakDay);
  const hourAvg = averageVisitsByHour(logs, peakDay, 4);
  const openHours = openingHours(peakDay);
  const currentHour = isToday ? now.getHours() : 24;
  const peakData: ChartData<"bar" | "line", (number | null)[], string> = {
    labels: openHours.map((h) => `${String(h).padStart(2, "0")}:00`),
    datasets: [
      {
        type: "bar",
        label: isToday ? t("trainer.peak.today") : t("trainer.peak.actual"),
        // Hours that have not started yet have no actual value (not 0).
        data: openHours.map((h) => (h <= currentHour ? hourActual[h] : null)),
        backgroundColor: openHours.map((h) => (h === currentHour ? BRAND.yellow : BRAND.ink)),
        borderRadius: 5,
        barPercentage: 0.75,
        grouped: false,
        order: 2,
      },
      ...(isToday
        ? [
            {
              type: "bar" as const,
              label: t("trainer.peak.estimate"),
              // Rest of today, from the same-weekday average.
              data: openHours.map((h) => (h > currentHour ? Math.round(hourAvg[h]) : null)),
              backgroundColor: "rgba(26, 26, 26, 0.14)",
              borderColor: "rgba(26, 26, 26, 0.35)",
              borderWidth: 1,
              borderRadius: 5,
              barPercentage: 0.75,
              grouped: false,
              order: 3,
            },
          ]
        : []),
      {
        type: "line",
        label: t("trainer.peak.average"),
        data: openHours.map((h) => hourAvg[h]),
        borderColor: BRAND.yellowStrong,
        backgroundColor: BRAND.yellowStrong,
        borderWidth: 2,
        borderDash: [5, 4],
        // Monotone keeps the curve on the data (no overshoot below 0 or above peaks).
        cubicInterpolationMode: "monotone",
        pointRadius: 0,
        pointHoverRadius: 4,
        order: 1,
      },
    ],
  };
  const peakOptions = cartesianOptions<"bar" | "line">({ legend: true });
  peakOptions.plugins!.tooltip!.callbacks!.label = (ctx) => {
    if (ctx.parsed.y === null) return "";
    const inProgress =
      ctx.datasetIndex === 0 && openHours[ctx.dataIndex] === currentHour;
    return ` ${ctx.dataset.label}${inProgress ? ` (${t("trainer.peak.inProgress")})` : ""}: ${ctx.parsed.y}`;
  };
  const peakDayOptions = Array.from({ length: 7 }, (_, i) => ({
    value: i,
    label:
      i === 0
        ? t("trainer.schedule.today")
        : i === 1
          ? t("trainer.peak.yesterday")
          : `${weekdayShort(addDays(startOfDay(now), -i))} ${addDays(startOfDay(now), -i).getDate()}`,
  }));

  const weekData: ChartData<"bar"> = {
    labels: week.map((d) => weekdayShort(d.date)),
    datasets: [
      {
        label: t("trainer.week.dataset"),
        data: week.map((d) => d.count),
        backgroundColor: week.map((_, i) => (i === week.length - 1 ? BRAND.yellow : BRAND.canvas)),
        hoverBackgroundColor: BRAND.yellowStrong,
        borderRadius: 6,
        barPercentage: 0.65,
      },
    ],
  };

  const occupancyData: ChartData<"bar"> = {
    labels: occupancy.map((o) => o.title),
    datasets: [
      {
        label: t("trainer.occupancy.dataset"),
        data: occupancy.map((o) => o.rate),
        backgroundColor: occupancy.map((o) =>
          o.rate >= 75 ? BRAND.success : o.rate >= 40 ? BRAND.yellow : BRAND.muted,
        ),
        borderRadius: 5,
        barPercentage: 0.7,
      },
    ],
  };

  const actions = (
    <>
      {filter}
      <button type="button" className="btn btn-primary btn-sm" onClick={() => navigate("/qr-scanner")}>
        <QrCode size={14} className="me-1" />
        {t("quickActions.qr")}
      </button>
      <button type="button" className="btn btn-outline-secondary btn-sm" onClick={() => navigate("/calendar")}>
        <CalendarDays size={14} className="me-1" />
        {t("quickActions.calendar")}
      </button>
      {!manager && (
        <button type="button" className="btn btn-outline-secondary btn-sm" onClick={() => navigate("/members")}>
          <UserPlus size={14} className="me-1" />
          {t("quickActions.member")}
        </button>
      )}
    </>
  );

  const focusTile = focus ? (
    <StatTile
      tone="dark"
      icon={<Dumbbell size={16} />}
      label={manager ? t("gym.kpi.trainerWeek", { name: labelOf(focus) }) : t("trainer.kpi.mySessions")}
      value={focusStats?.sessions ?? 0}
      hint={
        focusStats?.next
          ? t("trainer.kpi.mySessionsNext", {
              time: `${weekdayShort(focusStats.next.start)} ${formatTime(focusStats.next.start)}`,
              title: focusStats.next.title,
            })
          : t("trainer.kpi.mySessionsNone")
      }
    />
  ) : (
    <StatTile
      tone="dark"
      icon={<Dumbbell size={16} />}
      label={t("gym.kpi.trainersToday")}
      value={trainersToday}
      hint={t("gym.kpi.trainersTodayHint", { count: stats.length })}
    />
  );

  return (
    <div className="km-dash">
      {embedded ? (
        <div className="km-dash-toolbar">{actions}</div>
      ) : (
        <DashboardHeader subtitle={t(manager ? "subtitle.gym" : "subtitle.trainer")} actions={actions} />
      )}

      <div className="km-stat-grid">
        <StatTile
          tone="brand"
          icon={<DoorOpen size={16} />}
          label={t("trainer.kpi.visitsToday")}
          value={admittedToday}
          hint={t("trainer.kpi.visitsTodayHint", { count: yesterdayByNow })}
          onClick={() => navigate("/attendance")}
        />
        <StatTile
          tone="success"
          icon={<UserCheck size={16} />}
          label={t("trainer.kpi.inGym")}
          value={presentNow(logs, 90, now)}
          hint={t("trainer.kpi.inGymHint")}
        />
        <StatTile
          tone="info"
          icon={<Users size={16} />}
          label={t("trainer.kpi.classesToday")}
          value={todaySlots.length}
          hint={t("trainer.kpi.classesTodayHint", {
            count: todaySlots.reduce((s, slot) => s + slot.booked, 0),
          })}
          onClick={() => navigate("/calendar")}
        />
        {focusTile}
        <StatTile
          tone="danger"
          icon={<Ban size={16} />}
          label={t("trainer.kpi.rejected")}
          value={rejectedToday}
          hint={t("trainer.kpi.rejectedHint")}
        />
      </div>

      <div className="km-dash-grid">
        <div className="km-col-7">
          <SchedulePanel
            slots={daySlots}
            days={days}
            selectedDay={selectedDay}
            onSelectDay={setSelectedDay}
            me={manager ? "" : me}
            labelOf={labelOf}
            now={now}
          />
        </div>
        <div className="km-col-5">
          <CheckinFeed logs={feed} total={todayLogs.length} />
        </div>

        {manager && overview && <div className="km-col-6">{overview(stats)}</div>}
        <PanelCard
          title={t("trainer.peak.title")}
          action={
            <select
              className="form-select form-select-sm km-peak-day"
              aria-label={t("trainer.peak.day")}
              value={peakOffset}
              onChange={(e) => setPeakOffset(Number(e.target.value))}
            >
              {peakDayOptions.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
          }
          className={`km-dash-panel ${manager ? "km-col-6 km-dash-panel--tall" : "km-col-8"}`}
        >
          <div className="km-chart" style={{ height: manager ? 320 : 240 }}>
            <Chart<"bar" | "line", (number | null)[], string>
              type="bar"
              data={peakData}
              options={peakOptions}
            />
          </div>
        </PanelCard>
        <PanelCard title={t("trainer.week.title")} className="km-dash-panel km-col-4">
          <div className="km-chart" style={{ height: 240 }}>
            <Bar data={weekData} options={cartesianOptions<"bar">()} />
          </div>
        </PanelCard>

        <PanelCard
          title={
            manager && trainer
              ? `${t("trainer.occupancy.title")} · ${labelOf(trainer)}`
              : t("trainer.occupancy.title")
          }
          className="km-dash-panel km-col-4"
        >
          {occupancy.length === 0 ? (
            <div className="km-dashboard__empty">{t("trainer.occupancy.empty")}</div>
          ) : (
            <div className="km-chart" style={{ height: 260 }}>
              <Bar
                data={occupancyData}
                options={cartesianOptions<"bar">({ horizontal: true, max: 100, format: (v) => `${v}%` })}
              />
            </div>
          )}
        </PanelCard>
        <div className="km-col-4">
          <InactivePanel rows={inactive} now={now} />
        </div>
        {!manager && (
          <div className="km-col-4">
            <ExpiriesPanel upcomingExpiries={upcomingExpiries} />
          </div>
        )}
      </div>
    </div>
  );
};

/** Owner/admin: whole gym, with a trainer filter kept in the URL (`?trainer=`). */
export const ManagerGymDashboard: React.FC<{ embedded?: boolean }> = ({ embedded = false }) => {
  const [params, setParams] = useSearchParams();
  const trainer = params.get("trainer") ?? "";
  const { bookings } = useBookingsWindow(0, WINDOW_DAYS - 1);
  const slots = useMemo(() => classSlots(bookings), [bookings]);
  const { options, labelOf } = useTrainerDirectory(slots);

  const select = (key: string) =>
    setParams(
      (prev) => {
        const next = new URLSearchParams(prev);
        if (key) next.set("trainer", key);
        else next.delete("trainer");
        return next;
      },
      { replace: true },
    );

  return (
    <GymView
      mode="manager"
      trainer={trainer}
      me=""
      labelOf={labelOf}
      embedded={embedded}
      filter={<TrainerSelect options={options} value={trainer} onChange={select} />}
      overview={(stats) => (
        <TrainersOverview stats={stats} labelOf={labelOf} selected={trainer} onSelect={select} />
      )}
    />
  );
};

/** Trainer: the gym today with their own sessions highlighted. */
export const TrainerGymDashboard: React.FC = () => {
  const { profile } = useStaffAuth();
  // Trainers appear in the schedule by first name.
  const me = (profile?.fullName ?? "").split(" ")[0];
  return <GymView mode="self" trainer="" me={me} labelOf={(name) => name} />;
};
