import React, {
  useCallback,
  useEffect,
  useLayoutEffect,
  useState,
} from "react";
import {
  Text,
  View,
  StyleSheet,
  FlatList,
  ScrollView,
  Pressable,
} from "react-native";

import {
  VictoryPie,
  VictoryChart,
  VictoryTheme,
  VictoryLabel,
  VictoryScatter,
} from "victory-native";
import Svg, { Path } from "react-native-svg";
import { ExpenseStore } from "../store/context";
import NavItem from "../components/ui/NavItem";
import { colorsArray } from "../constants/color";
import ListChar from "../components/expenses/ListChar";
import { GlobalStyles } from "../constants/styles";
import HeaderTime from "../components/ui/HeaderTime";
import TotalTypeIncome from "../components/charts/TotalTypeIncome";

import { getFollowMonth, getFollowWeek, getFollowYear } from "../util/date";
import { getStartOfWeek, getEndOfWeek } from "../util/date";

function ExpenseChart({ navigation }) {
  const { expenses, valueSelectChart, setValueSelectChart } = ExpenseStore();
  const [data, setData] = useState([]);
  const [total, setTotal] = useState({
    income: 0,
    expense: 0,
  });
  const [title, setTitle] = useState("expense");
  const [currTimeLabel, setCurrTimeLabel] = useState("m");
  const [currTimeValue, setCurrTimeValue] = useState(0);

  useEffect(() => {
    const day = new Date();
    const date = day.getDate();
    const month = day.getMonth() + 1;
    const year = day.getFullYear();
    setCurrTimeValue((state) => {
      if (valueSelectChart.toLowerCase() === "monthly") {
        setCurrTimeLabel("m");
        return month;
      } else if (valueSelectChart.toLowerCase() === "yearly") {
        setCurrTimeLabel("y");
        return year;
      } else {
        setCurrTimeLabel(`from ${getStartOfWeek(day).getDate()}`);
        // setCurrTimeValue(getEndOfWeek(day).getDate())
        return getEndOfWeek(day).getDate();
      }
    });
  }, [valueSelectChart]);

  const calcTotal = (data) => {
    return data.reduce((a, b) => a + +b.amount, 0);
  };

  useLayoutEffect(() => {
    navigation.setOptions({
      headerTitle: () => {
        return (
          <HeaderTime
            valueSelect={valueSelectChart}
            currTimeLabel={currTimeLabel}
            currTimeValue={currTimeValue}
            setCurrTimeValue={setCurrTimeValue}
          />
        );
      },
    });
  }, [valueSelectChart, currTimeLabel, currTimeValue, setCurrTimeValue]);

  if (valueSelectChart === "total") {
    setValueSelectChart("monthly");
    navigation.navigate("AnnualYear");
  }

  const loadData = () => {
    const today = new Date();
    if (valueSelectChart.toLowerCase() === "weekly") {
      const data = getFollowWeek(today, expenses);
      return data;
    } else if (valueSelectChart.toLowerCase() === "monthly") {
      const data = getFollowMonth(currTimeValue, expenses);
      return data;
    } else if (valueSelectChart.toLowerCase() === "yearly") {
      const data = getFollowYear(currTimeValue, expenses);
      return data;
    }
    return expenses;
  };

  useEffect(() => {
    const expenseArr = loadData().filter((e) => e.type === "expense");
    const incomeArr = loadData().filter((e) => e.type === "income");
    setTotal({
      expense: calcTotal(expenseArr),
      income: calcTotal(incomeArr),
    });

    const objectChart = (data) => {
      const object = {};
      for (const item of data) {
        object[item.category] =
          (object[item.category] || 0) + Number(item.amount);
      }
      return object;
    };
    let num = 0;

    if (title === "expense") {
      const total = calcTotal(expenseArr);
      const newExpense = objectChart(expenseArr);
      // console.log(newExpense);
      const newArr = [];
      for (let key in newExpense) {
        const percent = ((newExpense[key] / total) * 100).toFixed(2);
        newArr.push({
          x: key,
          y: +percent,
          color: colorsArray[num],
          total: newExpense[key],
        });
        num++;
      }
      newArr.sort((a, b) => b.y - a.y);
      setData(newArr);
    } else {
      const total = calcTotal(incomeArr);
      const newExpense = objectChart(incomeArr);
      const newArr = [];
      for (let key in newExpense) {
        const percent = ((newExpense[key] / total) * 100).toFixed(2);
        newArr.push({
          x: key,
          y: Number(percent),
          color: colorsArray[num],
          total: newExpense[key],
        });
        num++;
      }
      newArr.sort((a, b) => b.y - a.y);
      setData(newArr);
    }
  }, [title, valueSelectChart, currTimeValue, currTimeLabel, setCurrTimeValue, expenses]);

  const getColor = () => {
    return data.map((a) => a.color);
  };

  const toggleExpense = (e) => {
    setTitle(e)
  }

  return (
    <ScrollView>
      {/* <Svg width={20} height={20} viewBox="0 0 20 20">
        <Path d="M16.993 6.667H3.227l6.883 6.883 6.883-6.883z" fill="#000" />
      </Svg> */}
      {/* <VictoryScatter> */}
      <View style={styles.nav}>
        <NavItem
          onPress={toggleExpense}
          isNav={title === "expense"}
          style={styles.horizon}
          total={total.expense}
        >
          Expense
        </NavItem>
        <NavItem
          onPress={toggleExpense}
          isNav={title === "income"}
          style={styles.horizon}
          total={total.income}
        >
          Income
        </NavItem>
      </View>
      {title == 'income' && 
        <TotalTypeIncome />      
      }
      <View style={styles.chart}>
        <VictoryPie
          key={data}
          data={data}
          x={"x"}
          y={"y"}
          width={340}
          height={340}
          colorScale={getColor()}
          animate={{
            duration: 2000,
          }}
          theme={VictoryTheme.material}
          sortKey="y"
          sortOrder="descending"
          labels={({ datum }) => [`${datum.x}`, `${datum.y}%`]}
          labelComponent={
            <VictoryLabel
              style={[{ fill: "#000", fontSize: 8, textAlign: "center" }]}
              lineHeight={[1, 1]}
            />
          }
        />
        {/* </VictoryScatter> */}
      </View>
      
      <View>
        {data.map((i) => (
          <ListChar item={i} key={i.x} />
        ))}
      </View>
    </ScrollView>
  );
}

export default ExpenseChart;

const styles = StyleSheet.create({
  container: {
    flexDirection: "column",
    backgroundColor: "#f5fcff",
  },
  chart: {
    flex: 1,
    // justifyContent: "center",
    alignItems: "center",
    width: "100%",
    height: 380,
  },
  nav: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 8,
    paddingTop: 8,
  },
  horizon: {
    paddingHorizontal: 40,
    paddingVertical: 4,
  },
  infoText: {
    color: GlobalStyles.colors.error500,
    fontSize: 16,
    textAlign: "center",
    marginTop: 32,
  },
});
