import React, { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Bar, Line } from "react-chartjs-2";
import type { ChartData } from "chart.js";
import "@/shared/lib/chartjs";
import {
  AlertTriangle,
  CalendarClock,
  CreditCard,
  Euro,
  Footprints,
  Plus,
  UserPlus,
  Users,
} from "lucide-react";
import { PanelCard } from "@/shared/ui";
import { BRAND } from "@/shared/lib/brand";
import { useDebts } from "@/features/debts";
import { useMembers } from "@/features/members";
import { paymentMethodLabel, usePayments } from "@/features/payments";
import { usePackages } from "@/features/subscriptions";
import { useRecentVisits, useUpcomingExpiries } from "../queries";
import {
  debtAging,
  monthToDate,
  renewalValue,
  revenueByMethod,
  revenueByMonth,
  revenueByPackage,
  visitsByDay,
} from "../lib/analytics";
import { cartesianOptions, verticalGradient } from "../lib/chartOptions";
import { dayMonth, formatEuro, formatNumber, monthLabel } from "../lib/format";
import DashboardHeader from "../components/DashboardHeader";
import DoughnutChart from "../components/DoughnutChart";
import StatTile from "../components/StatTile";
import ExpiriesPanel from "../components/ExpiriesPanel";
import DebtsPanel from "../components/DebtsPanel";
import MemberDistributionPanel from "../components/MemberDistributionPanel";
import PaymentStatusBar from "../components/PaymentStatusBar";
import DebtAgingPanel from "../components/owner/DebtAgingPanel";

