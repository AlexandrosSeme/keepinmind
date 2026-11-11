import React from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { CreditCard, Plus, QrCode, UserPlus } from "lucide-react";
import { intlLocale } from "@/shared/i18n";
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
  {
    key: "member",
    label: "quickActions.member",
    icon: <UserPlus size={14} />,
    to: "/members",
  },
  {
    key: "payment",
    label: "quickActions.payment",
    icon: <CreditCard size={14} />,
    to: "/payments",
  },
  {
    key: "qr",
    label: "quickActions.qr",
    icon: <QrCode size={14} />,
    to: "/qr-scanner",
  },
  {
    key: "debt",
    label: "quickActions.debt",
    icon: <Plus size={14} />,
    to: "/debts",
  },
] as const;

const DashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const { t } = useTranslation("dashboard");
  const { stats, upcomingExpiries, debts, payments, members } =
    useDashboardData();
  const {
    memberDistribution,
    revenueSeries,
    paymentStatus,
    displayRevenue,
    displayPending,
  } = useDashboardMetrics(stats, members, payments);

  const todayLabel = new Date().toLocaleDateString(intlLocale(), {
    weekday: "short",
    day: "numeric",
    month: "short",
  });

  return (
    <div className="km-dashboard">
      <div className="km-dashboard__top">
        <div className="km-dashboard__heading">
          <h2 className="km-page-title mb-0">{t("title")}</h2>
          <span className="km-dashboard__date">{todayLabel}</span>
        </div>
        <div className="km-dashboard__actions">
          {quickActions.map((action) => (
            <button
              key={action.key}
              type="button"
              className="btn btn-outline-secondary btn-sm d-inline-flex align-items-center gap-1"
              onClick={() => navigate(action.to)}
            >
              {action.icon}
              <span className="d-none d-sm-inline">{t(action.label)}</span>
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
