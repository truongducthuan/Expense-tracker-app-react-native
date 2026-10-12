import { useLayoutEffect, useMemo, useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";

import Card from "../components/ui/Card";
import PrimaryInput from "../components/ui/PrimaryInput";
import PrimaryButton from "../components/ui/PrimaryButton";
import SegmentedControl from "../components/ui/SegmentedControl";
import CategoryAvatar from "../components/ui/CategoryAvatar";
import { GlobalStyles } from "../constants/styles";
import { CategoryStore } from "../store/categoryContext";
import { BudgetStore } from "../store/budgetContext";
import { ExpenseStore } from "../store/context";
import { useLanguage } from "../store/languageContext";
import { useDialog } from "../store/dialogContext";
import { addBudgetDB, updateBudgetDB, deleteBudgetDB } from "../util/database";
import { formatInput, formatAmount } from "../util/format";
import { expenseCategoryKey } from "../constants/seedNames";
import useMoney from "../hooks/useMoney";

const { colors, spacing, radius, type } = GlobalStyles;

const PERIODS = ["weekly", "monthly", "yearly"];
const THRESHOLDS = [70, 80, 90, 100];

const ManageBudget = ({ route, navigation }) => {
  const budgetId = route.params?.budgetId;
  const isEditing = !!budgetId;

  const { t } = useLanguage();
  const { alert, confirm } = useDialog();
  const { money, symbol } = useMoney();
  const { categories } = CategoryStore();
  const { budgets, addBudget, editBudget, removeBudget } = BudgetStore();
  const { expenses } = ExpenseStore();

  const existing = budgets.find((b) => b.id === budgetId);

  const [category, setCategory] = useState(existing?.category || "");
  const [amount, setAmount] = useState(
    existing ? String(existing.amount) : ""
  );
  const [period, setPeriod] = useState(existing?.period || "monthly");
  const [threshold, setThreshold] = useState(existing?.threshold || 80);

  useLayoutEffect(() => {
    navigation.setOptions({
      title: isEditing ? t("edit_budget") : t("add_budget"),
    });
  }, [navigation, isEditing, t]);

  // Suggest a limit from what this category actually cost over the last three
  // months — recognition rather than recall (Nielsen #6), and a number the
  // user can sanity-check instead of inventing one.
  const suggestion = useMemo(() => {
    if (!category) return 0;
    const since = new Date();
    since.setMonth(since.getMonth() - 3);
    // Same language-independent match the budget itself uses, so the
    // suggestion reflects spending recorded under either label.
    const key = expenseCategoryKey(category);
    const rows = expenses.filter(
      (e) =>
        e.type === "expense" &&
        expenseCategoryKey(e.category) === key &&
        new Date(e.date) >= since
    );
    if (!rows.length) return 0;
    const total = rows.reduce((sum, e) => sum + Number(e.amount || 0), 0);
    const perPeriod =
      period === "weekly" ? total / 13 : period === "yearly" ? total * 4 : total / 3;
    return Math.round(perPeriod);
  }, [category, period, expenses]);

  const numericAmount = Number(String(amount).replace(/\./g, "")) || 0;
  const canSave = !!category && numericAmount > 0;

  const handleSave = async () => {
    if (!canSave) return;

    // One budget per category+period; the DB has a UNIQUE constraint but
    // catching it here lets us say something useful instead of a raw error.
    const clash = budgets.find(
      (b) =>
        expenseCategoryKey(b.category) === expenseCategoryKey(category) &&
        b.period === period &&
        b.id !== budgetId
    );
    if (clash) {
      alert({
        title: t("invalid_input"),
        message: t("budget_category_taken"),
        tone: "warning",
      });
      return;
    }

    try {
      if (isEditing) {
        await updateBudgetDB(budgetId, category, numericAmount, period, threshold);
        editBudget(
          { category, amount: numericAmount, period, threshold },
          budgetId
        );
      } else {
        const id = await addBudgetDB(category, numericAmount, period, threshold);
        addBudget({ id, category, amount: numericAmount, period, threshold });
      }
      navigation.goBack();
    } catch (err) {
      console.error(err);
      alert({ title: t("error_occurred"), message: t("could_not_save"), tone: "warning" });
    }
  };

  const handleDelete = async () => {
    const ok = await confirm({
      title: t("delete_budget"),
      message: t("delete_budget_confirm"),
      confirmLabel: t("delete"),
      destructive: true,
    });
    if (!ok) return;
    try {
      await deleteBudgetDB(budgetId);
      removeBudget(budgetId);
      navigation.goBack();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.root}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <ScrollView
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.section}>
          <Text style={styles.label}>{t("category")}</Text>
          <View style={styles.grid}>
            {categories.map((item) => {
              const active = category === item.name;
              return (
                <Pressable
                  key={item.id}
                  onPress={() => setCategory(item.name)}
                  accessibilityRole="button"
                  accessibilityState={{ selected: active }}
                  style={({ pressed }) => [
                    styles.tile,
                    active && styles.tileActive,
                    pressed && styles.pressed,
                  ]}
                >
                  <CategoryAvatar name={item.name} icon={item.icon} size={34} />
                  <Text
                    style={[styles.tileText, active && styles.tileTextActive]}
                    numberOfLines={2}
                  >
                    {item.name}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </View>

        <Card style={styles.amountCard}>
          <Text style={styles.label}>{t("budget_limit")}</Text>
          <View style={styles.amountRow}>
            <PrimaryInput
              bare
              value={formatAmount(amount)}
              placeholder="0"
              inputStyle={styles.amountInput}
              style={styles.amountField}
              textInputConfig={{
                keyboardType: "decimal-pad",
                onChangeText: (e) => setAmount(formatInput(e)),
              }}
            />
            <Text style={styles.currency}>{symbol}</Text>
          </View>

          {suggestion > 0 && (
            <Pressable
              onPress={() => setAmount(formatInput(String(suggestion)))}
              style={({ pressed }) => [styles.hint, pressed && styles.pressed]}
            >
              <Text style={styles.hintText}>
                💡 {money(suggestion)} — {t("spent")} ({t(period)})
              </Text>
            </Pressable>
          )}
        </Card>

        <View style={styles.section}>
          <Text style={styles.label}>{t("budget_period")}</Text>
          <SegmentedControl
            options={PERIODS.map((p) => ({ value: p, label: t(p) }))}
            value={period}
            onChange={setPeriod}
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>{t("budget_alert_at")}</Text>
          <SegmentedControl
            options={THRESHOLDS.map((v) => ({ value: v, label: `${v}%` }))}
            value={threshold}
            onChange={setThreshold}
          />
        </View>

        {isEditing && (
          <PrimaryButton
            mode="dangerGhost"
            icon="trash-outline"
            onPress={handleDelete}
          >
            {t("delete_budget")}
          </PrimaryButton>
        )}
      </ScrollView>

      <View style={styles.actionBar}>
        <PrimaryButton
          style={styles.actionSecondary}
          mode="secondary"
          onPress={() => navigation.goBack()}
        >
          {t("cancel")}
        </PrimaryButton>
        <PrimaryButton
          style={styles.actionPrimary}
          onPress={handleSave}
          disabled={!canSave}
        >
          {t("save")}
        </PrimaryButton>
      </View>
    </KeyboardAvoidingView>
  );
};

export default ManageBudget;

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.screen },
  content: {
    padding: spacing[4],
    paddingBottom: spacing[5],
    gap: spacing[4],
  },
  section: { gap: spacing[2] },
  label: { ...type.label, color: colors.textMuted },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing[2],
  },
  tile: {
    width: "31%",
    minHeight: 86,
    alignItems: "center",
    justifyContent: "center",
    gap: spacing[1] + 2,
    paddingVertical: spacing[2],
    paddingHorizontal: spacing[1],
    borderRadius: radius.md,
    borderWidth: 1.5,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  tileActive: {
    borderColor: colors.primary,
    backgroundColor: colors.primarySurface,
  },
  tileText: {
    fontSize: 11.5,
    fontWeight: "500",
    color: colors.textBody,
    textAlign: "center",
  },
  tileTextActive: { color: colors.primary, fontWeight: "600" },
  amountCard: { gap: spacing[1] },
  amountRow: { flexDirection: "row", alignItems: "center", gap: spacing[2] },
  amountField: { flex: 1, marginVertical: 0 },
  amountInput: { ...type.display, fontSize: 32, color: colors.text },
  currency: { ...type.h2, fontWeight: "700", color: colors.text },
  hint: {
    marginTop: spacing[2],
    backgroundColor: colors.primarySurface,
    borderRadius: radius.sm,
    paddingVertical: spacing[2],
    paddingHorizontal: spacing[3],
  },
  hintText: { fontSize: 12.5, color: colors.primary, fontWeight: "500" },
  actionBar: {
    flexDirection: "row",
    gap: spacing[3],
    paddingHorizontal: spacing[4],
    paddingTop: spacing[3],
    paddingBottom: spacing[4],
    backgroundColor: colors.surface,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  actionSecondary: { flex: 1 },
  actionPrimary: { flex: 1.4 },
  pressed: { opacity: 0.7 },
});
