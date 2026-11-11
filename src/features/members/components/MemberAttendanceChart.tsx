import React from "react";
import { useTranslation } from "react-i18next";
import { Bar } from "react-chartjs-2";
import type { ChartData, ChartOptions, Plugin } from "chart.js";
import "@/shared/lib/chartjs";
import { PanelCard } from "@/shared/ui";
import { BRAND, CHART_FONT } from "@/shared/lib/brand";
import type { AttendanceStats } from "../hooks/useMemberAttendance";

interface MemberAttendanceChartProps {
  stats: AttendanceStats;
  monthly: { month: string; count: number }[];
}

const axisTicks = {
  color: BRAND.muted,
  font: { size: 10, weight: 700 },
} as const;

const barValueLabels: Plugin<"bar"> = {
  id: "barValueLabels",
  afterDatasetsDraw(chart) {
    const { ctx } = chart;
    const meta = chart.getDatasetMeta(0);
    const values = chart.data.datasets[0]?.data ?? [];
    ctx.save();
    ctx.font = `700 10px ${CHART_FONT}`;
    ctx.fillStyle = BRAND.ink;
    ctx.textAlign = "center";
    ctx.textBaseline = "bottom";
    meta.data.forEach((bar, i) => {
      const value = Number(values[i]);
      if (value > 0) ctx.fillText(String(value), bar.x, bar.y - 3);
    });
    ctx.restore();
  },
};

const MemberAttendanceChart: React.FC<MemberAttendanceChartProps> = ({
  stats,
  monthly,
}) => {
  const { t } = useTranslation("members");
  const maxAttendance = Math.max(...monthly.map((item) => item.count), 0);
  const yAxisMax = maxAttendance > 5 ? Math.ceil(maxAttendance * 1.15) : 5;

  const chartData: ChartData<"bar"> = {
    labels: monthly.map((item) => item.month),
    datasets: [
      {
        label: t("attendance.title"),
        data: monthly.map((item) => item.count),
        backgroundColor: BRAND.yellow,
        borderRadius: { topLeft: 3, topRight: 3 },
        borderSkipped: "bottom",
        categoryPercentage: 0.42,
        barPercentage: 1,
        // Empty months still get a sliver so the axis shows them.
        minBarLength: 2,
      },
    ],
  };

  const options: ChartOptions<"bar"> = {
    responsive: true,
    layout: { padding: { left: 4, right: 4, top: 16 } },
    plugins: {
      legend: { display: false },
      tooltip: {
        callbacks: {
          label: (ctx) => t("attendance.tooltip", { count: ctx.parsed.y ?? 0 }),
        },
      },
    },
    scales: {
      x: {
        grid: { display: false },
        border: { display: false },
        ticks: { ...axisTicks, maxRotation: 0 },
      },
      y: {
        min: 0,
        max: yAxisMax,
        grid: { color: BRAND.canvas },
        border: { display: false },
        ticks: {
          ...axisTicks,
          maxTicksLimit: 5,
          callback: (val) => String(Math.round(Number(val))),
        },
      },
    },
  };

  const summary = [
    { label: t("attendance.week"), value: stats.thisWeek },
    { label: t("attendance.month"), value: stats.thisMonth },
    { label: t("attendance.year"), value: stats.thisYear },
  ];

  return (
    <PanelCard
      title={t("attendance.chartTitle")}
      className="km-member__panel"
      bodyClassName="p-3 pt-2"
    >
      <div className="km-member__stats">
        {summary.map((item) => (
          <div key={item.label} className="km-member__stat">
            <div className="km-stat-label mb-1">{item.label}</div>
            <div className="km-member__stat-value">{item.value}</div>
          </div>
        ))}
      </div>

      <div style={{ height: 210 }}>
        <Bar data={chartData} options={options} plugins={[barValueLabels]} />
      </div>
    </PanelCard>
  );
};

export default MemberAttendanceChart;
