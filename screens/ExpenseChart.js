import { useEffect, useLayoutEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Dimensions,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";

import { ExpenseStore } from "../store/context";
import { AuthStore } from "../store/authContext";
import { useLanguage } from "../store/languageContext";
import { GlobalStyles } from "../constants/styles";
import { CATEGORY_TYPE } from "../constants/config";
import useRefresh from "../hooks/useRefresh";
import useExpenseChartData from "../hooks/useExpenseChartData";
import ListChar from "../components/expenses/ListChar";
import HeaderTime from "../components/ui/HeaderTime";
import TotalTypeIncome from "../components/charts/TotalTypeIncome";
import DonutChart from "../components/charts/DonutChart";
import Card from "../components/ui/Card";
import EmptyState from "../components/ui/EmptyState";
import useMoney from "../hooks/useMoney";

const { colors, spacing, radius, type } = GlobalStyles;

// Slices below this percentage hide their label and leader line (still shown in
// the legend below) to avoid unreadable overlap between thin adjacent slices.
const LABEL_THRESHOLD = 4;

// Expense/income toggle rendered as two summary cards rather than coloured
// buttons: each one states its own total, so the figure you are about to chart
// is visible before you switch to it.
const TotalToggle = ({ label, amount, active, color, surface, onPress }) => {
  const { money } = useMoney();

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="tab"
      accessibilityState={{ selected: active }}
      style={({ pressed }) => [
        styles.toggle,
        active && {
          borderColor: color,
          backgroundColor: surface,
          borderWidth: 2,
        },
        pressed && styles.pressed,
      ]}
    >
      <Text style={styles.toggleLabel}>{label}</Text>
      <Text
        style={[styles.toggleAmount, active && { color }]}
        numberOfLines={1}
        adjustsFontSizeToFit
      >
        {money(amount)}
      </Text>
    </Pressable>
  );
};

