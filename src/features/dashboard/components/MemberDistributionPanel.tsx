import React from "react";
import { Doughnut } from "react-chartjs-2";
import type { ChartData, ChartOptions } from "chart.js";
import "@/shared/lib/chartjs";
import { Users } from "lucide-react";
import { PanelCard } from "@/shared/ui";
import { BRAND, CHART_FONT_CONDENSED } from "@/shared/lib/brand";
import DashboardEmpty from "./DashboardEmpty";

interface MemberDistributionPanelProps {
  series: number[];
  labels: string[];
  total: number;
}

const MemberDistributionPanel: React.FC<MemberDistributionPanelProps> = ({
  series,
  labels,
  total,
}) => {
  const chartData: ChartData<"doughnut"> = {
    labels,
    datasets: [
      {
        data: series,
        backgroundColor: [BRAND.active, BRAND.expiring, BRAND.expired],
        borderColor: "#ffffff",
        borderWidth: 2,
        hoverOffset: 0,
      },
    ],
  };

  const options: ChartOptions<"doughnut"> = {
    responsive: true,
    cutout: "72%",
    plugins: {
      legend: {
        position: "bottom",
        labels: {
          color: BRAND.charcoal,
          font: { size: 11, weight: 700, family: CHART_FONT_CONDENSED },
          usePointStyle: true,
          pointStyle: "circle",
          boxWidth: 6,
          boxHeight: 6,
          padding: 10,
        },
      },
      tooltip: {
        callbacks: { label: (ctx) => ` ${ctx.label}: ${ctx.parsed} μελη` },
      },
    },
  };

  return (
    <PanelCard
      title="Κατανομη Μελων"
      className="km-dashboard__panel"
      bodyClassName="p-2 d-flex align-items-center justify-content-center km-dashboard__chart"
    >
      {total === 0 ? (
        <DashboardEmpty
          icon={<Users size={22} className="mb-1 opacity-50" />}
          text="Χωρις μελη ακομη"
        />
      ) : (
        <div className="km-dashboard__donut">
          <Doughnut data={chartData} options={options} />
          <div className="km-dashboard__donut-center">
            <div className="km-dashboard__donut-value">{total}</div>
            <div className="km-dashboard__donut-label">ΜΕΛΗ</div>
          </div>
        </div>
      )}
    </PanelCard>
  );
};

export default MemberDistributionPanel;
