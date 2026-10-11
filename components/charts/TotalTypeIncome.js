import { useMemo, useState } from "react";
import { Pressable, View, Text, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";

import Card from "../ui/Card";
import CategoryAvatar from "../ui/CategoryAvatar";
import { GlobalStyles } from "../../constants/styles";
import useMoney from "../../hooks/useMoney";
import { AccountStore } from "../../store/accountContext";
import { ExpenseStore } from "../../store/context";
import { useLanguage } from "../../store/languageContext";
import { buildAccountBalances } from "../../util/ledger";
import { fetchAccountDB, restoreAccountDB } from "../../util/database";

const { colors, spacing, radius, type } = GlobalStyles;

// Per-wallet balance list: what each account holds after income, spending and
// transfers, then the overall remainder.
//
// The total is the sum of the rows above it. It used to be computed separately
// as Σincome − Σexpense, so when a transaction named an account that wasn't in
// the current list, the rows and the total disagreed.
const TotalTypeIncome = () => {
  const { expenses } = ExpenseStore();
  const { accounts, setAccount } = AccountStore();
  const { t, lang } = useLanguage();
  const { balance } = useMoney();
  const [restoring, setRestoring] = useState(null);

  // Puts a name used by transactions back into the account list, then re-reads
  // the list so the row moves up from "unlisted" straight away.
  const handleRestore = async (name) => {
    setRestoring(name);
    try {
      await restoreAccountDB(name);
      setAccount(await fetchAccountDB(lang));
    } catch (err) {
      console.error(err);
    } finally {
      setRestoring(null);
    }
  };

  const { rows, unlisted, total } = useMemo(
    () => buildAccountBalances(accounts, expenses, lang),
    [accounts, expenses, lang]
  );

  const amountStyle = (value) => [
    styles.amount,
    { color: value < 0 ? colors.expenseText : colors.textBody },
  ];

  return (
    <Card style={styles.card} padded={false}>
      <Text style={styles.heading}>{t("balance")}</Text>

      {rows.map((item, index) => (
        <View
          key={item.id ?? item.name}
          style={[styles.row, index > 0 && styles.rowDivided]}
        >
          <CategoryAvatar name={item.name} icon={item.icon} size={32} />
          <Text style={styles.name} numberOfLines={1}>
            {item.name}
          </Text>
          <Text style={amountStyle(item.amount)} numberOfLines={1}>
            {balance(item.amount)}
          </Text>
        </View>
      ))}

      {/* Account names used by transactions that the list no longer contains —
          either a wallet recorded in the other language, or one that was
          deleted while its transactions kept referencing it by name. Shown
          rather than dropped, so the rows always account for the total, and
          each one can be put back without retyping it. */}
      {unlisted.length > 0 && (
        <View style={styles.unlistedBlock}>
          <Text style={styles.unlistedHeading}>{t("unlisted_accounts")}</Text>

          {unlisted.map((entry) => (
            <View key={entry.label} style={styles.row}>
              <View style={styles.unlistedIcon}>
                <Ionicons
                  name="help-circle-outline"
                  size={18}
                  color={colors.textMuted}
                />
              </View>
              <Text style={styles.name} numberOfLines={1}>
                {entry.label}
              </Text>
              <Text style={amountStyle(entry.amount)} numberOfLines={1}>
                {balance(entry.amount)}
              </Text>
              <Pressable
                onPress={() => handleRestore(entry.label)}
                disabled={restoring === entry.label}
                accessibilityRole="button"
                accessibilityLabel={`${t("restore_account")} ${entry.label}`}
                style={({ pressed }) => [
                  styles.restoreButton,
                  pressed && styles.pressed,
                ]}
              >
                <Ionicons name="add" size={15} color={colors.primary} />
                <Text style={styles.restoreLabel}>{t("restore_account")}</Text>
              </Pressable>
            </View>
          ))}

          <Text style={styles.unlistedHint}>{t("unlisted_accounts_hint")}</Text>
        </View>
      )}

      <View style={styles.totalRow}>
        <Text style={styles.totalLabel}>{t("total")}</Text>
        <Text
          style={[
            styles.totalAmount,
            { color: total < 0 ? colors.expenseText : colors.primary },
          ]}
          numberOfLines={1}
        >
          {balance(total)}
        </Text>
      </View>
    </Card>
  );
};

export default TotalTypeIncome;

const styles = StyleSheet.create({
  card: {
    paddingTop: spacing[4],
  },
  heading: {
    ...type.label,
    color: colors.textMuted,
    paddingHorizontal: spacing[4],
    marginBottom: spacing[2],
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing[3],
    minHeight: 52,
    paddingHorizontal: spacing[4],
    paddingVertical: spacing[2],
  },
  rowDivided: {
    borderTopWidth: 1,
    borderTopColor: colors.n100,
  },
  name: {
    ...type.body,
    color: colors.text,
    flex: 1,
    minWidth: 0,
  },
  amount: {
    ...type.bodyEmphasis,
    fontWeight: "600",
  },
  unlistedIcon: {
    width: 32,
    height: 32,
    borderRadius: radius.md,
    backgroundColor: colors.surfaceAlt,
    alignItems: "center",
    justifyContent: "center",
  },
  unlistedBlock: {
    borderTopWidth: 1,
    borderTopColor: colors.n100,
    paddingTop: spacing[2],
    backgroundColor: colors.surfaceAlt,
  },
  unlistedHeading: {
    ...type.label,
    fontSize: 10,
    color: colors.textMuted,
    paddingHorizontal: spacing[4],
    marginBottom: spacing[1],
  },
  unlistedHint: {
    ...type.caption,
    fontSize: 11.5,
    color: colors.textMuted,
    paddingHorizontal: spacing[4],
    paddingBottom: spacing[3],
  },
  restoreButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 2,
    minHeight: 32,
    paddingHorizontal: spacing[2],
    borderRadius: radius.full,
    borderWidth: 1,
    borderColor: colors.primary,
  },
  restoreLabel: {
    fontSize: 12,
    fontWeight: "600",
    color: colors.primary,
  },
  pressed: {
    opacity: 0.6,
  },
  totalRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: spacing[3],
    paddingHorizontal: spacing[4],
    paddingVertical: spacing[3],
    backgroundColor: colors.primarySurface,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  totalLabel: {
    ...type.label,
    color: colors.primary,
  },
  totalAmount: {
    ...type.h3,
    fontWeight: "700",
  },
});
