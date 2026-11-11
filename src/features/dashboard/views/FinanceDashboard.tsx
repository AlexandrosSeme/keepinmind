import React, { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Bar } from "react-chartjs-2";
import type { ChartData } from "chart.js";
import "@/shared/lib/chartjs";
import {
  AlertTriangle,
  CalendarClock,
  CreditCard,
  Euro,
  Plus,
  Repeat,
  UserPlus,
  Wallet,
} from "lucide-react";
import { PanelCard } from "@/shared/ui";
import { BRAND } from "@/shared/lib/brand";
import { useDebts } from "@/features/debts";
import { useMembers } from "@/features/members";
import { paymentMethodLabel, usePayments } from "@/features/payments";
import { usePackages } from "@/features/subscriptions";
import { useUpcomingExpiries } from "../queries";
import {
  debtAging,
  monthPaymentStatus,
  monthToDate,
  renewalForecast,
  renewalRate,
  revenueByMethod,
  revenueByMonth,
  revenueByPackage,
  subscriptionMix,
} from "../lib/analytics";
import { cartesianOptions } from "../lib/chartOptions";
import { dayMonth, formatEuro, monthLabel } from "../lib/format";
import DashboardHeader from "../components/DashboardHeader";
import DoughnutChart from "../components/DoughnutChart";
import StatTile from "../components/StatTile";
import ExpiriesPanel from "../components/ExpiriesPanel";
import DebtsPanel from "../components/DebtsPanel";
import PaymentStatusBar from "../components/PaymentStatusBar";
import DebtAgingPanel from "../components/owner/DebtAgingPanel";
import RecentPaymentsPanel from "../components/owner/RecentPaymentsPanel";
import SubscriptionMixPanel from "../components/owner/SubscriptionMixPanel";

const FORECAST_WEEKS = 8;

