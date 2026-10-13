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
import { useSync } from "../../store/syncContext";
import { buildAccountBalances } from "../../util/ledger";
import { fetchAccountDB, restoreAccountDB } from "../../util/database";
import ReassignSheet from "../popup/ReassignSheet";
import { findAccountUsage } from "../../util/usage";
import { patchExpense } from "../../api/http";

const { colors, spacing, radius, type } = GlobalStyles;

// Per-wallet balance list: what each account holds after income, spending and
// transfers, then the overall remainder.
//
// The total is the sum of the rows above it. It used to be computed separately
// as Σincome − Σexpense, so when a transaction named an account that wasn't in
// the current list, the rows and the total disagreed.
const TotalTypeIncome = () => {
  const { expenses, updateExpense } = ExpenseStore();
  const { accounts, setAccount } = AccountStore();
  const { t, lang } = useLanguage();
  const { balance } = useMoney();
  const { publish } = useSync();
  const [restoring, setRestoring] = useState(null);
  const [orphan, setOrphan] = useState(null);
  const [busy, setBusy] = useState(false);

  // Puts a name used by transactions back into the account list, then re-reads
  // the list so the row moves up from "unlisted" straight away.
  const handleRestore = async (name) => {
    setRestoring(name);
    setBusy(true);
    try {
      await restoreAccountDB(name);
      setAccount(await fetchAccountDB(lang));
      publish("accounts");
      publish("accounts_removed");
      setOrphan(null);
    } catch (err) {
      console.error(err);
    } finally {
      setRestoring(null);
      setBusy(false);
    }
  };

  // Moves the stranded transactions onto a real wallet. Once none of them name
  // the deleted wallet any more, the row disappears on its own — which is what
  // "I deleted it, why is it still here?" is actually asking for.
  const handleMoveOrphan = async (targetName) => {
    if (!orphan || !targetName) return;

    setBusy(true);
    try {
      for (const hit of findAccountUsage(expenses, orphan.label)) {
        const patch = {};
        for (const field of hit.fields) patch[field] = targetName;
        await patchExpense(hit.id, patch);
        updateExpense(hit.id, patch);
      }
      setOrphan(null);
    } catch (err) {
      console.error(err);
    } finally {
      setBusy(false);
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
            <Pressable
              key={entry.label}
              onPress={() => setOrphan(entry)}
              accessibilityRole="button"
              accessibilityLabel={`${entry.label} — ${t("orphan_row_hint", {
                count: entry.count,
              })}`}
              style={({ pressed }) => [styles.row, pressed && styles.pressed]}
            >
              <View style={styles.unlistedIcon}>
                <Ionicons
                  name="help-circle-outline"
                  size={18}
                  color={colors.textMuted}
                />
              </View>
              <View style={styles.unlistedText}>
                <Text style={styles.name} numberOfLines={1}>
                  {entry.label}
                </Text>
                {/* Says why it is still here, which the bare name never did. */}
                <Text style={styles.unlistedCount} numberOfLines={1}>
                  {t("orphan_row_hint", { count: entry.count })}
                </Text>
              </View>
              <Text style={amountStyle(entry.amount)} numberOfLines={1}>
                {balance(entry.amount)}
              </Text>
              <Ionicons
                name="chevron-forward"
                size={16}
                color={colors.border}
              />
            </Pressable>
          ))}
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
      <ReassignSheet
        visible={!!orphan}
        itemName={orphan?.label ?? ""}
        usageCount={orphan?.count ?? 0}
        options={rows}
        busy={busy}
        title={t("orphan_title", { name: orphan?.label ?? "" })}
        message={t("orphan_message", { count: orphan?.count ?? 0 })}
        primaryLabel={t("move_here")}
        secondaryLabel={t("bring_back_wallet")}
        busyLabel={t("moving_transactions")}
        onCancel={() => setOrphan(null)}
        onReassign={handleMoveOrphan}
        onDeleteOnly={() => handleRestore(orphan.label)}
      />
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
