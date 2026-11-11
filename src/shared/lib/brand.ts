/** Melos brand palette for JS-driven styling (charts). Mirrors the CSS tokens in app/styles. */
export const BRAND = {
  yellow: "#f5c400",
  yellowStrong: "#d4a800",
  yellowSoft: "#ffe566",
  ink: "#111111",
  charcoal: "#2a2a2a",
  slate: "#5c5c5c",
  muted: "#8a8680",
  canvas: "#e8e5df",
  /** Member / payment semantic tones */
  active: "#1a1a1a",
  expiring: "#f5c400",
  expired: "#8a8680",
  paid: "#111111",
  pending: "#f5c400",
  failed: "#5c5c5c",
  /** Semantic accents (mirror --km-success / --km-info / --km-danger). */
  success: "#1f9d63",
  info: "#2a8bb8",
  danger: "#d63b3b",
} as const;

/** Ordered categorical palette for multi-series charts (doughnuts, stacked bars). */
export const CHART_PALETTE = [
  "#f5c400",
  "#1a1a1a",
  "#2a8bb8",
  "#1f9d63",
  "#d4a800",
  "#8a8680",
  "#d63b3b",
  "#5c5c5c",
] as const;

export const CHART_FONT = "Inter, system-ui, sans-serif";
export const CHART_FONT_CONDENSED = "'Roboto Condensed', Inter, sans-serif";
