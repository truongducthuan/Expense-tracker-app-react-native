import { memo } from "react";
import Svg, { G, Line, Path, Text as SvgText } from "react-native-svg";

import { GlobalStyles } from "../../constants/styles";

const { colors } = GlobalStyles;

// Donut drawn straight onto react-native-svg.
//
// This replaces VictoryPie. Victory's current major needs Skia, and its older
// one is unmaintained against the New Architecture — but the slices were never
// Victory's to compute anyway: util/chart.js already hands over each slice's
// share and its display percentage, so all that was left was the geometry.
//
// It also removes the two bugs the old chart kept reintroducing: the animation
// that interpolated between datums and left labels showing a previous period's
// value, and the web <line> indicator that crashed on native.

const TAU = Math.PI * 2;

// SVG arcs start at 3 o'clock; a donut that starts anywhere but the top reads
// as tilted, so every angle is rotated back by a quarter turn.
const pointOn = (radius, angle) => ({
  x: radius * Math.cos(angle - Math.PI / 2),
  y: radius * Math.sin(angle - Math.PI / 2),
});

const arcPath = (from, to, outer, inner) => {
  const sweep = to - from;
  // A single slice holding everything would collapse into a zero-length arc,
  // because its start and end points are the same. Split it in two halves.
  if (sweep >= TAU - 0.0001) {
    const half = from + Math.PI;
    return `${arcPath(from, half, outer, inner)} ${arcPath(half, from + TAU, outer, inner)}`;
  }

  const o1 = pointOn(outer, from);
  const o2 = pointOn(outer, to);
  const i1 = pointOn(inner, to);
  const i2 = pointOn(inner, from);
  const large = sweep > Math.PI ? 1 : 0;

  return [
    `M ${o1.x} ${o1.y}`,
    `A ${outer} ${outer} 0 ${large} 1 ${o2.x} ${o2.y}`,
    `L ${i1.x} ${i1.y}`,
    `A ${inner} ${inner} 0 ${large} 0 ${i2.x} ${i2.y}`,
    "Z",
  ].join(" ");
};

const DonutChart = ({
  data,
  size,
  // Room for the labels that sit outside the ring.
  labelGutter = 34,
  // Slices thinner than this hide their label and leader line: at that size
  // adjacent labels overlap and become unreadable. They stay in the legend,
  // which is the list that has room for every slice (WCAG 1.4.1 — the chart is
  // never the only place a figure appears).
  labelThreshold = 4,
}) => {
  const total = data.reduce((sum, slice) => sum + (Number(slice.y) || 0), 0);
  if (!total) return null;

  const outer = size / 2 - labelGutter;
  const inner = outer * 0.42;
  const labelRadius = outer + 18;

  let cursor = 0;

  return (
    <Svg width={size} height={size} accessible={false}>
      <G x={size / 2} y={size / 2}>
        {data.map((slice) => {
          const share = (Number(slice.y) || 0) / total;
          const from = cursor * TAU;
          const to = (cursor + share) * TAU;
          cursor += share;

          const mid = (from + to) / 2;
          const at = pointOn(labelRadius, mid);
          const lineFrom = pointOn(outer + 4, mid);
          const lineTo = pointOn(outer + 12, mid);
          const labelled = slice.y >= labelThreshold;

          return (
            <G key={slice.key}>
              <Path
                d={arcPath(from, to, outer, inner)}
                fill={slice.color}
                stroke={colors.surface}
                strokeWidth={2}
              />
              {labelled && (
                <>
                  <Line
                    x1={lineFrom.x}
                    y1={lineFrom.y}
                    x2={lineTo.x}
                    y2={lineTo.y}
                    stroke={colors.border}
                    strokeWidth={1}
                  />
                  {/* `pct` is the integer the legend prints. Rounding here a
                      second time is what made the donut and the list disagree. */}
                  <SvgText
                    x={at.x}
                    y={at.y}
                    fill={colors.textBody}
                    fontSize={11}
                    fontWeight="600"
                    textAnchor={
                      Math.abs(at.x) < 12 ? "middle" : at.x > 0 ? "start" : "end"
                    }
                    alignmentBaseline="middle"
                  >
                    {`${slice.pct}%`}
                  </SvgText>
                </>
              )}
            </G>
          );
        })}
      </G>
    </Svg>
  );
};

export default memo(DonutChart);
