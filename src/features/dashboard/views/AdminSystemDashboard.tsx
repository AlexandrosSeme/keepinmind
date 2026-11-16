import React, { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Bar, Line } from "react-chartjs-2";
import type { ChartData } from "chart.js";
import "@/shared/lib/chartjs";
import {
  Activity,
  Database,
  ServerCrash,
  ShieldCheck,
  TriangleAlert,
  UserCog,
  Wifi,
} from "lucide-react";
import { LinkButton, PanelCard } from "@/shared/ui";
import { BRAND } from "@/shared/lib/brand";
import { useDebts } from "@/features/debts";
import { useMembers } from "@/features/members";
import { usePayments } from "@/features/payments";
import { useStaff } from "@/features/staff";
import { STAFF_ROLES } from "@/features/auth";
import { useApiHealth, useCollectionCounts, useRecentVisits } from "../queries";
import { dataQuality, sameDay } from "../lib/analytics";
import { cartesianOptions, verticalGradient } from "../lib/chartOptions";
import { dayMonth, formatNumber } from "../lib/format";
import { formatDateTime } from "@/shared/lib/date";
import StatTile from "../components/StatTile";
import DoughnutChart from "../components/DoughnutChart";
import QualityPanel from "../components/admin/QualityPanel";
import EnvironmentPanel from "../components/admin/EnvironmentPanel";

const ROLE_COLORS = [BRAND.ink, BRAND.yellow, BRAND.info];

