import React from "react";
import { View, Text, StyleSheet } from "react-native";

import { GlobalStyles } from "../../constants/styles";
import { formatAmount } from "../../util/format";

const ExpenseSummary = ({ expenses }) => {
  const expenseArr = expenses.filter((e) => e.type === "expense");
  const incomeArr = expenses.filter((e) => e.type === "income");
  const calcTotal = (data) => {
    return data.reduce((a, b) => a + +b.amount, 0);
  };
  return (
    <View style={styles.container}>
      <View>
        <Text style={styles.title}>Income</Text>
        <Text style={[styles.sum, styles.green]}>
          {formatAmount(calcTotal(incomeArr))}
        </Text>
      </View>
      <View>
        <Text style={styles.title}>Expense</Text>
        <Text style={[styles.sum, styles.red]}>
          {formatAmount(calcTotal(expenseArr))}
        </Text>
      </View>
      <View>
        <Text style={styles.title}>Total</Text>
        <Text style={styles.sum}>{formatAmount(calcTotal(incomeArr) - calcTotal(expenseArr))}</Text>
      </View>
      {/* <Text style={styles.sum}>${expensesSum.toFixed(2)}</Text> */}
    </View>
  );
};

export default ExpenseSummary;

const styles = StyleSheet.create({
  container: {
    padding: 8,
    backgroundColor: GlobalStyles.colors.primary50,
    borderRadius: 6,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  title: {
    fontSize: 12,
    color: GlobalStyles.colors.primary400,
    textAlign: "center",
  },
  sum: {
    fontSize: 14,
    fontWeight: "bold",
    textAlign: "center",
  },
  red: {
    color: GlobalStyles.colors.error500,
  },
  green: {
    color: GlobalStyles.colors.income,
  },
});
