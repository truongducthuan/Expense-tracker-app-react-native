import { Pressable, StyleSheet, Text, View } from "react-native";

import { GlobalStyles } from "../../constants/styles";

const { colors, spacing, radius } = GlobalStyles;

// iOS-style segmented control used for the period filter and the
// expense/income/transfer switch. The selected segment is a raised white pill
// on a neutral track, so the active state reads without relying on colour.
//
// `options`: [{ value, label, color? }] — `color` tints the active pill for
// type-coloured switches (expense red / income green / transfer blue).
const SegmentedControl = ({ options, value, onChange, style, compact }) => (
  <View style={[styles.track, style]}>
    {options.map((option) => {
      const active = option.value === value;
      const activeTint = active && option.color ? option.color : null;

      return (
        <Pressable
          key={option.value}
          onPress={() => onChange(option.value)}
          accessibilityRole="tab"
          accessibilityState={{ selected: active }}
          style={({ pressed }) => [
            styles.segment,
            compact && styles.segmentCompact,
            active && styles.segmentActive,
            activeTint && { backgroundColor: activeTint },
            pressed && styles.pressed,
          ]}
        >
          <Text
            numberOfLines={1}
            style={[
              styles.label,
              active && styles.labelActive,
              activeTint && styles.labelOnTint,
            ]}
          >
            {option.label}
          </Text>
        </Pressable>
      );
    })}
  </View>
);

export default SegmentedControl;

const styles = StyleSheet.create({
  track: {
    flexDirection: "row",
    backgroundColor: colors.surfaceAlt,
    borderRadius: radius.md,
    padding: 3,
    gap: 3,
  },
  segment: {
    flex: 1,
    paddingVertical: 9,
    paddingHorizontal: spacing[1],
    borderRadius: radius.sm + 1,
    alignItems: "center",
    justifyContent: "center",
  },
  segmentCompact: {
    paddingVertical: 7,
  },
  segmentActive: {
    backgroundColor: colors.surface,
    ...GlobalStyles.shadow.sm,
  },
  label: {
    fontSize: 13,
    fontWeight: "600",
    color: colors.textMuted,
  },
  labelActive: {
    color: colors.text,
  },
  labelOnTint: {
    color: colors.onPrimary,
  },
  pressed: {
    opacity: 0.7,
  },
});
