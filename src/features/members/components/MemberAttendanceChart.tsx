import React from "react";
import Chart from "react-apexcharts";
import type { ApexOptions } from "apexcharts";
import { PanelCard } from "@/shared/ui";
import { BRAND, CHART_FONT } from "@/shared/lib/brand";
import type { AttendanceStats } from "../hooks/useMemberAttendance";

interface MemberAttendanceChartProps {
  stats: AttendanceStats;
  monthly: { month: string; count: number }[];
}

// Empty months get a tiny bar so the axis still shows them.
const EMPTY_BAR = 0.08;

const axisLabelStyle = {
  colors: BRAND.muted,
  fontSize: "10px",
  fontWeight: 700,
};

const MemberAttendanceChart: React.FC<MemberAttendanceChartProps> = ({
  stats,
  monthly,
}) => {
  const maxAttendance = Math.max(...monthly.map((item) => item.count), 0);
  const yAxisMax = maxAttendance > 5 ? Math.ceil(maxAttendance * 1.15) : 5;

  const options: ApexOptions = {
    chart: {
      type: "bar",
      toolbar: { show: false },
      fontFamily: CHART_FONT,
      parentHeightOffset: 0,
    },
    colors: [BRAND.yellow],
    plotOptions: {
      bar: {
        horizontal: false,
        columnWidth: "42%",
        borderRadius: 3,
        borderRadiusApplication: "end",
      },
    },
    dataLabels: {
      enabled: true,
      style: { fontSize: "10px", fontWeight: 700, colors: [BRAND.ink] },
      offsetY: -14,
      formatter: (val: number) => (val > 0.1 ? String(Math.round(val)) : ""),
    },
    stroke: { show: false },
    xaxis: {
      categories: monthly.map((item) => item.month),
      labels: { style: axisLabelStyle, rotate: 0 },
      axisBorder: { show: false },
      axisTicks: { show: false },
    },
    yaxis: {
      min: 0,
      max: yAxisMax,
      tickAmount: 4,
      labels: {
        style: axisLabelStyle,
        formatter: (val: number) => String(Math.round(val)),
      },
    },
    fill: { opacity: 1 },
    grid: {
      borderColor: BRAND.canvas,
      strokeDashArray: 0,
      padding: { left: 4, right: 4 },
    },
    tooltip: {
      theme: "light",
      y: {
        formatter: (val: number) =>
          `${val < 0.1 ? 0 : Math.round(val)} προσελευσεις`,
      },
    },
  };

  const summary = [
    { label: "Εβδομαδα", value: stats.thisWeek },
    { label: "Μηνας", value: stats.thisMonth },
    { label: "Ετος", value: stats.thisYear },
  ];

  return (
    <PanelCard
      title="Προσελευσεις ανα μηνα"
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

      <Chart
        options={options}
        series={[
          {
            name: "Προσελευσεις",
            data: monthly.map((item) =>
              item.count === 0 ? EMPTY_BAR : item.count,
            ),
          },
        ]}
        type="bar"
        height={210}
      />
    </PanelCard>
  );
};

export default MemberAttendanceChart;
