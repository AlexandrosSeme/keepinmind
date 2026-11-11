import React, { useMemo } from "react";
import { Doughnut } from "react-chartjs-2";
import type { ChartData, Plugin } from "chart.js";
import "@/shared/lib/chartjs";
import { BRAND, CHART_FONT_CONDENSED, CHART_PALETTE } from "@/shared/lib/brand";
import { doughnutOptions } from "../lib/chartOptions";

interface DoughnutChartProps {
  labels: string[];
  values: number[];
  format: (value: number) => string;
  centerValue: string;
  centerLabel: string;
  colors?: readonly string[];
  legend?: "right" | "bottom";
  height?: number;
}

/** Draws the total in the middle of the ring (works with any legend position). */
const centerText = (value: string, label: string): Plugin<"doughnut"> => ({
  id: "kmCenterText",
  afterDraw(chart) {
    const { ctx, chartArea } = chart;
    const x = (chartArea.left + chartArea.right) / 2;
    const y = (chartArea.top + chartArea.bottom) / 2;
    ctx.save();
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillStyle = BRAND.ink;
    ctx.font = `800 20px ${CHART_FONT_CONDENSED}`;
    ctx.fillText(value, x, y - 7);
    ctx.fillStyle = BRAND.muted;
    ctx.font = `700 10px ${CHART_FONT_CONDENSED}`;
    ctx.fillText(label, x, y + 12);
    ctx.restore();
  },
});

/** Doughnut with a centered total; legend on the right by default. */
const DoughnutChart: React.FC<DoughnutChartProps> = ({
  labels,
  values,
  format,
  centerValue,
  centerLabel,
  colors = CHART_PALETTE,
  legend = "right",
  height = 210,
}) => {
  const data: ChartData<"doughnut"> = {
    labels,
    datasets: [
      {
        data: values,
        backgroundColor: labels.map((_, i) => colors[i % colors.length]),
        borderColor: "#ffffff",
        borderWidth: 2,
        hoverOffset: 4,
      },
    ],
  };
  const plugins = useMemo(
    () => [centerText(centerValue, centerLabel)],
    [centerValue, centerLabel],
  );

  return (
    <div style={{ height, position: "relative" }}>
      <Doughnut
        // Remount when the center text changes so the plugin redraws it.
        key={`${centerValue}|${centerLabel}`}
        data={data}
        options={doughnutOptions(format, legend)}
        plugins={plugins}
      />
    </div>
  );
};

export default DoughnutChart;
