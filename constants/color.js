// Categorical chart palette — fixed slot order, never cycled.
//
// Slot 1 is the brand teal so the donut reads as MoneyMind; the remaining hues
// come from a validated categorical set. This exact ordering was checked with
// the palette validator (light surface, adjacent pairlist — pie slices touch):
// lightness band PASS, chroma floor PASS, worst adjacent CVD ΔE 10.7 (protan),
// worst adjacent normal-vision ΔE 19.6. Yellow and magenta sit under 3:1 against
// white, so the chart always ships the legend with visible labels + amounts
// (ListChar) as relief. Do not reorder or extend without re-validating.
export const CHART_SERIES = [
  "#0D9488", // teal   — brand
  "#EB6834", // orange
  "#2A78D6", // blue
  "#EDA100", // yellow
  "#E87BA4", // magenta
  "#008300", // green
  "#4A3AA7", // violet
  "#E34948", // red
];

// Everything past the last slot folds into one "Other" slice rather than
// inventing a 9th hue (see util/chart.js → buildPieData).
export const CHART_OTHER_COLOR = "#9CA3AF";
export const CHART_MAX_SLICES = CHART_SERIES.length;

// Legacy name kept so existing imports keep working.
export const colorsArray = CHART_SERIES;

// Soft card tints for the todo board.
export const bgColors = [
  "#F0FDFA",
  "#FFF7ED",
  "#F0F9FF",
  "#FEF2F2",
  "#F0FDF4",
  "#F5F3FF",
  "#FFFBEB",
  "#ECFEFF",
  "#FDF2F8",
  "#F3F4F6",
];
