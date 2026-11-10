import React, { useMemo } from "react";
import {
  Users,
  CheckCircle,
  Clock,
  AlertCircle,
  Euro,
  TrendingUp,
  Plus,
  CreditCard,
  QrCode,
  UserPlus,
  Package,
} from "lucide-react";
import Chart from "react-apexcharts";
import type { ApexOptions } from "apexcharts";
import type { Stats, UpcomingExpiry, Debt, Payment } from "../types";
import { useNavigate } from "react-router-dom";
import { useAppData } from "../contexts/AppDataContext";
import StatusBadge from "./ui/StatusBadge";
import "./Dashboard.scss";

interface DashboardProps {
  stats: Stats;
  upcomingExpiries: UpcomingExpiry[];
  debts: Debt[];
  payments?: Payment[];
}

const GREEK_MONTHS = [
  "Ιαν",
  "Φεβ",
  "Μαρ",
  "Απρ",
  "Μαι",
  "Ιουν",
  "Ιουλ",
  "Αυγ",
  "Σεπ",
  "Οκτ",
  "Νοε",
  "Δεκ",
];

const BRAND = {
  yellow: "#f5c400",
  yellowStrong: "#d4a800",
  yellowSoft: "#ffe566",
  ink: "#111111",
  charcoal: "#2a2a2a",
  slate: "#5c5c5c",
  muted: "#8a8680",
  canvas: "#e8e5df",
  /** Member / payment semantic tones aligned to Melos */
  active: "#1a1a1a",
  expiring: "#f5c400",
  expired: "#8a8680",
  paid: "#111111",
  pending: "#f5c400",
  failed: "#5c5c5c",
};

function parsePaymentDate(dateStr: string): Date | null {
  const parts = dateStr.trim().split(/[./-]/);
  if (parts.length !== 3) return null;
  const [dd, mm, yyyy] = parts.map(Number);
  if (!dd || !mm || !yyyy) return null;
  const d = new Date(yyyy, mm - 1, dd);
  return Number.isNaN(d.getTime()) ? null : d;
}

function lastSixMonthBuckets() {
  const now = new Date();
  const buckets: { key: string; label: string }[] = [];
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    buckets.push({
      key: `${d.getFullYear()}-${d.getMonth()}`,
      label: GREEK_MONTHS[d.getMonth()],
    });
  }
  return buckets;
}

