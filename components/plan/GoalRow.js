import { Pressable, StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";

import ProgressBar from "../ui/ProgressBar";
import { GlobalStyles } from "../../constants/styles";
import useMoney from "../../hooks/useMoney";
import { useLanguage } from "../../store/languageContext";

const { colors, spacing, radius, type } = GlobalStyles;

const formatMonthYear = (date, lang) =>
  `${String(date.getMonth() + 1).padStart(2, "0")}/${date.getFullYear()}`;

// A savings goal: how full it is, and — the part the report asks for — when it
// lands if the current pace holds, which turns an abstract number into a date.
const GoalRow = ({ progress, onPress, onAddMoney, divided }) => {
  const { money } = useMoney();
  const { t, lang } = useLanguage();

  const subtitle = () => {
    if (progress.complete) return t("goal_complete");
    if (progress.projected) {
      return t("goal_projected", {
        date: formatMonthYear(progress.projected, lang),
      });
    }
    if (progress.saved > 0) {
      return t("goal_almost", { amount: money(progress.remaining) });
    }
    // An empty linked goal is filled by moving money into its wallet, not by
    // a manual top-up, so it must not say "add some money".
    return progress.linked
      ? t("goal_linked_empty", { name: progress.account })
      : t("goal_no_pace");
  };

  return (
    <View style={[styles.row, divided && styles.divided]}>
      <Pressable
        onPress={onPress}
        accessibilityRole="button"
        style={({ pressed }) => [styles.main, pressed && styles.pressed]}
      >
        <View style={styles.head}>
          <View style={styles.icon}>
            <Ionicons
              name={progress.complete ? "trophy" : "flag"}
              size={18}
              color={progress.complete ? colors.income : colors.primary}
            />
          </View>
          <View style={styles.title}>
            <Text style={styles.name} numberOfLines={1}>
              {progress.name}
            </Text>
            <Text style={styles.amounts} numberOfLines={1}>
              {t("goal_saved_of", {
                saved: money(progress.saved),
                target: money(progress.target),
              })}
            </Text>
          </View>
          <Text style={styles.percent}>{progress.percent}%</Text>
        </View>

        {/* A linked goal reads straight off its wallet, so the user knows the
            number is not something they have to keep updating by hand. */}
        {progress.linked && (
          <View style={styles.linkRow}>
            <Ionicons name="link" size={12} color={colors.primary} />
            <Text style={styles.linkText} numberOfLines={1}>
              {t("goal_tracks_account", { name: progress.account })}
            </Text>
          </View>
        )}

        <ProgressBar
          ratio={progress.ratio}
          color={progress.complete ? colors.income : colors.primary}
          height={8}
          style={styles.bar}
        />

        <Text style={styles.subtitle}>{subtitle()}</Text>
      </Pressable>

      {!progress.complete && !progress.linked && (
        <Pressable
          onPress={onAddMoney}
          accessibilityRole="button"
          style={({ pressed }) => [styles.addButton, pressed && styles.pressed]}
        >
          <Ionicons name="add" size={16} color={colors.primary} />
          <Text style={styles.addLabel}>{t("add_money")}</Text>
        </Pressable>
      )}
    </View>
  );
};

export default GoalRow;

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
  main: {
    gap: spacing[2],
  },
  head: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing[3],
  },
  linkRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  linkText: {
    fontSize: 11.5,
    color: colors.primary,
    flexShrink: 1,
  },
  icon: {
    width: 36,
    height: 36,
    borderRadius: radius.md,
    backgroundColor: colors.primarySurface,
    alignItems: "center",
    justifyContent: "center",
  },
  title: {
    flex: 1,
    minWidth: 0,
  },
  name: {
    ...type.bodyEmphasis,
    color: colors.text,
  },
  amounts: {
    fontSize: 12,
    color: colors.textMuted,
    marginTop: 1,
  },
  percent: {
    ...type.bodyEmphasis,
    fontWeight: "700",
    color: colors.primary,
  },
  bar: {
    borderRadius: radius.full,
  },
  subtitle: {
    ...type.caption,
    fontSize: 12.5,
    color: colors.textBody,
  },
  addButton: {
    alignSelf: "flex-start",
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    minHeight: 36,
    paddingVertical: spacing[2] - 2,
    paddingHorizontal: spacing[3],
    borderRadius: radius.full,
    borderWidth: 1,
    borderColor: colors.primary,
  },
  addLabel: {
    fontSize: 13,
    fontWeight: "600",
    color: colors.primary,
  },
  pressed: {
    opacity: 0.7,
  },
});
