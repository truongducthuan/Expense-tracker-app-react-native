import { useLayoutEffect, useState } from "react";
import { View, StyleSheet, ScrollView, RefreshControl } from "react-native";
import { VictoryPie, VictoryTheme, VictoryLabel } from "victory-native";
import { Line } from "react-native-svg";

import { ExpenseStore } from "../store/context";
import { AuthStore } from "../store/authContext";
import useRefresh from "../hooks/useRefresh";
import useExpenseChartData from "../hooks/useExpenseChartData";
import NavItem from "../components/ui/NavItem";
import ListChar from "../components/expenses/ListChar";
import HeaderTime from "../components/ui/HeaderTime";
import TotalTypeIncome from "../components/charts/TotalTypeIncome";

// Slices below this percentage hide their label and leader line (still shown in
// the legend below) to avoid unreadable overlap between thin adjacent slices.
const LABEL_THRESHOLD = 3;

// Type colors for the Expense/Income toggle: resting vs. bolder (active) shade.
const EXPENSE_COLOR = { base: "#e53935", active: "#b71c1c" };
const INCOME_COLOR = { base: "#2e9e0a", active: "#1b5e20" };

// Leader line connecting a slice to its label. VictoryPie's built-in indicator
// renders a web <line> that crashes on React Native, so we draw it with
// react-native-svg's <Line> and the x1/y1/x2/y2 props Victory passes in.
// `index`/`data` let us skip the line for slices under the threshold.
const LabelLine = ({ x1, y1, x2, y2, index, data, threshold }) => {
  if (data?.[index] && data[index].y < threshold) return null;
  return <Line x1={x1} y1={y1} x2={x2} y2={y2} stroke="#9a9a9a" strokeWidth={1} />;
};

function ExpenseChart({ navigation }) {
  const { valueSelectChart, setValueSelectChart, refreshExpenses } =
    ExpenseStore();
  const { user } = AuthStore();
  const [title, setTitle] = useState("expense");

  const { data, total, currTimeLabel, currTimeValue, setCurrTimeValue } =
    useExpenseChartData(title);

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

  return (
    <ScrollView
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
      }
    >
      <View style={styles.nav}>
        <NavItem
          onPress={setTitle}
          isNav={title === "expense"}
          style={styles.horizon}
          total={total.expense}
          color={EXPENSE_COLOR.base}
          activeColor={EXPENSE_COLOR.active}
          isLabel={false}
        >
          Expense
        </NavItem>
        <NavItem
          onPress={setTitle}
          isNav={title === "income"}
          style={styles.horizon}
          total={total.income}
          color={INCOME_COLOR.base}
          activeColor={INCOME_COLOR.active}
          isLabel={false}
        >
          Income
        </NavItem>
      </View>

      {title === "income" && <TotalTypeIncome />}

      <View style={styles.chart}>
        <VictoryPie
          key={data}
          data={data}
          x={"x"}
          y={"y"}
          width={360}
          height={360}
          padding={{ top: 30, bottom: 30, left: 75, right: 75 }}
          colorScale={data.map((slice) => slice.color)}
          animate={{ duration: 2000 }}
          theme={VictoryTheme.material}
          sortKey="y"
          sortOrder="descending"
          labelPosition="centroid"
          labelRadius={({ radius }) => radius + 22}
          labelIndicator={<LabelLine data={data} threshold={LABEL_THRESHOLD} />}
          labelIndicatorInnerOffset={8}
          labelIndicatorOuterOffset={4}
          labels={({ datum }) =>
            datum.y >= LABEL_THRESHOLD ? `${datum.x} ${datum.y}%` : null
          }
          labelComponent={<VictoryLabel style={{ fill: "#000", fontSize: 9 }} />}
        />
      </View>

      <View>
        {data.map((item) => (
          <ListChar item={item} key={item.x} />
        ))}
      </View>
    </ScrollView>
  );
}

export default ExpenseChart;

const styles = StyleSheet.create({
  chart: {
    flex: 1,
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
});
