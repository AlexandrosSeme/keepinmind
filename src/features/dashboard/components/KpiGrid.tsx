import React from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
  AlertCircle,
  CheckCircle,
  Clock,
  Euro,
  TrendingUp,
  Users,
} from "lucide-react";
import { IconAvatar } from "@/shared/ui";
import type { Stats } from "../types";

interface KpiGridProps {
  stats: Stats;
  displayRevenue: string;
  displayPending: string;
}

const KpiGrid: React.FC<KpiGridProps> = ({
  stats,
  displayRevenue,
  displayPending,
}) => {
  const navigate = useNavigate();
  const { t } = useTranslation("dashboard");

  const kpis = [
    {
      title: t("kpi.members"),
      value: stats.totalMembers,
      icon: <Users size={16} />,
      to: "/members",
    },
    {
      title: t("kpi.active"),
      value: stats.activeSubscriptions,
      icon: <CheckCircle size={16} />,
      to: "/subscriptions",
    },
    {
      title: t("kpi.expiring"),
      value: stats.expiringThisWeek,
      icon: <Clock size={16} />,
      to: "/members",
    },
    {
      title: t("kpi.debts"),
      value: stats.overdueDebts,
      icon: <AlertCircle size={16} />,
      to: "/debts",
    },
    {
      title: t("kpi.revenue"),
      value: `€${displayRevenue}`,
      icon: <TrendingUp size={16} />,
      to: "/payments",
    },
    {
      title: t("kpi.pending"),
      value: `€${displayPending}`,
      icon: <Euro size={16} />,
      to: "/payments",
    },
  ];

  return (
    <div className="km-dashboard__kpis">
      {kpis.map((kpi) => (
        <button
          key={kpi.title}
          type="button"
          className="card border-0 shadow-sm km-dash-kpi km-dashboard__kpi"
          onClick={() => navigate(kpi.to)}
        >
          <div className="card-body p-2 d-flex align-items-center justify-content-between gap-2">
            <div className="min-w-0">
              <div className="km-stat-label mb-0">{kpi.title}</div>
              <div className="km-dashboard__kpi-value">{kpi.value}</div>
            </div>
            <IconAvatar size="sm">{kpi.icon}</IconAvatar>
          </div>
        </button>
      ))}
    </div>
  );
};

export default KpiGrid;
