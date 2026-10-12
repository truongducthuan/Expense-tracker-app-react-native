import { useCallback, useMemo, useState } from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { useFocusEffect, useNavigation } from "@react-navigation/native";

import Card from "../components/ui/Card";
import SegmentedControl from "../components/ui/SegmentedControl";
import EmptyState from "../components/ui/EmptyState";
import ProgressBar from "../components/ui/ProgressBar";
import PrimaryButton from "../components/ui/PrimaryButton";
import BudgetRow from "../components/plan/BudgetRow";
import GoalRow from "../components/plan/GoalRow";
import { GlobalStyles } from "../constants/styles";
import { ExpenseStore } from "../store/context";
import { BudgetStore } from "../store/budgetContext";
import { GoalStore } from "../store/goalContext";
import { useLanguage } from "../store/languageContext";
import { fetchBudgetsDB, fetchGoalsDB } from "../util/database";
import { computeBudgetProgress, computeGoalProgress } from "../util/budget";
import { buildAccountBalances } from "../util/ledger";
import { AccountStore } from "../store/accountContext";
import { normalizeName } from "../util/tools";
import useMoney from "../hooks/useMoney";

const { colors, spacing, type } = GlobalStyles;

const Plan = () => {
  const navigation = useNavigation();
  const { t, lang } = useLanguage();
  const { money } = useMoney();
  const { expenses } = ExpenseStore();
  const { budgets, setBudgets } = BudgetStore();
  const { goals, setGoals } = GoalStore();
  const { accounts } = AccountStore();

  const [tab, setTab] = useState("budgets");

  // Re-read on focus so returning from the create/edit screens shows the
  // change without a manual refresh.
  useFocusEffect(
    useCallback(() => {
      let active = true;
      (async () => {
        try {
          const [b, g] = await Promise.all([fetchBudgetsDB(), fetchGoalsDB()]);
          if (!active) return;
          setBudgets(b);
          setGoals(g);
        } catch (err) {
          console.error(err);
        }
      })();
      return () => {
        active = false;
      };
    }, [])
  );

  const budgetProgress = useMemo(
    () => budgets.map((b) => computeBudgetProgress(b, expenses)),
    [budgets, expenses]
  );

  // Wallet balances for goals that track one. Built once and looked up by
  // normalised name, so a goal keeps working if the wallet is renamed in the
  // other language.
  const walletBalances = useMemo(() => {
    const { rows, unlisted } = buildAccountBalances(accounts, expenses, lang);
    const map = new Map();
    for (const row of [...rows, ...unlisted.map((u) => ({ name: u.label, amount: u.amount }))]) {
      map.set(normalizeName(row.name), row.amount);
    }
    return map;
  }, [accounts, expenses, lang]);

  const goalProgress = useMemo(
    () =>
      goals.map((g) =>
        computeGoalProgress(
          g,
          new Date(),
          g.account ? walletBalances.get(normalizeName(g.account)) ?? 0 : undefined
        )
      ),
    [goals, walletBalances]
  );

  const totals = useMemo(() => {
    const limit = budgetProgress.reduce((sum, b) => sum + b.limit, 0);
    const spent = budgetProgress.reduce((sum, b) => sum + b.spent, 0);
    return { limit, spent, ratio: limit > 0 ? spent / limit : 0 };
  }, [budgetProgress]);

  const options = [
    { value: "budgets", label: t("budgets") },
    { value: "goals", label: t("goals") },
  ];

  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      <SegmentedControl options={options} value={tab} onChange={setTab} />

      {tab === "budgets" ? (
        <>
          {budgetProgress.length > 0 && (
            <Card style={styles.totalCard}>
              <Text style={styles.totalLabel}>{t("total_budget")}</Text>
              <View style={styles.totalRow}>
                <Text style={styles.totalSpent}>{money(totals.spent)}</Text>
                <Text style={styles.totalLimit}>
                  {t("of_limit")} {money(totals.limit)}
                </Text>
              </View>
              <ProgressBar ratio={totals.ratio} status height={8} />
            </Card>
          )}

          {budgetProgress.length ? (
            <Card padded={false}>
              {budgetProgress.map((progress, index) => (
                <BudgetRow
                  key={progress.id}
                  progress={progress}
                  divided={index > 0}
                  onPress={() =>
                    navigation.navigate("ManageBudget", { budgetId: progress.id })
                  }
                />
              ))}
            </Card>
          ) : (
            <EmptyState
              icon="pie-chart-outline"
              title={t("no_budgets")}
              message={t("no_budgets_hint")}
              actionLabel={t("add_budget")}
              onAction={() => navigation.navigate("ManageBudget")}
            />
          )}

          {budgetProgress.length > 0 && (
            <PrimaryButton
              mode="secondary"
              icon="add"
              onPress={() => navigation.navigate("ManageBudget")}
            >
              {t("add_budget")}
            </PrimaryButton>
          )}
        </>
      ) : (
        <>
          {goalProgress.length ? (
            <Card padded={false}>
              {goalProgress.map((progress, index) => (
                <GoalRow
                  key={progress.id}
                  progress={progress}
                  divided={index > 0}
                  onPress={() =>
                    navigation.navigate("ManageGoal", { goalId: progress.id })
                  }
                  onAddMoney={() =>
                    navigation.navigate("ManageGoal", {
                      goalId: progress.id,
                      mode: "deposit",
                    })
                  }
                />
              ))}
            </Card>
          ) : (
            <EmptyState
              icon="flag-outline"
              title={t("no_goals")}
              message={t("no_goals_hint")}
              actionLabel={t("add_goal")}
              onAction={() => navigation.navigate("ManageGoal")}
            />
          )}

          {goalProgress.length > 0 && (
            <PrimaryButton
              mode="secondary"
              icon="add"
              onPress={() => navigation.navigate("ManageGoal")}
            >
              {t("add_goal")}
            </PrimaryButton>
          )}
        </>
      )}
    </ScrollView>
  );
};

export default Plan;

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.screen,
  },
  content: {
    padding: spacing[4],
    paddingBottom: spacing[6],
    gap: spacing[4],
  },
  totalCard: {
    gap: spacing[2],
  },
  totalLabel: {
    ...type.label,
    color: colors.textMuted,
  },
  totalRow: {
    flexDirection: "row",
    alignItems: "baseline",
    gap: spacing[2],
  },
  totalSpent: {
    ...type.h2,
    fontWeight: "700",
    color: colors.text,
  },
  totalLimit: {
    ...type.caption,
    color: colors.textMuted,
  },
});
