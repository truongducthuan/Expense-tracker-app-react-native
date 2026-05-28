import { useEffect, useState } from "react";

import { ExpenseStore } from "../store/context";
import { getTodoListApi } from "../api/todo";
import { buildTodoBarData } from "../util/chart";
import { filterByPeriod, getStartOfWeek } from "../util/date";

// Owns the period state and derives bar data from the remote todo summaries.
export default function useTodoChartData() {
  const { valueSelectChart } = ExpenseStore();

  const [currTimeLabel, setCurrTimeLabel] = useState("m");
  const [currTimeValue, setCurrTimeValue] = useState(0);
  const [todoList, setTodoList] = useState([]);
  const [data, setData] = useState([]);

  const refresh = async () => {
    const res = await getTodoListApi();
    setTodoList(res);
  };

  useEffect(() => {
    refresh();
  }, []);

  useEffect(() => {
    const day = new Date();
    setCurrTimeValue(() => {
      const period = valueSelectChart.toLowerCase();
      if (period === "weekly") {
        setCurrTimeLabel(`from ${getStartOfWeek(day).getDate()}`);
        return day.getDate();
      }
      if (period === "monthly") {
        setCurrTimeLabel("m");
        return day.getMonth() + 1;
      }
      setCurrTimeLabel("y");
      return day.getFullYear();
    });
  }, [valueSelectChart]);

  useEffect(() => {
    const periodItems = filterByPeriod(todoList, valueSelectChart, currTimeValue);
    setData(buildTodoBarData(periodItems, valueSelectChart));
  }, [valueSelectChart, currTimeValue, todoList]);

  return { data, currTimeLabel, currTimeValue, setCurrTimeValue, refresh };
}