/** Finance view (owner/admin): revenue, members, debts, renewals and traffic. */
const FinanceDashboard: React.FC = () => {
  const navigate = useNavigate();
  const { t } = useTranslation("dashboard");
  const { members } = useMembers();
  const { packages } = usePackages();
  const { payments } = usePayments();
  const { debts } = useDebts();
  const { upcomingExpiries } = useUpcomingExpiries();
  const { logs } = useRecentVisits(30);

  const mtd = useMemo(() => monthToDate(payments), [payments]);
  const months = useMemo(() => revenueByMonth(payments, 6), [payments]);
  const byPackage = useMemo(
    () => revenueByPackage(payments, members, 90),
    [payments, members],
  );
  const byMethod = useMemo(() => revenueByMethod(payments, 90), [payments]);
  const aging = useMemo(() => debtAging(debts), [debts]);
  const visits = useMemo(() => visitsByDay(logs, 30), [logs]);

  const counts = {
    active: members.filter((m) => m.status === "active").length,
    expiring: members.filter((m) => m.status === "expiring_soon").length,
    expired: members.filter((m) => m.status === "expired").length,
  };
  const current = counts.active + counts.expiring;
  const activeRate = members.length ? Math.round((current / members.length) * 100) : 0;
  const pastVisits = visits.slice(0, -1);
  const avgVisits = pastVisits.length
    ? pastVisits.reduce((s, v) => s + v.count, 0) / pastVisits.length
    : 0;
  const paymentSeries = (["completed", "pending", "failed"] as const).map(
    (s) => payments.filter((p) => p.status === s).length,
  );
  const packageTotal = byPackage.reduce((s, [, v]) => s + v, 0);
  const methodTotal = byMethod.reduce((s, [, v]) => s + v, 0);

  const revenueData: ChartData<"bar"> = {
    labels: months.map((m) => monthLabel(m.month, m.year)),
    datasets: [
      {
        label: t("owner.revenue.completed"),
        data: months.map((m) => m.completed),
        backgroundColor: BRAND.ink,
        borderRadius: 6,
        barPercentage: 0.55,
      },
      {
        label: t("owner.revenue.pending"),
        data: months.map((m) => m.pending),
        backgroundColor: BRAND.yellow,
        borderRadius: 6,
        barPercentage: 0.55,
      },
    ],
  };

  const packageRanking = [...packages].sort((a, b) => b.active - a.active);
  const packagesData: ChartData<"bar"> = {
    labels: packageRanking.map((p) => p.name),
    datasets: [
      {
        label: t("owner.packages.dataset"),
        data: packageRanking.map((p) => p.active),
        backgroundColor: packageRanking.map((_, i) => (i === 0 ? BRAND.yellow : BRAND.ink)),
        borderRadius: 6,
        barPercentage: 0.6,
      },
    ],
  };

  const visitsData: ChartData<"line"> = {
    labels: visits.map((v) => dayMonth(v.date)),
    datasets: [
      {
        label: t("owner.visits.dataset"),
        data: visits.map((v) => v.count),
        fill: true,
        tension: 0.35,
        borderWidth: 2.5,
        borderColor: BRAND.yellowStrong,
        backgroundColor: verticalGradient("245, 196, 0"),
        pointRadius: 0,
        pointHoverRadius: 5,
        pointHoverBackgroundColor: BRAND.yellow,
        pointHoverBorderColor: BRAND.ink,
      },
    ],
  };

  return (
    <div className="km-dash">
      <DashboardHeader
        title={t("finance.title")}
        subtitle={t("subtitle.finance")}
        actions={
          <>
            <button type="button" className="btn btn-primary btn-sm" onClick={() => navigate("/payments")}>
              <CreditCard size={14} className="me-1" />
              {t("quickActions.payment")}
            </button>
            <button type="button" className="btn btn-outline-secondary btn-sm" onClick={() => navigate("/members")}>
              <UserPlus size={14} className="me-1" />
              {t("quickActions.member")}
            </button>
            <button type="button" className="btn btn-outline-secondary btn-sm" onClick={() => navigate("/debts")}>
              <Plus size={14} className="me-1" />
              {t("quickActions.debt")}
            </button>
          </>
        }
      />

      <div className="km-stat-grid">
        <StatTile
          tone="brand"
          icon={<Euro size={16} />}
          label={t("owner.kpi.revenue")}
          value={formatEuro(mtd.current)}
          delta={mtd.change}
          deltaLabel={t("owner.kpi.revenueDelta")}
          onClick={() => navigate("/payments")}
        />
        <StatTile
          tone="dark"
          icon={<Users size={16} />}
          label={t("owner.kpi.activeMembers")}
          value={current}
          hint={t("owner.kpi.activeHint", { rate: activeRate })}
          onClick={() => navigate("/members")}
        />
        <StatTile
          tone="danger"
          icon={<AlertTriangle size={16} />}
          label={t("owner.kpi.outstanding")}
          value={formatEuro(aging.total)}
          hint={t("owner.kpi.outstandingHint", {
            count: debts.length,
            critical: aging.critical.count,
          })}
          onClick={() => navigate("/debts")}
        />
        <StatTile
          tone="info"
          icon={<CalendarClock size={16} />}
          label={t("owner.kpi.renewals")}
          value={formatEuro(renewalValue(upcomingExpiries, packages))}
          hint={t("owner.kpi.renewalsHint", { count: upcomingExpiries.length })}
        />
        <StatTile
          tone="success"
          icon={<Footprints size={16} />}
          label={t("owner.kpi.visits")}
          value={formatNumber(avgVisits)}
          hint={t("owner.kpi.visitsHint", { today: visits.at(-1)?.count ?? 0 })}
        />
      </div>

      <div className="km-dash-grid">
        <PanelCard title={t("owner.revenue.title")} className="km-dash-panel km-col-8">
          <div className="km-chart" style={{ height: 260 }}>
            <Bar
              data={revenueData}
              options={cartesianOptions<"bar">({ format: formatEuro, stacked: true, legend: true })}
            />
          </div>
        </PanelCard>
        <PanelCard title={t("owner.byPackage.title")} className="km-dash-panel km-col-4">
          <DoughnutChart
            labels={byPackage.map(([name]) => name)}
            values={byPackage.map(([, v]) => v)}
            format={formatEuro}
            centerValue={formatEuro(packageTotal)}
            centerLabel={t("owner.byPackage.center")}
            legend="bottom"
            height={260}
          />
        </PanelCard>

        <PanelCard title={t("owner.visits.title")} className="km-dash-panel km-col-8">
          <div className="km-chart" style={{ height: 230 }}>
            <Line data={visitsData} options={cartesianOptions<"line">()} />
          </div>
        </PanelCard>
        <PanelCard title={t("owner.byMethod.title")} className="km-dash-panel km-col-4">
          <DoughnutChart
            labels={byMethod.map(([method]) => paymentMethodLabel(method))}
            values={byMethod.map(([, v]) => v)}
            format={formatEuro}
            centerValue={formatEuro(methodTotal)}
            centerLabel={t("owner.byMethod.center")}
            height={230}
          />
        </PanelCard>

        <div className="km-col-4">
          <DebtAgingPanel aging={aging} />
        </div>
        <div className="km-col-4">
          <ExpiriesPanel upcomingExpiries={upcomingExpiries} />
        </div>
        <div className="km-col-4">
          <DebtsPanel debts={debts} />
        </div>

        <div className="km-col-4">
          <MemberDistributionPanel
            series={[counts.active, counts.expiring, counts.expired]}
            labels={[
              t("distribution.labels.active"),
              t("distribution.labels.expiring"),
              t("distribution.labels.expired"),
            ]}
            total={members.length}
          />
        </div>
        <PanelCard title={t("owner.packages.title")} className="km-dash-panel km-col-8">
          <div className="km-chart" style={{ height: 250 }}>
            <Bar data={packagesData} options={cartesianOptions<"bar">()} />
          </div>
        </PanelCard>
        <div className="km-col-12">
          <PaymentStatusBar series={paymentSeries} isSample={false} />
        </div>
      </div>
    </div>
  );
};

export default FinanceDashboard;
