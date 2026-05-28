import { useLayoutEffect } from "react";
import { ScrollView, RefreshControl } from "react-native";
import { VictoryBar, VictoryChart, VictoryTheme } from "victory-native";

import useRefresh from "../hooks/useRefresh";
import useTodoChartData from "../hooks/useTodoChartData";
import { ExpenseStore } from "../store/context";
import HeaderTime from "../components/ui/HeaderTime";

function TodoChart({ navigation }) {
  const { valueSelectChart } = ExpenseStore();
  const { data, currTimeLabel, currTimeValue, setCurrTimeValue, refresh } =
    useTodoChartData();
  const { refreshing, handleRefresh } = useRefresh(refresh);

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

  return (
    <ScrollView
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
      }
    >
      <VictoryChart theme={VictoryTheme.material} domainPadding={{ x: 5 }}>
        <VictoryBar
          style={{ data: { fill: "#c43a31" } }}
          labels={({ datum }) => `y: ${datum.y}`}
          data={data}
          animate={{ duration: 2000 }}
        />
      </VictoryChart>
    </ScrollView>
  );
}

export default TodoChart;
