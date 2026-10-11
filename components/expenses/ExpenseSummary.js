import { useMemo, useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";

import { GlobalStyles } from "../../constants/styles";
import useMoney from "../../hooks/useMoney";
import { useLanguage } from "../../store/languageContext";
import { ExpenseStore } from "../../store/context";

const { colors, spacing, radius, type } = GlobalStyles;

const MASK = "• • • • • •";

const sumByType = (rows, type) =>
  rows
    .filter((e) => e.type === type)
    .reduce((acc, e) => acc + Number(e.amount || 0), 0);

// Balance card — the first thing on the transactions screen.
//
// Two different scopes live here on purpose:
//   • the headline is the BALANCE: what is left across every account, over all
//     time. A balance is a stock, not a flow, so it ignores the period filter —
//     it used to be the selected period's income minus expense, which went
//     negative on any week without income.
//   • the split below is the selected period's income and expense.
//
// Transfers are left out of the headline: a transfer credits one account and
// debits another (see TotalTypeIncome), so across all accounts it nets to zero.
//
// The eye toggle hides every figure in one tap: users asked not to have their
// balance on screen in public (Insight D — privacy before trust).
// `scopeKey` names what the income/expense split covers; the caller knows
// whether it passed a filtered period or the whole history.
const ExpenseSummary = ({ expenses = [], scopeKey = "this_period" }) => {
  const { t } = useLanguage();
  const { money, balance: fmtBalance } = useMoney();
  const { expenses: allExpenses } = ExpenseStore();
  const [hidden, setHidden] = useState(false);

  const income = sumByType(expenses, "income");
  const expense = sumByType(expenses, "expense");

  const balance = useMemo(
    () =>
      sumByType(allExpenses, "income") - sumByType(allExpenses, "expense"),
    [allExpenses]
  );

  const show = (value) => (hidden ? MASK : money(value));
  // The headline can go negative (spending beyond recorded income), so it
  // uses the sign-carrying formatter rather than the bare one.
  const showBalance = () => (hidden ? MASK : fmtBalance(balance));

  return (
    <View style={styles.card}>
      <View style={styles.topRow}>
        <Text style={styles.label}>{t("total_balance")}</Text>
        <Pressable
          onPress={() => setHidden((prev) => !prev)}
          hitSlop={10}
          accessibilityRole="button"
          accessibilityLabel={hidden ? t("show_balance") : t("hide_balance")}
          style={({ pressed }) => [styles.eye, pressed && styles.pressed]}
        >
          <Ionicons
            name={hidden ? "eye-off-outline" : "eye-outline"}
            size={17}
            color={colors.onPrimary}
          />
        </Pressable>
      </View>

      <Text style={styles.amount} numberOfLines={1} adjustsFontSizeToFit>
        {showBalance()}
      </Text>
      <Text style={styles.scopeNote}>{t("across_all_accounts")}</Text>

      {/* These two are the selected period, not the all-time balance above —
          the caption says so, since the figures sit in the same card. */}
      <Text style={styles.splitScope}>{t(scopeKey)}</Text>

      <View style={styles.split}>
        <View style={styles.splitItem}>
          <View style={styles.splitHead}>
            <Ionicons name="arrow-down" size={13} color={colors.primary100} />
            <Text style={styles.splitLabel}>{t("total_income")}</Text>
          </View>
          <Text style={styles.splitValue} numberOfLines={1}>
            {show(income)}
          </Text>
        </View>

        <View style={styles.divider} />

        <View style={styles.splitItem}>
          <View style={styles.splitHead}>
            <Ionicons name="arrow-up" size={13} color={colors.primary100} />
            <Text style={styles.splitLabel}>{t("total_expense")}</Text>
          </View>
          <Text style={styles.splitValue} numberOfLines={1}>
            {show(expense)}
          </Text>
        </View>
      </View>
    </View>
  );
};

export default ExpenseSummary;

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.primary,
    borderRadius: radius.lg,
    padding: spacing[4],
    ...GlobalStyles.shadow.md,
  },
  topRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  label: {
    ...type.label,
    color: colors.primary100,
  },
  eye: {
    width: 30,
    height: 30,
    borderRadius: radius.full,
    backgroundColor: "rgba(255,255,255,0.18)",
    alignItems: "center",
    justifyContent: "center",
  },
  amount: {
    ...type.h1,
    color: colors.onPrimary,
    marginTop: spacing[1] + 1,
    letterSpacing: -0.5,
  },
  scopeNote: {
    fontSize: 11.5,
    color: colors.primary100,
    marginTop: 1,
  },
  splitScope: {
    ...type.label,
    fontSize: 10,
    color: "rgba(255,255,255,0.72)",
    marginTop: spacing[3],
  },
  split: {
    flexDirection: "row",
    alignItems: "stretch",
    marginTop: spacing[2],
    paddingTop: spacing[2],
    borderTopWidth: 1,
    borderTopColor: "rgba(255,255,255,0.22)",
  },
  splitItem: {
    flex: 1,
  },
  splitHead: {
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
  },
  splitLabel: {
    fontSize: 11.5,
    color: colors.primary100,
  },
  splitValue: {
    ...type.bodyEmphasis,
    fontWeight: "600",
    color: colors.onPrimary,
    marginTop: 2,
  },
  divider: {
    width: 1,
    backgroundColor: "rgba(255,255,255,0.22)",
    marginHorizontal: spacing[3],
  },
  pressed: {
    opacity: 0.7,
  },
});
