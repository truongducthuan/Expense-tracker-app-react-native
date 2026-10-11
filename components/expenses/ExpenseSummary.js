import { useMemo, useState } from "react";
import { Modal, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";

import CategoryAvatar from "../ui/CategoryAvatar";
import { GlobalStyles } from "../../constants/styles";
import useMoney from "../../hooks/useMoney";
import { useLanguage } from "../../store/languageContext";
import { ExpenseStore } from "../../store/context";
import { AccountStore } from "../../store/accountContext";
import { buildAccountBalances } from "../../util/ledger";
import { normalizeName } from "../../util/tools";

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
const ALL = "__all__";

const ExpenseSummary = ({ expenses = [], scopeKey = "this_period" }) => {
  const { t, lang } = useLanguage();
  const { money, balance: fmtBalance } = useMoney();
  const { expenses: allExpenses } = ExpenseStore();
  const { accounts } = AccountStore();
  const [hidden, setHidden] = useState(false);
  const [picking, setPicking] = useState(false);
  const [selected, setSelected] = useState(ALL);

  // Per-wallet balances come from the shared ledger, so this card and the one
  // on the chart screen can never report different numbers for the same wallet.
  const ledger = useMemo(
    () => buildAccountBalances(accounts, allExpenses, lang),
    [accounts, allExpenses, lang]
  );

  const options = useMemo(
    () => [
      { key: ALL, name: t("all_accounts"), amount: ledger.total, icon: "wallet" },
      ...ledger.rows.map((row) => ({ ...row, key: String(row.id) })),
      ...ledger.unlisted.map((row) => ({
        key: `orphan:${row.label}`,
        name: row.label,
        amount: row.amount,
        icon: "help-circle-outline",
      })),
    ],
    [ledger, t]
  );

  const current =
    options.find((option) => option.key === selected) || options[0];
  const isAll = current.key === ALL;

  const balance = current.amount;

  // The period split follows the same selection. Only income and expense rows
  // count — a transfer into a wallet is not income, it is money that was
  // already yours.
  const scopedPeriod = useMemo(() => {
    if (isAll) return expenses;
    const target = normalizeName(current.name);
    return expenses.filter((e) => normalizeName(e.account) === target);
  }, [expenses, isAll, current.name]);

  const income = sumByType(scopedPeriod, "income");
  const expense = sumByType(scopedPeriod, "expense");

  const show = (value) => (hidden ? MASK : money(value));
  // The headline can go negative (spending beyond recorded income), so it
  // uses the sign-carrying formatter rather than the bare one.
  const showBalance = () => (hidden ? MASK : fmtBalance(balance));

  return (
    <View style={styles.card}>
      <View style={styles.topRow}>
        {/* The title doubles as the wallet picker: the headline figure and the
            thing it describes stay in one place. */}
        <Pressable
          onPress={() => setPicking(true)}
          accessibilityRole="button"
          accessibilityState={{ expanded: picking }}
          accessibilityLabel={`${t("total_balance")}: ${current.name}`}
          style={({ pressed }) => [styles.picker, pressed && styles.pressed]}
        >
          <Text style={styles.label} numberOfLines={1}>
            {isAll ? t("total_balance") : current.name}
          </Text>
          <Ionicons name="chevron-down" size={14} color={colors.primary100} />
        </Pressable>
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
      <Text style={styles.scopeNote}>
        {isAll ? t("across_all_accounts") : t("one_account_only")}
      </Text>

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

      <Modal
        visible={picking}
        transparent
        animationType="fade"
        onRequestClose={() => setPicking(false)}
      >
        <View style={styles.overlay}>
          <Pressable
            style={styles.backdrop}
            onPress={() => setPicking(false)}
          />
          <View style={styles.sheet}>
            <View style={styles.sheetHandle} />
            <Text style={styles.sheetTitle}>{t("select_account")}</Text>

            <ScrollView style={styles.sheetList}>
              {options.map((option) => {
                const active = option.key === current.key;
                return (
                  <Pressable
                    key={option.key}
                    onPress={() => {
                      setSelected(option.key);
                      setPicking(false);
                    }}
                    accessibilityRole="radio"
                    accessibilityState={{ selected: active }}
                    style={({ pressed }) => [
                      styles.sheetRow,
                      active && styles.sheetRowActive,
                      pressed && styles.pressed,
                    ]}
                  >
                    <CategoryAvatar
                      name={option.name}
                      icon={option.icon}
                      size={32}
                    />
                    <Text style={styles.sheetName} numberOfLines={1}>
                      {option.name}
                    </Text>
                    {/* Each wallet shows its own balance, so choosing one is an
                        informed pick rather than a guess. */}
                    <Text
                      style={[
                        styles.sheetAmount,
                        option.amount < 0 && { color: colors.expenseText },
                      ]}
                      numberOfLines={1}
                    >
                      {fmtBalance(option.amount)}
                    </Text>
                    {active && (
                      <Ionicons
                        name="checkmark"
                        size={18}
                        color={colors.primary}
                      />
                    )}
                  </Pressable>
                );
              })}
            </ScrollView>
          </View>
        </View>
      </Modal>
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
    flexShrink: 1,
  },
  picker: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing[1] + 2,
    flex: 1,
    minHeight: 30,
    paddingRight: spacing[2],
  },
  overlay: { ...StyleSheet.absoluteFillObject, justifyContent: "flex-end" },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(17,24,39,0.45)",
  },
  sheet: {
    maxHeight: "70%",
    backgroundColor: colors.surface,
    borderTopLeftRadius: radius.lg + 4,
    borderTopRightRadius: radius.lg + 4,
    paddingBottom: spacing[4],
  },
  sheetHandle: {
    alignSelf: "center",
    width: 40,
    height: 4,
    borderRadius: radius.full,
    backgroundColor: colors.border,
    marginTop: spacing[2],
    marginBottom: spacing[3],
  },
  sheetTitle: {
    ...type.h3,
    color: colors.text,
    paddingHorizontal: spacing[4],
    marginBottom: spacing[2],
  },
  sheetList: { paddingHorizontal: spacing[4] },
  sheetRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing[3],
    minHeight: 52,
    paddingHorizontal: spacing[3],
    marginBottom: spacing[2],
    borderRadius: radius.md,
    borderWidth: 1.5,
    borderColor: colors.border,
  },
  sheetRowActive: {
    borderColor: colors.primary,
    backgroundColor: colors.primarySurface,
  },
  sheetName: { flex: 1, minWidth: 0, ...type.body, color: colors.text },
  sheetAmount: {
    ...type.bodyEmphasis,
    fontWeight: "600",
    color: colors.textBody,
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
