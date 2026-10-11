import { useCallback, useEffect, useState } from "react";

import { ExpenseStore } from "../store/context";
import { CHART_SERIES, CHART_OTHER_COLOR } from "../constants/color";
import {
  translateExpenseCategory,
  translateIncomeCategory,
} from "../constants/seedNames";
import { useLanguage } from "../store/languageContext";
import { buildPieData, calcTotal } from "../util/chart";
import { filterByPeriod, getStartOfWeek, getEndOfWeek } from "../util/date";

// Owns the period state and derives the pie data + totals for ExpenseChart.
// `otherLabel` names the slice that absorbs categories past the last colour
// slot — pass the translated string so the legend stays localised.
export default function useExpenseChartData(title, otherLabel = "Other") {
  const { expenses, valueSelectChart } = ExpenseStore();
  const { lang } = useLanguage();

  // Seeded categories are relabelled into the language being read, so a
  // transaction saved as "Ăn uống" and one saved as "Food" share a slice
  // instead of splitting the donut. The expense and income lists are separate,
  // so the translator follows the selected tab.
  const canonicalize = useCallback(
    (name) => {
      const translate =
        title === "income" ? translateIncomeCategory : translateExpenseCategory;
      return translate(name, lang) || name;
    },
    [title, lang]
  );

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
    setData(
      buildPieData(title === "expense" ? expenseArr : incomeArr, CHART_SERIES, {
        otherColor: CHART_OTHER_COLOR,
        otherLabel,
        canonicalize,
      })
    );
  }, [title, valueSelectChart, currTimeValue, expenses, otherLabel, canonicalize]);

  return { data, total, currTimeLabel, currTimeValue, setCurrTimeValue };
}
