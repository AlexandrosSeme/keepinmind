import React from "react";
import { useNavigate } from "react-router-dom";
import { Line } from "react-chartjs-2";
import type { ChartData, ChartOptions } from "chart.js";
import "@/shared/lib/chartjs";
import { LinkButton, PanelCard, StatusBadge } from "@/shared/ui";
import { BRAND, CHART_FONT_CONDENSED } from "@/shared/lib/brand";

interface RevenuePanelProps {
  categories: string[];
  data: number[];
  isSample: boolean;
}

const axisTicks = {
  color: BRAND.muted,
  font: { size: 11, weight: 700, family: CHART_FONT_CONDENSED },
} as const;

const RevenuePanel: React.FC<RevenuePanelProps> = ({
  categories,
  data,
  isSample,
}) => {
  const navigate = useNavigate();

  const chartData: ChartData<"line"> = {
    labels: categories,
    datasets: [
      {
        label: "Εσοδα",
        data,
        fill: true,
        tension: 0.4,
        borderWidth: 3,
        borderColor: BRAND.yellowStrong,
        backgroundColor: "rgba(245, 196, 0, 0.22)",
        pointRadius: 4,
        pointHoverRadius: 6,
        pointBackgroundColor: BRAND.yellow,
        pointBorderColor: BRAND.ink,
        pointBorderWidth: 2,
      },
    ],
  };

  const options: ChartOptions<"line"> = {
    responsive: true,
    layout: { padding: { left: 8, right: 8 } },
    plugins: {
      legend: { display: false },
      tooltip: {
        callbacks: { label: (ctx) => `€${ctx.parsed.y}` },
      },
    },
    scales: {
      x: {
        grid: { display: false },
        border: { display: false },
        ticks: axisTicks,
      },
      y: {
        min: 0,
        grid: { color: BRAND.canvas },
        border: { display: false },
        ticks: {
          ...axisTicks,
          maxTicksLimit: 5,
          callback: (val) => `€${Math.round(Number(val))}`,
        },
      },
    },
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
      <div style={{ height: 190, width: "100%" }}>
        <Line data={chartData} options={options} />
      </div>
    </PanelCard>
  );
};

export default RevenuePanel;