/** Developer view: API health, database size, accounts, data quality and activity. */
const AdminSystemDashboard: React.FC = () => {
  const navigate = useNavigate();
  const { t } = useTranslation(["dashboard", "auth"]);
  const health = useApiHealth();
  const { counts } = useCollectionCounts();
  const { users: staff } = useStaff();
  const { members } = useMembers();
  const { payments } = usePayments();
  const { debts } = useDebts();
  const { logs } = useRecentVisits(14);

  const now = new Date();
  const online = health.isSuccess && !health.isError;
  const totalRecords = counts.reduce((s, c) => s + c.count, 0);
  const roleCounts = STAFF_ROLES.map((role) => staff.filter((s) => s.role === role).length);
  const checks = useMemo(
    () => dataQuality(members, payments, debts),
    [members, payments, debts],
  );
  const issues = checks
    .filter((c) => c.severity !== "info")
    .reduce((s, c) => s + c.count, 0);
  const last24h = logs.filter((l) => now.getTime() - new Date(l.timestamp).getTime() < 86400000);
  const recentSignIns = [...staff]
    .sort((a, b) => (b.lastSignInAt ?? "").localeCompare(a.lastSignInAt ?? ""))
    .slice(0, 6);

  const days = Array.from({ length: 14 }, (_, i) => {
    const date = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 13 + i);
    const dayLogs = logs.filter((l) => sameDay(new Date(l.timestamp), date));
    const rejected = dayLogs.filter((l) => l.validationStatus === "invalid").length;
    return { date, admitted: dayLogs.length - rejected, rejected };
  });

  const activityData: ChartData<"line"> = {
    labels: days.map((d) => dayMonth(d.date)),
    datasets: [
      {
        label: t("admin.activity.visits"),
        data: days.map((d) => d.admitted),
        borderColor: BRAND.ink,
        backgroundColor: verticalGradient("26, 26, 26", 0.18),
        fill: true,
        tension: 0.35,
        borderWidth: 2.5,
        pointRadius: 0,
        pointHoverRadius: 5,
      },
      {
        label: t("admin.activity.rejected"),
        data: days.map((d) => d.rejected),
        borderColor: BRAND.danger,
        backgroundColor: BRAND.danger,
        tension: 0.35,
        borderWidth: 2,
        pointRadius: 0,
        pointHoverRadius: 5,
      },
    ],
  };

  const collectionsData: ChartData<"bar"> = {
    labels: counts.map((c) => t(`admin.collections.names.${c.name}`)),
    datasets: [
      {
        label: t("admin.collections.dataset"),
        data: counts.map((c) => c.count),
        backgroundColor: counts.map((_, i) => (i === 0 ? BRAND.yellow : BRAND.ink)),
        borderRadius: 5,
        barPercentage: 0.7,
      },
    ],
  };

  return (
    <div className="km-dash">
      <div className="km-stat-grid">
        <StatTile
          tone={online ? "success" : "danger"}
          icon={online ? <Wifi size={16} /> : <ServerCrash size={16} />}
          label={t("admin.kpi.api")}
          value={online ? t("admin.kpi.online") : t("admin.kpi.offline")}
          hint={
            online
              ? t("admin.kpi.latency", { ms: health.data })
              : t("admin.kpi.offlineHint")
          }
        />
        <StatTile
          tone="dark"
          icon={<Database size={16} />}
          label={t("admin.kpi.records")}
          value={formatNumber(totalRecords)}
          hint={t("admin.kpi.recordsHint", { count: counts.length })}
        />
        <StatTile
          tone="brand"
          icon={<UserCog size={16} />}
          label={t("admin.kpi.staff")}
          value={staff.length}
          hint={t("admin.kpi.staffHint", {
            admins: roleCounts[0],
            owners: roleCounts[1],
            trainers: roleCounts[2],
          })}
          onClick={() => navigate("/staff")}
        />
        <StatTile
          tone="info"
          icon={<Activity size={16} />}
          label={t("admin.kpi.activity")}
          value={last24h.length}
          hint={t("admin.kpi.activityHint", {
            rejected: last24h.filter((l) => l.validationStatus === "invalid").length,
          })}
        />
        <StatTile
          tone={issues > 0 ? "danger" : "success"}
          icon={issues > 0 ? <TriangleAlert size={16} /> : <ShieldCheck size={16} />}
          label={t("admin.kpi.issues")}
          value={issues}
          hint={t("admin.kpi.issuesHint", { count: checks.length })}
        />
      </div>

      <div className="km-dash-grid">
        <PanelCard title={t("admin.activity.title")} className="km-dash-panel km-col-8">
          <div className="km-chart" style={{ height: 250 }}>
            <Line data={activityData} options={cartesianOptions<"line">({ legend: true })} />
          </div>
        </PanelCard>
        <div className="km-col-4">
          <QualityPanel checks={checks} />
        </div>

        <PanelCard title={t("admin.collections.title")} className="km-dash-panel km-col-5">
          <div className="km-chart" style={{ height: 280 }}>
            <Bar
              data={collectionsData}
              options={cartesianOptions<"bar">({ horizontal: true, format: formatNumber })}
            />
          </div>
        </PanelCard>
        <PanelCard
          title={t("admin.roles.title")}
          action={
            <LinkButton onClick={() => navigate("/staff")}>{t("admin.roles.manage")}</LinkButton>
          }
          className="km-dash-panel km-col-3"
        >
          <DoughnutChart
            labels={STAFF_ROLES.map((r) => t(`auth:roles.${r}`))}
            values={roleCounts}
            colors={ROLE_COLORS}
            format={(v) => String(v)}
            centerValue={String(staff.length)}
            centerLabel={t("admin.roles.center")}
            legend="bottom"
            height={280}
          />
        </PanelCard>
        <PanelCard
          title={t("admin.signIns.title")}
          className="km-dash-panel km-col-4"
          bodyClassName="p-0 km-dash-scroll"
        >
          {recentSignIns.map((user) => (
            <div key={user.id} className="km-dashboard__row d-flex align-items-center justify-content-between gap-2">
              <div className="min-w-0">
                <div className="fw-semibold text-dark text-truncate">{user.fullName || user.email}</div>
                <small className="text-muted">{t(`auth:roles.${user.role}`)}</small>
              </div>
              <small className="text-muted text-nowrap">
                {user.lastSignInAt ? formatDateTime(user.lastSignInAt) : t("admin.signIns.never")}
              </small>
            </div>
          ))}
        </PanelCard>

        <div className="km-col-12">
          <EnvironmentPanel latency={online ? (health.data ?? null) : null} />
        </div>
      </div>
    </div>
  );
};

export default AdminSystemDashboard;
