import { StyleSheet, View } from "react-native";

import { GlobalStyles, STATUS_COLORS, getStatusLevel } from "../../constants/styles";

// Share-of-total / budget bar. Pass `ratio` (0..1); `status` makes the fill
// colour follow the safe→over thresholds instead of the given `color`.
// Callers that use the status colouring must also render the matching text
// label — colour alone never carries the meaning (WCAG 1.4.1).
const ProgressBar = ({ ratio = 0, color, status = false, height = 8, style }) => {
  const clamped = Math.max(0, Math.min(1, Number(ratio) || 0));
  const fill = status
    ? STATUS_COLORS[getStatusLevel(ratio)]
    : color || GlobalStyles.colors.primary;

  return (
    <View style={[styles.track, { height, borderRadius: height }, style]}>
      <View
        style={{
          width: `${clamped * 100}%`,
          height: "100%",
          borderRadius: height,
          backgroundColor: fill,
        }}
      />
    </View>
  );
};

export default ProgressBar;

const styles = StyleSheet.create({
  track: {
    width: "100%",
    backgroundColor: GlobalStyles.colors.surfaceAlt,
    overflow: "hidden",
  },
});
