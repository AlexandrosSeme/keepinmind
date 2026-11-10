import React from "react";
import Chart from "react-apexcharts";
import type { ApexOptions } from "apexcharts";
import { Users } from "lucide-react";
import { PanelCard } from "@/shared/ui";
import { BRAND, CHART_FONT, CHART_FONT_CONDENSED } from "@/shared/lib/brand";
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
  const options: ApexOptions = {
    chart: { type: "donut", toolbar: { show: false }, fontFamily: CHART_FONT },
    colors: [BRAND.active, BRAND.expiring, BRAND.expired],
    labels,
    legend: {
      position: "bottom",
      fontSize: "11px",
      fontWeight: 700,
      fontFamily: CHART_FONT_CONDENSED,
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
              fontFamily: CHART_FONT_CONDENSED,
              fontWeight: 800,
              color: BRAND.ink,
            },
            total: {
              show: true,
              label: "ΜΕΛΗ",
              fontSize: "0.65rem",
              fontFamily: CHART_FONT_CONDENSED,
              fontWeight: 700,
              color: BRAND.muted,
              formatter: () => String(total),
            },
          },
        },
      },
    },
    stroke: { width: 2, colors: ["#ffffff"] },
    tooltip: { theme: "light", y: { formatter: (val) => `${val} μελη` } },
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
        <Chart
          options={options}
          series={series}
          type="donut"
          height={190}
          width="100%"
        />
      )}
    </PanelCard>
  );
};

export default MemberDistributionPanel;
