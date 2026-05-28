import { useEffect, useState } from "react";
import { StyleSheet, View } from "react-native";
import ExpenseSummary from "../components/expenses/ExpenseSummary";
import { ExpenseStore } from "../store/context";
import ListAnnualYear from "../components/expenses/ListAnnualYear";
import { GlobalStyles } from "../constants/styles";

const AnualYear = () => {
  const { expenses } = ExpenseStore();

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
      setDate((state) => {
        return [...expenseArray, ...incomeArray];
      });
    };
    handleLogic();
  }, [expenses]);

  let content;
  if (data.length) {
    const object = {};
    for (const item of data) {
      if (!Array.isArray(object[item.year])) object[item.year] = [];
      object[item.year].push(item);
    }
    const newData = [];
    for (let key in object) {
      newData.push({
        year: key,
        value: object[key],
      });
    }
    content = <ListAnnualYear data={newData.reverse()} />;
  }
  return (
    <View style={styles.container}>
      <View style={styles.title}>
        <ExpenseSummary expenses={expenses} />
      </View>
      <View>{content}</View>
    </View>
  );
};

export default AnualYear;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 24,
    backgroundColor: GlobalStyles.colors.primary700,
  },
  title: {
    marginVertical: 10,
  },
});
