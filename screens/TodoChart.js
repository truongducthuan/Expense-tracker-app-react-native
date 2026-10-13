import { useLayoutEffect } from "react";
import { Dimensions, RefreshControl, ScrollView } from "react-native";

import useRefresh from "../hooks/useRefresh";
import useTodoChartData from "../hooks/useTodoChartData";
import { ExpenseStore } from "../store/context";
import HeaderTime from "../components/ui/HeaderTime";
import BarChart from "../components/charts/BarChart";

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
      <BarChart data={data} width={Dimensions.get("window").width} />
    </ScrollView>
  );
}

export default TodoChart;