/** Finance view (owner/admin): revenue, recurring income, renewals, debts and payments. */
const FinanceDashboard: React.FC = () => {
  const navigate = useNavigate();
  const { t } = useTranslation("dashboard");
  const { members } = useMembers();
  const { packages } = usePackages();
  const { payments } = usePayments();
  const { debts } = useDebts();
  const { upcomingExpiries } = useUpcomingExpiries(14);

  const mtd = useMemo(() => monthToDate(payments), [payments]);
  const months = useMemo(() => revenueByMonth(payments, 12), [payments]);
  const byPackage = useMemo(() => revenueByPackage(payments, members, 90), [payments, members]);
  const byMethod = useMemo(() => revenueByMethod(payments, 90), [payments]);
  const aging = useMemo(() => debtAging(debts), [debts]);
  const mix = useMemo(() => subscriptionMix(members, packages), [members, packages]);
  const forecast = useMemo(
    () => renewalForecast(members, packages, FORECAST_WEEKS),
    [members, packages],
  );
  const renewals = useMemo(() => renewalRate(members, payments, 30), [members, payments]);
  const monthStatus = useMemo(() => monthPaymentStatus(payments), [payments]);
  const recent = useMemo(
    () => [...payments].sort((a, b) => b.id - a.id).slice(0, 12),
    [payments],
  );

  const priceOf = useMemo(() => {
    const prices = new Map(packages.map((p) => [p.name, Number(p.price) || 0]));
    return (name: string) => prices.get(name) ?? 0;
  }, [packages]);

  const recurring = mix.reduce((s, r) => s + r.monthly, 0);
  const subscribers = mix.reduce((s, r) => s + r.members, 0);
  const next30 = forecast.slice(0, 4).reduce(
    (acc, w) => ({ amount: acc.amount + w.amount, count: acc.count + w.count }),
    { amount: 0, count: 0 },
  );
  const packageTotal = byPackage.reduce((s, [, v]) => s + v, 0);
  const methodTotal = byMethod.reduce((s, [, v]) => s + v, 0);

  const revenueData: ChartData<"bar"> = {
    labels: months.map((m) => monthLabel(m.month, m.year)),
    datasets: [
      {
        label: t("owner.revenue.completed"),
        data: months.map((m) => m.completed),
        backgroundColor: months.map((_, i) => (i === months.length - 1 ? BRAND.yellow : BRAND.ink)),
        borderRadius: 6,
        barPercentage: 0.6,
      },
      {
        label: t("owner.revenue.pending"),
        data: months.map((m) => m.pending),
        backgroundColor: "rgba(245, 196, 0, 0.45)",
        borderRadius: 6,
        barPercentage: 0.6,
      },
    ],
  };

  const forecastData: ChartData<"bar"> = {
    labels: forecast.map((w) => dayMonth(w.start)),
    datasets: [
      {
        label: t("finance.forecast.dataset"),
        data: forecast.map((w) => w.amount),
        backgroundColor: forecast.map((_, i) => (i < 2 ? BRAND.yellow : BRAND.ink)),
        borderRadius: 6,
        barPercentage: 0.6,
      },
    ],
  };
  const forecastOptions = cartesianOptions<"bar">({ format: formatEuro });
  forecastOptions.plugins!.tooltip!.callbacks!.label = (ctx) =>
    ` ${formatEuro(Number(ctx.parsed.y))} · ${t("finance.forecast.members", { count: forecast[ctx.dataIndex].count })}`;

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
          icon={<Wallet size={16} />}
          label={t("finance.kpi.recurring")}
          value={formatEuro(recurring)}
          hint={t("finance.kpi.recurringHint", { count: subscribers })}
          onClick={() => navigate("/subscriptions")}
        />
        <StatTile
          tone="info"
          icon={<CalendarClock size={16} />}
          label={t("finance.kpi.expected")}
          value={formatEuro(next30.amount)}
          hint={t("finance.kpi.expectedHint", { count: next30.count })}
        />
        <StatTile
          tone="success"
          icon={<Repeat size={16} />}
          label={t("finance.kpi.renewalRate")}
          value={renewals.rate === null ? "—" : `${renewals.rate}%`}
          hint={t("finance.kpi.renewalRateHint", { renewed: renewals.renewed, lost: renewals.lost })}
        />
        <StatTile
          tone="danger"
          icon={<AlertTriangle size={16} />}
          label={t("owner.kpi.outstanding")}
          value={formatEuro(aging.total)}
          hint={t("owner.kpi.outstandingHint", { count: debts.length, critical: aging.critical.count })}
          onClick={() => navigate("/debts")}
        />
      </div>

      <div className="km-dash-grid">
        <PanelCard title={t("finance.revenue.title")} className="km-dash-panel km-col-8">
          <div className="km-chart" style={{ height: 270 }}>
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
            height={270}
          />
        </PanelCard>

        <PanelCard
          title={t("finance.forecast.title")}
          badge={<span className="km-chip km-chip--brand">{formatEuro(forecast.reduce((s, w) => s + w.amount, 0))}</span>}
          className="km-dash-panel km-col-8"
        >
          <div className="km-chart" style={{ height: 240 }}>
            <Bar data={forecastData} options={forecastOptions} />
          </div>
          <small className="text-muted d-block mt-2">{t("finance.forecast.hint")}</small>
        </PanelCard>
        <PanelCard title={t("owner.byMethod.title")} className="km-dash-panel km-col-4">
          <DoughnutChart
            labels={byMethod.map(([method]) => paymentMethodLabel(method))}
            values={byMethod.map(([, v]) => v)}
            format={formatEuro}
            centerValue={formatEuro(methodTotal)}
            centerLabel={t("owner.byMethod.center")}
            height={240}
          />
        </PanelCard>

        <div className="km-col-12">
          <PaymentStatusBar status={monthStatus} />
        </div>

        <div className="km-col-8">
          <SubscriptionMixPanel rows={mix} />
        </div>
        <div className="km-col-4">
          <RecentPaymentsPanel payments={recent} />
        </div>

        <div className="km-col-4">
          <DebtAgingPanel aging={aging} />
        </div>
        <div className="km-col-4">
          <DebtsPanel debts={debts} />
        </div>
        <div className="km-col-4">
          <ExpiriesPanel upcomingExpiries={upcomingExpiries} priceOf={priceOf} />
        </div>
      </div>
    </div>
  );
};

export default FinanceDashboard;
