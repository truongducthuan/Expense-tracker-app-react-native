import { useState, useLayoutEffect, useEffect, useMemo } from "react";
import { ActivityIndicator, StyleSheet, View } from "react-native";
import { useNavigation } from "@react-navigation/native";

import ExpenseSummary from "./ExpenseSummary";
import ExpenseList from "./ExpenseList";
import HeaderTime from "../ui/HeaderTime";
import SegmentedControl from "../ui/SegmentedControl";
import { GlobalStyles } from "../../constants/styles";
import { useLanguage } from "../../store/languageContext";
import {
  getFollowMonth,
  getFollowWeek,
  getFollowYear,
  getEndOfWeek,
  getStartOfWeek,
} from "../../util/date";
import { ExpenseStore } from "../../store/context";

const { colors, spacing } = GlobalStyles;

const PERIODS = ["weekly", "monthly", "yearly", "total"];

const ExpenseOutput = ({ fallBack, onRefresh, refreshing }) => {
  const navigation = useNavigation();
  const { expenses } = ExpenseStore();
  const { t } = useLanguage();

  const [typeFollow, setTypeFollow] = useState("weekly");
  const [currTimeLabel, setCurrTimeLabel] = useState("m");
  const [currTimeValue, setCurrTimeValue] = useState(0);
  const [loading, setLoading] = useState(false);

  // "total" isn't a period — it opens the annual screen and the filter snaps
  // back to the previous selection.
  const handlePeriodChange = (period) => {
    if (period === "total") {
      navigation.navigate("AnnualYear");
      return;
    }
    setTypeFollow(period);
  };

  useEffect(() => {
    setLoading(true);
    const timer = setTimeout(() => setLoading(false), 450);
    return () => clearTimeout(timer);
  }, [typeFollow, currTimeValue]);

  useEffect(() => {
    const day = new Date();
    const month = day.getMonth() + 1;
    const year = day.getFullYear();
    setCurrTimeValue(() => {
      if (typeFollow === "monthly") {
        setCurrTimeLabel("m");
        return month;
      } else if (typeFollow === "yearly") {
        setCurrTimeLabel("y");
        return year;
      } else {
        setCurrTimeLabel(`from ${getStartOfWeek(day).getDate()}`);
        return getEndOfWeek(day).getDate();
      }
    });
  }, [typeFollow]);

  // Set header follow time
  useLayoutEffect(() => {
    navigation.setOptions({
      headerTitle: () => (
        <HeaderTime
          valueSelect={typeFollow}
          currTimeLabel={currTimeLabel}
          currTimeValue={currTimeValue}
          setCurrTimeValue={setCurrTimeValue}
        />
      ),
    });
  }, [currTimeLabel, currTimeValue, typeFollow, setCurrTimeValue]);

  const data = useMemo(() => {
    const today = new Date();
    if (typeFollow === "weekly") return getFollowWeek(today, expenses);
    if (typeFollow === "monthly") return getFollowMonth(currTimeValue, expenses);
    if (typeFollow === "yearly") return getFollowYear(currTimeValue, expenses);
    return expenses;
  }, [typeFollow, currTimeValue, expenses]);

  const options = useMemo(
    () => PERIODS.map((period) => ({ value: period, label: t(period) })),
    [t]
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <SegmentedControl
          options={options}
          value={typeFollow}
          onChange={handlePeriodChange}
          compact
        />
        <ExpenseSummary expenses={data} />
      </View>

      {loading ? (
        <View style={styles.loading}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      ) : (
        <ExpenseList
          items={data}
          fallBack={fallBack}
          onRefresh={onRefresh}
          refreshing={refreshing}
        />
      )}
    </View>
  );
};

export default ExpenseOutput;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.screen,
    paddingHorizontal: spacing[4],
  },
  header: {
    paddingTop: spacing[3],
    gap: spacing[3],
  },
  loading: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: spacing[6],
  },
});
