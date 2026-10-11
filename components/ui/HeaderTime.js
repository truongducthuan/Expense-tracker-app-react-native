import { Pressable, StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";

import { GlobalStyles } from "../../constants/styles";

const { colors, spacing, radius } = GlobalStyles;

// Period stepper in the header. Disabled arrows stay in place but dim instead
// of disappearing, so the control doesn't shift as the user moves through
// periods (Nielsen #4 — consistency).
const HeaderTime = ({
  currTimeValue,
  valueSelect,
  currTimeLabel,
  setCurrTimeValue,
}) => {
  const period = valueSelect.toLowerCase();

  const isPrevDisabled =
    period === "weekly" ||
    ((period === "monthly" || period === "yearly") && currTimeValue <= 1);

  const isNextDisabled = (() => {
    const date = new Date();
    if (period === "weekly") return true;
    if (period === "monthly") return currTimeValue >= date.getMonth() + 1;
    if (period === "yearly") return currTimeValue >= date.getFullYear();
    return false;
  })();

  const step = (delta) => setCurrTimeValue((state) => state + delta);

  return (
    <View style={styles.header}>
      <Pressable
        onPress={() => !isPrevDisabled && step(-1)}
        disabled={isPrevDisabled}
        hitSlop={8}
        accessibilityRole="button"
        accessibilityLabel="Previous period"
        style={({ pressed }) => [
          styles.iconBtn,
          isPrevDisabled && styles.iconBtnDisabled,
          pressed && !isPrevDisabled && styles.pressed,
        ]}
      >
        <Ionicons name="chevron-back" size={18} color={colors.onPrimary} />
      </Pressable>

      <View style={styles.pill}>
        <Text style={styles.label} numberOfLines={1}>
          {currTimeLabel}
          <Text style={styles.sep}> · </Text>
          <Text style={styles.value}>{currTimeValue}</Text>
        </Text>
      </View>

      <Pressable
        onPress={() => !isNextDisabled && step(1)}
        disabled={isNextDisabled}
        hitSlop={8}
        accessibilityRole="button"
        accessibilityLabel="Next period"
        style={({ pressed }) => [
          styles.iconBtn,
          isNextDisabled && styles.iconBtnDisabled,
          pressed && !isNextDisabled && styles.pressed,
        ]}
      >
        <Ionicons name="chevron-forward" size={18} color={colors.onPrimary} />
      </Pressable>
    </View>
  );
};

export default HeaderTime;

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing[1],
  },
  iconBtn: {
    width: 26,
    height: 26,
    borderRadius: radius.full,
    alignItems: "center",
    justifyContent: "center",
  },
  iconBtnDisabled: {
    opacity: 0.25,
  },
  pill: {
    paddingHorizontal: spacing[3],
    paddingVertical: spacing[1] + 1,
    borderRadius: radius.full,
    backgroundColor: "rgba(255,255,255,0.18)",
    minWidth: 76,
    alignItems: "center",
  },
  label: {
    color: colors.primary100,
    fontSize: 14,
    fontWeight: "500",
    textTransform: "capitalize",
  },
  sep: {
    color: "rgba(255,255,255,0.55)",
    fontWeight: "400",
  },
  value: {
    color: colors.onPrimary,
    fontWeight: "700",
  },
  pressed: {
    opacity: 0.6,
  },
});
