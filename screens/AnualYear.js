import { useEffect, useMemo, useState } from "react";
import { StyleSheet, View } from "react-native";

import ExpenseSummary from "../components/expenses/ExpenseSummary";
import ListAnnualYear from "../components/expenses/ListAnnualYear";
import EmptyState from "../components/ui/EmptyState";
import { ExpenseStore } from "../store/context";
import { GlobalStyles } from "../constants/styles";
import { useLanguage } from "../store/languageContext";

const { colors, spacing } = GlobalStyles;

const AnualYear = ({ navigation }) => {
  const { expenses } = ExpenseStore();
  const { t } = useLanguage();

  const [data, setDate] = useState([]);

  useEffect(() => {
    const handleLogic = () => {
      const expenseArr = expenses.filter((e) => e.type === "expense");
      const incomeArr = expenses.filter((e) => e.type === "income");
      const handleObject = (data) => {
        const object = {};
        for (const item of data) {
          object[item.year] = (object[item.year] || 0) + Number(item.amount);
        }
        return object;
      };
      const newExpenses = handleObject(expenseArr);
      const expenseArray = [];
      for (let key in newExpenses) {
        expenseArray.push({
          year: +key,
          total: newExpenses[key],
          type: "expense",
        });
      }
      const newIncomes = handleObject(incomeArr);
      const incomeArray = [];
      for (let key in newIncomes) {
        incomeArray.push({
          year: +key,
          total: newIncomes[key],
          type: "income",
        });
      }
      setDate(() => {
        return [...expenseArray, ...incomeArray];
      });
    };
    handleLogic();
  }, [expenses]);

  const grouped = useMemo(() => {
    if (!data.length) return [];
    const object = {};
    for (const item of data) {
      if (!Array.isArray(object[item.year])) object[item.year] = [];
      object[item.year].push(item);
    }
    return Object.keys(object)
      .map((year) => ({ year, value: object[year] }))
      .reverse();
  }, [data]);

  return (
    <View style={styles.container}>
      <ExpenseSummary expenses={expenses} scopeKey="all_time" />

      <View style={styles.list}>
        {grouped.length ? (
          <ListAnnualYear data={grouped} />
        ) : (
          <EmptyState
            icon="stats-chart-outline"
            title={t("no_chart_data")}
            message={t("no_chart_data_hint")}
            actionLabel={t("add_expense")}
            onAction={() => navigation.navigate("ManageExpense")}
          />
        )}
      </View>
    </View>
  );
};

export default AnualYear;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: spacing[4],
    paddingTop: spacing[4],
    backgroundColor: colors.screen,
  },
  list: {
    flex: 1,
    marginTop: spacing[4],
  },
});
