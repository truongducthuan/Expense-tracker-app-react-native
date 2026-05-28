import { useEffect, useState } from "react";

import { ExpenseStore } from "../store/context";
import { colorsArray } from "../constants/color";
import { buildPieData, calcTotal } from "../util/chart";
import { filterByPeriod, getStartOfWeek, getEndOfWeek } from "../util/date";

// Owns the period state and derives the pie data + totals for ExpenseChart.
export default function useExpenseChartData(title) {
  const { expenses, valueSelectChart } = ExpenseStore();

  const [currTimeLabel, setCurrTimeLabel] = useState("m");
  const [currTimeValue, setCurrTimeValue] = useState(0);
  const [data, setData] = useState([]);
  const [total, setTotal] = useState({ income: 0, expense: 0 });

  useEffect(() => {
    const day = new Date();
    setCurrTimeValue(() => {
      const period = valueSelectChart.toLowerCase();
      if (period === "monthly") {
        setCurrTimeLabel("m");
        return day.getMonth() + 1;
      }
      if (period === "yearly") {
        setCurrTimeLabel("y");
        return day.getFullYear();
      }
      setCurrTimeLabel(`from ${getStartOfWeek(day).getDate()}`);
      return getEndOfWeek(day).getDate();
    });
  }, [valueSelectChart]);

  useEffect(() => {
    const periodItems = filterByPeriod(expenses, valueSelectChart, currTimeValue);
    const expenseArr = periodItems.filter((e) => e.type === "expense");
    const incomeArr = periodItems.filter((e) => e.type === "income");

    setTotal({
      expense: calcTotal(expenseArr),
      income: calcTotal(incomeArr),
    });
    setData(buildPieData(title === "expense" ? expenseArr : incomeArr, colorsArray));
  }, [title, valueSelectChart, currTimeValue, expenses]);

  return { data, total, currTimeLabel, currTimeValue, setCurrTimeValue };
}
