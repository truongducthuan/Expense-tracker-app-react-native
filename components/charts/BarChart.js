import { memo } from "react";
import Svg, { G, Line, Rect, Text as SvgText } from "react-native-svg";

import { GlobalStyles } from "../../constants/styles";

const { colors } = GlobalStyles;

// Small bar chart on react-native-svg, in place of VictoryChart/VictoryBar.
// Takes the same `[{ x, y }]` data the Victory version did.
const BarChart = ({
  data,
  width,
  height = 260,
  color = colors.primary,
  padding = { top: 24, right: 12, bottom: 32, left: 12 },
}) => {
  if (!data?.length) return null;

  const plotWidth = width - padding.left - padding.right;
  const plotHeight = height - padding.top - padding.bottom;
  const max = Math.max(...data.map((d) => Number(d.y) || 0), 1);
  const step = plotWidth / data.length;
  const barWidth = Math.max(6, Math.min(36, step * 0.6));

  return (
    <Svg width={width} height={height}>
      <G x={padding.left} y={padding.top}>
        {/* Baseline, so bars of zero still sit on something. */}
        <Line
          x1={0}
          y1={plotHeight}
          x2={plotWidth}
          y2={plotHeight}
          stroke={colors.border}
          strokeWidth={1}
        />
        {data.map((item, index) => {
          const value = Number(item.y) || 0;
          const barHeight = (value / max) * plotHeight;
          const x = index * step + (step - barWidth) / 2;
          const y = plotHeight - barHeight;

          return (
            <G key={`${item.x}-${index}`}>
              <Rect
                x={x}
                y={y}
                width={barWidth}
                height={barHeight}
                rx={4}
                fill={color}
              />
              <SvgText
                x={x + barWidth / 2}
                y={y - 6}
                fill={colors.textBody}
                fontSize={10}
                fontWeight="600"
                textAnchor="middle"
              >
                {String(value)}
              </SvgText>
              <SvgText
                x={x + barWidth / 2}
                y={plotHeight + 16}
                fill={colors.textMuted}
                fontSize={10}
                textAnchor="middle"
              >
                {String(item.x)}
              </SvgText>
            </G>
          );
        })}
      </G>
    </Svg>
  );
};

export default memo(BarChart);
