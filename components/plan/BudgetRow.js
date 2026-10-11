import { Pressable, StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";

import CategoryAvatar from "../ui/CategoryAvatar";
import ProgressBar from "../ui/ProgressBar";
import { GlobalStyles, STATUS_COLORS } from "../../constants/styles";
import { budgetMessage } from "../../util/budget";
import useMoney from "../../hooks/useMoney";
import { useLanguage } from "../../store/languageContext";

const { colors, spacing, radius, type } = GlobalStyles;

// Status is carried by an icon + a word as well as the bar colour, so the
// three states stay distinguishable without colour (WCAG 1.4.1).
const STATUS_META = {
  safe: { icon: "checkmark-circle", labelKey: "status_on_track" },
  caution: { icon: "alert-circle", labelKey: "status_caution" },
  nearly: { icon: "warning", labelKey: "status_nearly" },
  over: { icon: "close-circle", labelKey: "status_over" },
};

const BudgetRow = ({ progress, onPress, divided }) => {
  const { money } = useMoney();
  const { t } = useLanguage();

  const meta = STATUS_META[progress.status] || STATUS_META.safe;
  const tint = STATUS_COLORS[progress.status];
  const message = budgetMessage(progress);

  const values = {
    amount: money(message.values.amount),
    days: message.values.days,
    perDay: message.values.perDay ? money(message.values.perDay) : "",
  };

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      android_ripple={{ color: colors.surfaceAlt }}
      style={({ pressed }) => [
        styles.row,
        divided && styles.divided,
        pressed && styles.pressed,
      ]}
    >
      <View style={styles.head}>
        <CategoryAvatar name={progress.category} size={36} />
        <View style={styles.title}>
          <Text style={styles.category} numberOfLines={1}>
            {progress.category}
          </Text>
          <View style={styles.statusRow}>
            <Ionicons name={meta.icon} size={12} color={tint} />
            <Text style={[styles.status, { color: tint }]}>
              {t(meta.labelKey)}
            </Text>
          </View>
        </View>
        <View style={styles.figures}>
          <Text style={styles.spent} numberOfLines={1}>
            {money(progress.spent)}
          </Text>
          <Text style={styles.limit} numberOfLines={1}>
            {t("of_limit")} {money(progress.limit)}
          </Text>
        </View>
      </View>

      <ProgressBar ratio={progress.ratio} status height={8} style={styles.bar} />

      <Text style={styles.message}>{t(message.key, values)}</Text>
    </Pressable>
  );
};

export default BudgetRow;

const styles = StyleSheet.create({
  row: {
    paddingVertical: spacing[3] + 1,
    paddingHorizontal: spacing[4],
    gap: spacing[2],
  },
  divided: {
    borderTopWidth: 1,
    borderTopColor: colors.n100,
  },
  head: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing[3],
  },
  title: {
    flex: 1,
    minWidth: 0,
  },
  category: {
    ...type.bodyEmphasis,
    color: colors.text,
  },
  statusRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
    marginTop: 1,
  },
  status: {
    fontSize: 11.5,
    fontWeight: "600",
  },
  figures: {
    alignItems: "flex-end",
    flexShrink: 0,
    maxWidth: "42%",
  },
  spent: {
    ...type.bodyEmphasis,
    fontWeight: "700",
    color: colors.text,
  },
  limit: {
    fontSize: 11.5,
    color: colors.textMuted,
    marginTop: 1,
  },
  bar: {
    borderRadius: radius.full,
  },
  message: {
    ...type.caption,
    fontSize: 12.5,
    color: colors.textBody,
  },
  pressed: {
    backgroundColor: colors.surfaceAlt,
  },
});
