import React from "react";
import { useTranslation } from "react-i18next";
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
  const { t } = useTranslation("dashboard");
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
        callbacks: {
          label: (ctx) =>
            ` ${t("distribution.tooltip", { label: ctx.label, count: ctx.parsed })}`,
        },
      },
    },
  };

  return (
    <PanelCard
      title={t("distribution.title")}
      className="km-dashboard__panel"
      bodyClassName="p-2 d-flex align-items-center justify-content-center km-dashboard__chart"
    >
      {total === 0 ? (
        <DashboardEmpty
          icon={<Users size={22} className="mb-1 opacity-50" />}
          text={t("distribution.empty")}
        />
      ) : (
        <div className="km-dashboard__donut">
          <Doughnut data={chartData} options={options} />
          <div className="km-dashboard__donut-center">
            <div className="km-dashboard__donut-value">{total}</div>
            <div className="km-dashboard__donut-label">
              {t("distribution.center")}
            </div>
          </div>
        </div>
      )}
    </PanelCard>
  );
};

export default MemberDistributionPanel;
