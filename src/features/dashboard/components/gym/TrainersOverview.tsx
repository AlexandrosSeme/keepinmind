import React from "react";
import { useTranslation } from "react-i18next";
import { Users } from "lucide-react";
import { LinkButton, PanelCard } from "@/shared/ui";
import type { TrainerStats } from "../../lib/analytics";
import { formatTime, weekdayShort } from "../../lib/format";
import DashboardEmpty from "../DashboardEmpty";

interface TrainersOverviewProps {
  stats: TrainerStats[];
  labelOf: (key: string) => string;
  selected: string;
  onSelect: (key: string) => void;
}

const fillTone = (fill: number) => (fill >= 75 ? "is-high" : fill >= 40 ? "is-mid" : "is-low");

/** Workload of every trainer over the next 7 days; click a row to focus on that trainer. */
const TrainersOverview: React.FC<TrainersOverviewProps> = ({
  stats,
  labelOf,
  selected,
  onSelect,
}) => {
  const { t } = useTranslation("dashboard");

  return (
    <PanelCard
      title={t("gym.trainers.title")}
      action={
        selected && (
          <LinkButton onClick={() => onSelect("")}>{t("gym.trainerFilter.all")}</LinkButton>
        )
      }
      className="km-dash-panel km-dash-panel--tall"
      bodyClassName="p-0 km-dash-scroll"
    >
      {stats.length === 0 ? (
        <DashboardEmpty
          icon={<Users size={22} className="mb-1 opacity-50" />}
          text={t("gym.trainers.empty")}
        />
      ) : (
        <table className="km-trainers">
          <thead>
            <tr>
              <th>{t("gym.trainers.name")}</th>
              <th className="text-end">{t("gym.trainers.sessions")}</th>
              <th className="text-end">{t("gym.trainers.bookings")}</th>
              <th>{t("gym.trainers.fill")}</th>
              <th>{t("gym.trainers.next")}</th>
            </tr>
          </thead>
          <tbody>
            {stats.map((s) => (
              <tr
                key={s.name}
                className={selected === s.name ? "is-selected" : undefined}
                onClick={() => onSelect(selected === s.name ? "" : s.name)}
              >
                <td className="km-trainers__name">{labelOf(s.name)}</td>
                <td className="text-end fw-bold">{s.sessions}</td>
                <td className="text-end">{s.bookings}</td>
                <td>
                  {s.fill === null ? (
                    "—"
                  ) : (
                    <div className="km-trainers__fill">
                      <div className="km-trainers__track">
                        <div
                          className={`km-trainers__bar ${fillTone(s.fill)}`}
                          style={{ width: `${Math.max(4, s.fill)}%` }}
                        />
                      </div>
                      <span>{s.fill}%</span>
                    </div>
                  )}
                </td>
                <td className="km-trainers__next">
                  {s.next
                    ? `${weekdayShort(s.next.start)} ${formatTime(s.next.start)} · ${s.next.title}`
                    : "—"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </PanelCard>
  );
};

export default TrainersOverview;
