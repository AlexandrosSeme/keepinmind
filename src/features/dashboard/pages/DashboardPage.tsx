import React from "react";
import { useNavigate } from "react-router-dom";
import { CreditCard, Plus, QrCode, UserPlus } from "lucide-react";
import { useDashboardData } from "../queries";
import { useDashboardMetrics } from "../hooks/useDashboardMetrics";
import KpiGrid from "../components/KpiGrid";
import ExpiriesPanel from "../components/ExpiriesPanel";
import MemberDistributionPanel from "../components/MemberDistributionPanel";
import DebtsPanel from "../components/DebtsPanel";
import RevenuePanel from "../components/RevenuePanel";
import PaymentStatusBar from "../components/PaymentStatusBar";
import "./DashboardPage.scss";

const quickActions = [
  { label: "Μελος", icon: <UserPlus size={14} />, to: "/members" },
  { label: "Πληρωμη", icon: <CreditCard size={14} />, to: "/payments" },
  { label: "QR", icon: <QrCode size={14} />, to: "/qr-scanner" },
  { label: "Οφειλη", icon: <Plus size={14} />, to: "/debts" },
];

const DashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const { stats, upcomingExpiries, debts, payments, members } =
    useDashboardData();
  const {
    memberDistribution,
    revenueSeries,
    paymentStatus,
    displayRevenue,
    displayPending,
  } = useDashboardMetrics(stats, members, payments);

  const todayLabel = new Date().toLocaleDateString("el-GR", {
    weekday: "short",
    day: "numeric",
    month: "short",
  });

  return (
    <div className="km-dashboard">
      <div className="km-dashboard__top">
        <div className="km-dashboard__heading">
          <h2 className="km-page-title mb-0">Dashboard</h2>
          <span className="km-dashboard__date">{todayLabel}</span>
        </div>
        <div className="km-dashboard__actions">
          {quickActions.map((action) => (
            <button
              key={action.label}
              type="button"
              className="btn btn-outline-secondary btn-sm d-inline-flex align-items-center gap-1"
              onClick={() => navigate(action.to)}
            >
              {action.icon}
              <span className="d-none d-sm-inline">{action.label}</span>
            </button>
          ))}
        </div>
      </div>

      <KpiGrid
        stats={stats}
        displayRevenue={displayRevenue}
        displayPending={displayPending}
      />

      <div className="km-dashboard__body">
        <ExpiriesPanel upcomingExpiries={upcomingExpiries} />
        <MemberDistributionPanel
          series={memberDistribution.series}
          labels={memberDistribution.labels}
          total={memberDistribution.total}
        />
        <DebtsPanel debts={debts} />
        <RevenuePanel
          categories={revenueSeries.categories}
          data={revenueSeries.data}
          isSample={!revenueSeries.hasReal}
        />
      </div>

      <PaymentStatusBar
        series={paymentStatus.series}
        isSample={!paymentStatus.hasReal}
      />
    </div>
  );
};

export default DashboardPage;
