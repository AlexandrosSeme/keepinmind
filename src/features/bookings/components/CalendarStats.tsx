import React from "react";
import { useTranslation } from "react-i18next";
import {
  Calendar as CalendarIcon,
  CheckCircle2,
  Dumbbell,
  UserCheck,
} from "lucide-react";

interface CalendarStatsProps {
  total: number;
  today: number;
  thisWeek: number;
  coaches: number;
}

const CalendarStats: React.FC<CalendarStatsProps> = ({
  total,
  today,
  thisWeek,
  coaches,
}) => {
  const { t } = useTranslation("bookings");
  const cards = [
    {
      value: total,
      label: t("stats.total"),
      icon: <Dumbbell size={24} />,
      tone: "primary",
    },
    {
      value: today,
      label: t("stats.today"),
      icon: <CheckCircle2 size={24} />,
      tone: "success",
    },
    {
      value: thisWeek,
      label: t("stats.thisWeek"),
      icon: <CalendarIcon size={24} />,
      tone: "info",
    },
    {
      value: coaches,
      label: t("stats.coaches"),
      icon: <UserCheck size={24} />,
      tone: "warning",
    },
  ];

  return (
    <div className="stats-grid">
      {cards.map((card) => (
        <div key={card.label} className="stat-card">
          <div className={`stat-icon stat-icon-${card.tone}`}>{card.icon}</div>
          <div className="stat-content">
            <div className="stat-value">{card.value}</div>
            <div className="stat-label">{card.label}</div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default CalendarStats;
