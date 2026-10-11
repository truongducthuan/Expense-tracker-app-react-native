import { Pressable, StyleSheet, Text, View } from "react-native";
import { useNavigation } from "@react-navigation/native";

import CategoryAvatar from "../ui/CategoryAvatar";
import { GlobalStyles, CATEGORY_TYPE } from "../../constants";
import { getFormatDate } from "../../util";
import useMoney from "../../hooks/useMoney";
import { useLanguage } from "../../store/languageContext";

const { colors, spacing, type } = GlobalStyles;

// Per-type visual treatment. `sign` is what makes the amount readable without
// colour — an expense is "−", income "+", a transfer is neutral (WCAG 1.4.1).
// `icon` is the vivid hue (a glyph on a tinted tile only needs 3:1); `text` is
// the darker step the amount is drawn in, which must clear 4.5:1.
const TYPE_STYLES = {
  [CATEGORY_TYPE.EXPENSE]: {
    icon: colors.expense,
    text: colors.expenseText,
    surface: colors.expenseSurface,
    sign: "−",
    glyph: null,
  },
  [CATEGORY_TYPE.IMCOME]: {
    icon: colors.income,
    text: colors.incomeText,
    surface: colors.incomeSurface,
    sign: "+",
    glyph: null,
  },
  [CATEGORY_TYPE.TRANSFER]: {
    icon: colors.info,
    text: colors.infoText,
    surface: colors.infoSurface,
    sign: "",
    glyph: "swap-horizontal",
  },
};

const ExpenseItem = ({ desc, amount, date, id, account, category, type }) => {
  const navigation = useNavigation();
  const { t } = useLanguage();
  const { money } = useMoney();

  const variant = TYPE_STYLES[type] || TYPE_STYLES[CATEGORY_TYPE.EXPENSE];
  const isTransfer = type === CATEGORY_TYPE.TRANSFER;
  const title = isTransfer ? t("transfer") : category;
  // For a transfer the two account names are the useful detail; otherwise show
  // which wallet it came from, then the note.
  const subtitle = isTransfer
    ? `${category} → ${account}`
    : [account, desc].filter(Boolean).join(" · ");

  return (
    <Pressable
      onPress={() => navigation.navigate("ManageExpense", { expenseId: id })}
      android_ripple={{ color: colors.surfaceAlt }}
      style={({ pressed }) => [styles.row, pressed && styles.pressed]}
    >
      <CategoryAvatar
        name={category}
        icon={variant.glyph}
        tint={variant.icon}
        background={variant.surface}
      />

      <View style={styles.middle}>
        <Text style={styles.title} numberOfLines={1}>
          {title}
        </Text>
        <Text style={styles.subtitle} numberOfLines={1}>
          {subtitle || getFormatDate(date)}
        </Text>
      </View>

      <View style={styles.right}>
        <Text style={[styles.amount, { color: variant.text }]} numberOfLines={1}>
          {variant.sign}
          {money(amount)}
        </Text>
        <Text style={styles.date} numberOfLines={1}>
          {getFormatDate(date)}
        </Text>
      </View>
    </Pressable>
  );
};

export default ExpenseItem;

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing[3],
    minHeight: 64,
    paddingVertical: spacing[3],
    paddingHorizontal: spacing[4],
    backgroundColor: colors.surface,
  },
  middle: {
    flex: 1,
    minWidth: 0,
  },
  title: {
    ...type.bodyEmphasis,
    color: colors.text,
  },
  subtitle: {
    ...type.caption,
    fontSize: 12.5,
    color: colors.textMuted,
    marginTop: 1,
  },
  right: {
    alignItems: "flex-end",
    flexShrink: 0,
    maxWidth: "42%",
  },
  amount: {
    ...type.bodyEmphasis,
    fontWeight: "700",
  },
  date: {
    fontSize: 11.5,
    color: colors.textMuted,
    marginTop: 1,
  },
  pressed: {
    backgroundColor: colors.surfaceAlt,
  },
});
