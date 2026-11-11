import {
  ArcElement,
  BarController,
  BarElement,
  CategoryScale,
  Chart as ChartJS,
  Filler,
  Legend,
  LinearScale,
  LineController,
  LineElement,
  PointElement,
  Tooltip,
} from "chart.js";
import { BRAND, CHART_FONT } from "./brand";

ChartJS.register(
  ArcElement,
  BarController,
  BarElement,
  CategoryScale,
  Filler,
  Legend,
  LinearScale,
  LineController,
  LineElement,
  PointElement,
  Tooltip,
);

ChartJS.defaults.font.family = CHART_FONT;
ChartJS.defaults.color = BRAND.muted;
ChartJS.defaults.maintainAspectRatio = false;
ChartJS.defaults.plugins.tooltip.backgroundColor = "#ffffff";
ChartJS.defaults.plugins.tooltip.titleColor = BRAND.ink;
ChartJS.defaults.plugins.tooltip.bodyColor = BRAND.charcoal;
ChartJS.defaults.plugins.tooltip.borderColor = BRAND.canvas;
ChartJS.defaults.plugins.tooltip.borderWidth = 1;

export { ChartJS };
