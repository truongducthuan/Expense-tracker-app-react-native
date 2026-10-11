import { StyleSheet, Text, View } from "react-native";

import ProgressBar from "../ui/ProgressBar";
import { GlobalStyles } from "../../constants/styles";
import useMoney from "../../hooks/useMoney";

const { colors, spacing, type } = GlobalStyles;

// Legend row for the category donut: swatch + name, the share as a bar, and
// the amount. This is also the chart's accessibility relief — every slice is
// named and valued in text, so identity never rests on the slice colour alone.
const ListChar = ({ item }) => {
  const { money } = useMoney();
  return (
  <View style={styles.row}>
    <View style={styles.top}>
      <View style={styles.nameWrap}>
        <View style={[styles.swatch, { backgroundColor: item.color }]} />
        <Text style={styles.name} numberOfLines={1}>
          {item.x}
        </Text>
      </View>
      <Text style={styles.amount} numberOfLines={1}>
        {money(item.total)}
      </Text>
    </View>

    <View style={styles.barRow}>
      <ProgressBar
        ratio={item.y / 100}
        color={item.color}
        height={6}
        style={styles.bar}
      />
      {/* `pct` is shared with the donut label so the two always agree. */}
        <Text style={styles.percent}>{item.pct}%</Text>
      </View>
    </View>
  );
};

export default ListChar;

const styles = StyleSheet.create({
  row: {
    paddingVertical: spacing[3] - 2,
    gap: spacing[2] - 2,
  },
  top: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: spacing[2],
  },
  nameWrap: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing[2],
    flex: 1,
    minWidth: 0,
  },
  swatch: {
    width: 11,
    height: 11,
    borderRadius: 3,
    flexShrink: 0,
  },
  name: {
    ...type.bodyEmphasis,
    color: colors.text,
    flexShrink: 1,
  },
  amount: {
    ...type.caption,
    fontWeight: "600",
    color: colors.textBody,
  },
  barRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing[2],
  },
  bar: {
    flex: 1,
  },
  percent: {
    fontSize: 11.5,
    fontWeight: "600",
    color: colors.textMuted,
    minWidth: 34,
    textAlign: "right",
  },
});
