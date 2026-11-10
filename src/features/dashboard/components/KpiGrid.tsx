import React from "react";
import { useNavigate } from "react-router-dom";
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

  const kpis = [
    {
      title: "Μελη",
      value: stats.totalMembers,
      icon: <Users size={16} />,
      to: "/members",
    },
    {
      title: "Ενεργες",
      value: stats.activeSubscriptions,
      icon: <CheckCircle size={16} />,
      to: "/subscriptions",
    },
    {
      title: "Ληγουν",
      value: stats.expiringThisWeek,
      icon: <Clock size={16} />,
      to: "/members",
    },
    {
      title: "Οφειλες",
      value: stats.overdueDebts,
      icon: <AlertCircle size={16} />,
      to: "/debts",
    },
    {
      title: "Εσοδα",
      value: `€${displayRevenue}`,
      icon: <TrendingUp size={16} />,
      to: "/payments",
    },
    {
      title: "Εκκρεμη",
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