function ExpenseChart({ navigation }) {
  const { valueSelectChart, setValueSelectChart, refreshExpenses } =
    ExpenseStore();
  const { user } = AuthStore();
  const { t } = useLanguage();
  const { money } = useMoney();
  const [title, setTitle] = useState(CATEGORY_TYPE.EXPENSE);
  const [loading, setLoading] = useState(false);

  const { data, total, currTimeLabel, currTimeValue, setCurrTimeValue } =
    useExpenseChartData(title, t("other"));

  useEffect(() => {
    setLoading(true);
    const timer = setTimeout(() => setLoading(false), 450);
    return () => clearTimeout(timer);
  }, [valueSelectChart, currTimeValue, title]);

  const { refreshing, handleRefresh } = useRefresh(() =>
    refreshExpenses(user.email)
  );

  useLayoutEffect(() => {
    navigation.setOptions({
      headerTitle: () => (
        <HeaderTime
          valueSelect={valueSelectChart}
          currTimeLabel={currTimeLabel}
          currTimeValue={currTimeValue}
          setCurrTimeValue={setCurrTimeValue}
        />
      ),
    });
  }, [valueSelectChart, currTimeLabel, currTimeValue, setCurrTimeValue]);

  if (valueSelectChart === "total") {
    setValueSelectChart("monthly");
    navigation.navigate("AnnualYear");
  }

  // Keep the donut inside the screen on small devices.
  const chartSize = Math.min(Dimensions.get("window").width - spacing[4] * 2, 340);
  const periodTotal = title === CATEGORY_TYPE.EXPENSE ? total.expense : total.income;

  const accessibleSummary = useMemo(
    () =>
      data.length
        ? `${t("spending_by_category")}: ${data
            .map((slice) => `${slice.x} ${slice.pct}%`)
            .join(", ")}`
        : undefined,
    [data, t]
  );

  // Identity of the current slice set, so the chart remounts on any real change.
  const chartSignature = useMemo(
    () => `${title}-${data.map((s) => `${s.key}:${s.total}`).join("|")}`,
    [title, data]
  );

  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={styles.content}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={handleRefresh}
          tintColor={colors.primary}
          colors={[colors.primary]}
        />
      }
    >
      <View style={styles.toggleRow}>
        <TotalToggle
          label={t("total_expense")}
          amount={total.expense}
          active={title === CATEGORY_TYPE.EXPENSE}
          color={colors.expenseText}
          surface={colors.expenseSurface}
          onPress={() => setTitle(CATEGORY_TYPE.EXPENSE)}
        />
        <TotalToggle
          label={t("total_income")}
          amount={total.income}
          active={title === CATEGORY_TYPE.IMCOME}
          color={colors.incomeText}
          surface={colors.incomeSurface}
          onPress={() => setTitle(CATEGORY_TYPE.IMCOME)}
        />
      </View>

      {/* Account balances are a running total across all accounts, so they do
          not depend on the selected period. A month with no income still has
          a balance worth seeing — only the category breakdown below can be
          genuinely empty. */}
      {title === CATEGORY_TYPE.IMCOME && <TotalTypeIncome />}

      {loading ? (
        <View style={styles.loading}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      ) : (
        <Card style={styles.chartCard}>
          <View style={styles.chartHead}>
            <Text style={styles.chartTitle}>{t("spending_by_category")}</Text>
            <Text style={styles.chartTotal}>{money(periodTotal)}</Text>
          </View>

          {data.length === 0 ? (
            // Empty state stays inside the card, so it reads as "this section
            // has nothing for this period" rather than the screen being broken.
            <EmptyState
              icon="pie-chart-outline"
              title={t("no_chart_data")}
              message={t("no_chart_data_hint")}
              actionLabel={t("add_expense")}
              onAction={() => navigation.navigate("ManageExpense")}
              style={styles.emptyInCard}
            />
          ) : (
            <>
              <View
                style={styles.chartWrap}
                accessible
                accessibilityRole="image"
                accessibilityLabel={accessibleSummary}
              >
                <DonutChart
                  // Remounts whenever the slices actually change, so nothing
                  // of the previous period can linger on screen.
                  key={chartSignature}
                  data={data}
                  size={chartSize}
                  labelThreshold={LABEL_THRESHOLD}
                />
              </View>

              <View style={styles.legend}>
                {data.map((item) => (
                  <ListChar item={item} key={item.key} />
                ))}
              </View>
            </>
          )}
        </Card>
      )}
    </ScrollView>
  );
}

export default ExpenseChart;

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
  toggleRow: {
    flexDirection: "row",
    gap: spacing[3],
  },
  toggle: {
    flex: 1,
    gap: 2,
    paddingVertical: spacing[3],
    paddingHorizontal: spacing[3],
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  toggleLabel: {
    ...type.label,
    color: colors.textMuted,
  },
  toggleAmount: {
    ...type.h3,
    fontWeight: "700",
    color: colors.textBody,
  },
  chartCard: {
    paddingBottom: spacing[2],
  },
  chartHead: {
    flexDirection: "row",
    alignItems: "baseline",
    justifyContent: "space-between",
    gap: spacing[2],
  },
  chartTitle: {
    ...type.h3,
    color: colors.text,
  },
  chartTotal: {
    ...type.bodyEmphasis,
    fontWeight: "700",
    color: colors.textBody,
  },
  chartWrap: {
    alignItems: "center",
    justifyContent: "center",
    marginTop: spacing[1],
  },
  legend: {
    borderTopWidth: 1,
    borderTopColor: colors.n100,
    paddingTop: spacing[2],
  },
  // Tighter than the standalone empty state: it sits inside the card now.
  emptyInCard: {
    paddingVertical: spacing[5],
    paddingHorizontal: 0,
  },
  loading: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: spacing[6] * 3,
  },
  pressed: {
    opacity: 0.8,
  },
});