const Dashboard: React.FC<DashboardProps> = ({
  stats,
  upcomingExpiries,
  debts,
  payments: paymentsProp = [],
}) => {
  const navigate = useNavigate();
  const { payments: paymentsCtx, members } = useAppData();
  const payments = paymentsCtx.length > 0 ? paymentsCtx : paymentsProp;

  const todayLabel = new Date().toLocaleDateString("el-GR", {
    weekday: "short",
    day: "numeric",
    month: "short",
  });

  const sortedExpiries = useMemo(
    () => [...upcomingExpiries].sort((a, b) => a.days - b.days).slice(0, 6),
    [upcomingExpiries]
  );

  const sortedDebts = useMemo(
    () =>
      [...debts]
        .sort((a, b) => b.daysOverdue - a.daysOverdue || b.amount - a.amount)
        .slice(0, 6),
    [debts]
  );

  const memberDistribution = useMemo(() => {
    const active = members.filter((m) => m.status === "active").length;
    const expiring = members.filter((m) => m.status === "expiring_soon").length;
    const expired = members.filter((m) => m.status === "expired").length;
    const total = active + expiring + expired;
    return {
      series: total > 0 ? [active, expiring, expired] : [0, 0, 0],
      total,
      labels: ["Ενεργα", "Ληγουν", "Ληγμενα"],
    };
  }, [members]);

  /** Demo series when Supabase payments table is empty */
  const sampleRevenue = useMemo(() => {
    const base = Math.max(members.length, 8);
    return [
      Math.round(base * 72),
      Math.round(base * 85),
      Math.round(base * 78),
      Math.round(base * 98),
      Math.round(base * 105),
      Math.round(base * 118),
    ];
  }, [members.length]);

  const samplePaymentStatus = useMemo(
    () => [
      Math.max(12, Math.round(members.length * 1.4)),
      Math.max(2, Math.round(members.length * 0.25)),
      Math.max(1, Math.round(members.length * 0.08)),
    ],
    [members.length]
  );

  const revenueSeries = useMemo(() => {
    const buckets = lastSixMonthBuckets();
    const totals = buckets.map(() => 0);

    payments.forEach((p) => {
      if (p.status !== "completed") return;
      const d = parsePaymentDate(p.date);
      if (!d) return;
      const key = `${d.getFullYear()}-${d.getMonth()}`;
      const idx = buckets.findIndex((b) => b.key === key);
      if (idx >= 0) totals[idx] += Number(p.amount) || 0;
    });

    const hasReal = totals.some((v) => v > 0);
    return {
      categories: buckets.map((b) => b.label),
      data: hasReal ? totals : sampleRevenue,
      hasReal,
    };
  }, [payments, sampleRevenue]);

  const paymentStatus = useMemo(() => {
    const completed = payments.filter((p) => p.status === "completed").length;
    const pending = payments.filter((p) => p.status === "pending").length;
    const failed = payments.filter((p) => p.status === "failed").length;
    const total = completed + pending + failed;
    const hasReal = total > 0;
    return {
      series: hasReal ? [completed, pending, failed] : samplePaymentStatus,
      total: hasReal ? total : samplePaymentStatus.reduce((a, b) => a + b, 0),
      hasReal,
      labels: ["Ολοκληρωμενες", "Εκκρεμεις", "Αποτυχιες"],
    };
  }, [payments, samplePaymentStatus]);

  const displayRevenue = revenueSeries.hasReal
    ? stats.monthlyRevenue
    : String(sampleRevenue[sampleRevenue.length - 1]);
  const displayPending = paymentStatus.hasReal
    ? stats.pendingPayments
    : String(Math.round(sampleRevenue[sampleRevenue.length - 1] * 0.12));

  const donutMembersOptions: ApexOptions = {
    chart: {
      type: "donut",
      toolbar: { show: false },
      fontFamily: "Barlow Condensed, Barlow, sans-serif",
    },
    colors: [BRAND.active, BRAND.expiring, BRAND.expired],
    labels: memberDistribution.labels,
    legend: {
      position: "bottom",
      fontSize: "11px",
      fontWeight: 700,
      fontFamily: "Barlow Condensed, sans-serif",
      markers: { size: 6, shape: "circle" },
      itemMargin: { horizontal: 8, vertical: 2 },
      labels: { colors: BRAND.charcoal },
    },
    dataLabels: { enabled: false },
    plotOptions: {
      pie: {
        expandOnClick: false,
        donut: {
          size: "72%",
          labels: {
            show: true,
            name: { show: false },
            value: {
              show: true,
              fontSize: "1.35rem",
              fontFamily: "Barlow Condensed, sans-serif",
              fontWeight: 800,
              color: BRAND.ink,
            },
            total: {
              show: true,
              label: "ΜΕΛΗ",
              fontSize: "0.65rem",
              fontFamily: "Barlow Condensed, sans-serif",
              fontWeight: 700,
              color: BRAND.muted,
              formatter: () => String(memberDistribution.total),
            },
          },
        },
      },
    },
    stroke: { width: 2, colors: ["#ffffff"] },
    tooltip: {
      theme: "light",
      y: { formatter: (val) => `${val} μελη` },
    },
  };

  const revenueOptions: ApexOptions = {
    chart: {
      type: "area",
      toolbar: { show: false },
      fontFamily: "Barlow Condensed, Barlow, sans-serif",
      zoom: { enabled: false },
      parentHeightOffset: 0,
    },
    colors: [BRAND.yellow],
    dataLabels: { enabled: false },
    stroke: { curve: "smooth", width: 3, colors: [BRAND.yellowStrong] },
    fill: {
      type: "solid",
      colors: [BRAND.yellow],
      opacity: 0.22,
    },
    markers: {
      size: 4,
      colors: [BRAND.yellow],
      strokeColors: BRAND.ink,
      strokeWidth: 2,
      hover: { size: 6 },
    },
    grid: {
      borderColor: BRAND.canvas,
      strokeDashArray: 0,
      padding: { left: 8, right: 8, top: 0, bottom: 0 },
    },
    xaxis: {
      categories: revenueSeries.categories,
      labels: {
        style: {
          colors: BRAND.muted,
          fontSize: "11px",
          fontWeight: 700,
          fontFamily: "Barlow Condensed, sans-serif",
        },
      },
      axisBorder: { show: false },
      axisTicks: { show: false },
    },
    yaxis: {
      min: 0,
      tickAmount: 4,
      labels: {
        style: {
          colors: BRAND.muted,
          fontSize: "11px",
          fontWeight: 700,
          fontFamily: "Barlow Condensed, sans-serif",
        },
        formatter: (val) => `€${Math.round(val)}`,
      },
    },
    tooltip: {
      theme: "light",
      y: { formatter: (val) => `€${val}` },
    },
  };

  const paymentMeters = [
    {
      label: "Ολοκληρωμενες",
      value: paymentStatus.series[0],
      color: BRAND.paid,
    },
    {
      label: "Εκκρεμεις",
      value: paymentStatus.series[1],
      color: BRAND.pending,
    },
    {
      label: "Αποτυχιες",
      value: paymentStatus.series[2],
      color: BRAND.failed,
    },
  ];
  const paymentMeterMax = Math.max(...paymentMeters.map((m) => m.value), 1);

  const kpis: {
    title: string;
    value: string | number;
    icon: React.ReactNode;
    to: string;
  }[] = [
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

  const quickActions = [
    { label: "Μελος", icon: <UserPlus size={14} />, to: "/members" },
    { label: "Πληρωμη", icon: <CreditCard size={14} />, to: "/payments" },
    { label: "QR", icon: <QrCode size={14} />, to: "/qr-scanner" },
    { label: "Οφειλη", icon: <Plus size={14} />, to: "/debts" },
  ];

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
              <div
                className="km-avatar-soft"
                style={{ width: 32, height: 32 }}
              >
                {kpi.icon}
              </div>
            </div>
          </button>
        ))}
      </div>

      <div className="km-dashboard__body">
        {/* Expiries */}
        <div className="card border-0 shadow-sm km-dashboard__panel">
          <div className="card-header border-0 py-2 px-3 d-flex align-items-center justify-content-between">
            <h6 className="card-title mb-0">Επερχομενες Ληξεις</h6>
            <button
              type="button"
              className="btn btn-link btn-sm km-action-link p-0"
              onClick={() => navigate("/members")}
            >
              Ολα
            </button>
          </div>
          <div className="card-body p-0 km-dashboard__scroll">
            {sortedExpiries.length === 0 ? (
              <div className="km-dashboard__empty">
                <Package size={22} className="mb-1 opacity-50" />
                <span>Καμια ληξη</span>
              </div>
            ) : (
              sortedExpiries.map((exp) => (
                <div
                  key={exp.id}
                  className="km-dashboard__row d-flex align-items-center justify-content-between gap-2"
                >
                  <div className="min-w-0">
                    <div className="fw-semibold text-dark text-truncate">
                      {exp.name}
                    </div>
                    <small className="text-muted text-truncate d-block">
                      {exp.package}
                    </small>
                  </div>
                  <StatusBadge
                    tone={exp.days <= 3 ? "danger" : "warning"}
                    label={`${exp.days}η`}
                    showDot={false}
                  />
                </div>
              ))
            )}
          </div>
        </div>

        {/* Member distribution chart */}
        <div className="card border-0 shadow-sm km-dashboard__panel">
          <div className="card-header border-0 py-2 px-3">
            <h6 className="card-title mb-0">Κατανομη Μελων</h6>
          </div>
          <div className="card-body p-2 d-flex align-items-center justify-content-center km-dashboard__chart">
            {memberDistribution.total === 0 ? (
              <div className="km-dashboard__empty">
                <Users size={22} className="mb-1 opacity-50" />
                <span>Χωρις μελη ακομη</span>
              </div>
            ) : (
              <Chart
                options={donutMembersOptions}
                series={memberDistribution.series}
                type="donut"
                height={190}
                width="100%"
              />
            )}
          </div>
        </div>

        {/* Debts */}
        <div className="card border-0 shadow-sm km-dashboard__panel">
          <div className="card-header border-0 py-2 px-3 d-flex align-items-center justify-content-between">
            <h6 className="card-title mb-0">Οφειλες</h6>
            <button
              type="button"
              className="btn btn-link btn-sm km-action-link p-0"
              onClick={() => navigate("/debts")}
            >
              Ολα
            </button>
          </div>
          <div className="card-body p-0 km-dashboard__scroll">
            {sortedDebts.length === 0 ? (
              <div className="km-dashboard__empty">
                <CheckCircle size={22} className="mb-1 opacity-50" />
                <span>Καμια οφειλη</span>
              </div>
            ) : (
              sortedDebts.map((debt) => (
                <div
                  key={debt.id}
                  className="km-dashboard__row d-flex align-items-center justify-content-between gap-2"
                >
                  <div className="min-w-0">
                    <div className="fw-semibold text-dark text-truncate">
                      {debt.name}
                    </div>
                    <small className="text-muted">
                      {debt.daysOverdue} ημ. ·{" "}
                      <button
                        type="button"
                        className="btn btn-link btn-sm km-action-link p-0 align-baseline"
                        onClick={() => navigate("/payments")}
                      >
                        Πληρωμη
                      </button>
                    </small>
                  </div>
                  <div className="text-end flex-shrink-0">
                    <div className="fw-bold text-danger" style={{ fontSize: "0.9rem" }}>
                      €{debt.amount}
                    </div>
                    <StatusBadge status={debt.status} showDot={false} />
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Revenue + payment status charts stacked in one panel on large screens — split into revenue */}
        <div className="card border-0 shadow-sm km-dashboard__panel">
          <div className="card-header border-0 py-2 px-3 d-flex align-items-center justify-content-between gap-2">
            <div className="d-flex align-items-center gap-2 min-w-0">
              <h6 className="card-title mb-0">Εσοδα (6 μηνες)</h6>
              {!revenueSeries.hasReal && (
                <span className="km-badge km-badge--neutral" title="Δειγμα δεδομενων μεχρι να καταχωρηθουν πληρωμες">
                  <span className="km-badge__label">Δειγμα</span>
                </span>
              )}
            </div>
            <button
              type="button"
              className="btn btn-link btn-sm km-action-link p-0 flex-shrink-0"
              onClick={() => navigate("/payments")}
            >
              Πληρωμες
            </button>
          </div>
          <div className="card-body p-2 km-dashboard__chart">
            <Chart
              options={revenueOptions}
              series={[{ name: "Εσοδα", data: revenueSeries.data }]}
              type="area"
              height={190}
              width="100%"
            />
          </div>
        </div>
      </div>

      <div className="card border-0 shadow-sm km-dashboard__payments-bar">
        <div className="km-dashboard__pay-status">
          <div className="km-dashboard__pay-status-head">
            <div className="d-flex align-items-center gap-2">
              <div className="km-stat-label mb-0">Κατασταση πληρωμων</div>
              {!paymentStatus.hasReal && (
                <span className="km-badge km-badge--neutral">
                  <span className="km-badge__label">Δειγμα</span>
                </span>
              )}
            </div>
            <button
              type="button"
              className="btn btn-link btn-sm km-action-link p-0"
              onClick={() => navigate("/payments")}
            >
              Λεπτομερειες
            </button>
          </div>
          <div className="km-dashboard__meters">
            {paymentMeters.map((meter) => (
              <div key={meter.label} className="km-dashboard__meter">
                <div className="km-dashboard__meter-meta">
                  <span className="km-dashboard__meter-label">{meter.label}</span>
                  <span className="km-dashboard__meter-value">{meter.value}</span>
                </div>
                <div className="km-dashboard__meter-track">
                  <div
                    className="km-dashboard__meter-fill"
                    style={{
                      width: `${Math.max(
                        6,
                        (meter.value / paymentMeterMax) * 100
                      )}%`,
                      backgroundColor: meter.color,
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
