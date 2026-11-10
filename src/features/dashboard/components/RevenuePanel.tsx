import React from "react";
import { useNavigate } from "react-router-dom";
import Chart from "react-apexcharts";
import type { ApexOptions } from "apexcharts";
import { LinkButton, PanelCard, StatusBadge } from "@/shared/ui";
import { BRAND, CHART_FONT, CHART_FONT_CONDENSED } from "@/shared/lib/brand";

interface RevenuePanelProps {
  categories: string[];
  data: number[];
  isSample: boolean;
}

const axisLabelStyle = {
  colors: BRAND.muted,
  fontSize: "11px",
  fontWeight: 700,
  fontFamily: CHART_FONT_CONDENSED,
};

const RevenuePanel: React.FC<RevenuePanelProps> = ({
  categories,
  data,
  isSample,
}) => {
  const navigate = useNavigate();

  const options: ApexOptions = {
    chart: {
      type: "area",
      toolbar: { show: false },
      fontFamily: CHART_FONT,
      zoom: { enabled: false },
      parentHeightOffset: 0,
    },
    colors: [BRAND.yellow],
    dataLabels: { enabled: false },
    stroke: { curve: "smooth", width: 3, colors: [BRAND.yellowStrong] },
    fill: { type: "solid", colors: [BRAND.yellow], opacity: 0.22 },
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
      categories,
      labels: { style: axisLabelStyle },
      axisBorder: { show: false },
      axisTicks: { show: false },
    },
    yaxis: {
      min: 0,
      tickAmount: 4,
      labels: {
        style: axisLabelStyle,
        formatter: (val) => `€${Math.round(val)}`,
      },
    },
    tooltip: { theme: "light", y: { formatter: (val) => `€${val}` } },
  };

  return (
    <PanelCard
      title="Εσοδα (6 μηνες)"
      badge={
        isSample && (
          <StatusBadge tone="neutral" label="Δειγμα" showDot={false} />
        )
      }
      action={
        <LinkButton onClick={() => navigate("/payments")}>Πληρωμες</LinkButton>
      }
      className="km-dashboard__panel"
      bodyClassName="p-2 km-dashboard__chart"
    >
      <Chart
        options={options}
        series={[{ name: "Εσοδα", data }]}
        type="area"
        height={190}
        width="100%"
      />
    </PanelCard>
  );
};

export default RevenuePanel;
