import type { ChartOptions, ScriptableContext, TooltipItem } from "chart.js";
import { BRAND, CHART_FONT_CONDENSED } from "@/shared/lib/brand";

/** Shared Chart.js styling for the dashboards. */

export const axisTicks = {
  color: BRAND.muted,
  font: { size: 11, weight: 700, family: CHART_FONT_CONDENSED },
} as const;

export const legendLabels = {
  color: BRAND.charcoal,
  font: { size: 11, weight: 700, family: CHART_FONT_CONDENSED },
  usePointStyle: true,
  pointStyle: "circle",
  boxWidth: 6,
  boxHeight: 6,
  padding: 12,
} as const;

/** Vertical gradient fill for line/area charts (`rgb` like "245, 196, 0"). */
export const verticalGradient =
  (rgb: string, top = 0.35, bottom = 0.02) =>
  (ctx: ScriptableContext<"line">) => {
    const { chart } = ctx;
    const area = chart.chartArea;
    if (!area) return `rgba(${rgb}, ${top})`;
    const gradient = chart.ctx.createLinearGradient(0, area.top, 0, area.bottom);
    gradient.addColorStop(0, `rgba(${rgb}, ${top})`);
    gradient.addColorStop(1, `rgba(${rgb}, ${bottom})`);
    return gradient;
  };

interface CartesianOptions {
  format?: (value: number) => string;
  stacked?: boolean;
  legend?: boolean;
  horizontal?: boolean;
  max?: number;
}

/** Options for bar / line charts with a clean grid and branded ticks. */
export function cartesianOptions<T extends "bar" | "line">({
  format = (v) => String(v),
  stacked = false,
  legend = false,
  horizontal = false,
  max,
}: CartesianOptions = {}): ChartOptions<T> {
  const valueAxis = {
    min: 0,
    max,
    stacked,
    grid: { color: BRAND.canvas },
    border: { display: false },
    ticks: {
      ...axisTicks,
      maxTicksLimit: 5,
      callback: (value: string | number) => format(Number(value)),
    },
  };
  const categoryAxis = {
    stacked,
    grid: { display: false },
    border: { display: false },
    ticks: { ...axisTicks, autoSkip: true, maxRotation: 0 },
  };
  return {
    responsive: true,
    indexAxis: horizontal ? "y" : "x",
    interaction: { mode: "index", intersect: false },
    plugins: {
      legend: {
        display: legend,
        position: "top",
        align: "end",
        labels: legendLabels,
      },
      tooltip: {
        callbacks: {
          label: (ctx: TooltipItem<"bar" | "line">) =>
            ` ${ctx.dataset.label}: ${format(Number(horizontal ? ctx.parsed.x : ctx.parsed.y))}`,
        },
      },
    },
    scales: horizontal
      ? { x: valueAxis, y: categoryAxis }
      : { x: categoryAxis, y: valueAxis },
    // Shared by bar, line and mixed charts; Chart.js validates at runtime.
  } as unknown as ChartOptions<T>;
}

/** Doughnut with the legend on the side (wide) or below (narrow). */
export function doughnutOptions(
  format: (value: number) => string,
  legendPosition: "right" | "bottom" = "right",
): ChartOptions<"doughnut"> {
  return {
    responsive: true,
    cutout: "70%",
    plugins: {
      legend: { position: legendPosition, labels: legendLabels },
      tooltip: {
        callbacks: { label: (ctx) => ` ${ctx.label}: ${format(ctx.parsed)}` },
      },
    },
  };
}
