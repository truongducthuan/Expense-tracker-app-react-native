import { useState, useLayoutEffect, useEffect } from "react";
import { View, StyleSheet, Text, Pressable } from "react-native";
import { useNavigation } from "@react-navigation/native";

import ExpenseSummary from "./ExpenseSummary";
import ExpenseList from "./ExpenseList";
import HeaderTime from "../ui/HeaderTime";
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

const ExpenseOutput = ({ fallBack, onRefresh, refreshing }) => {
  const navigation = useNavigation();
  const { expenses } = ExpenseStore();
  const { t } = useLanguage();

  const [typeFollow, setTypeFollow] = useState("weekly");
  const [currTimeLabel, setCurrTimeLabel] = useState("m");
  const [currTimeValue, setCurrTimeValue] = useState(0);
  const handleFollow = (type) => {
    setTypeFollow(type);
  };

  useEffect(() => {
    const day = new Date();
    const date = day.getDate();
    const month = day.getMonth() + 1;
    const year = day.getFullYear();
    setCurrTimeValue((state) => {
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
      headerTitle: () => {
        return (
          <HeaderTime
            valueSelect={typeFollow}
            currTimeLabel={currTimeLabel}
            currTimeValue={currTimeValue}
            setCurrTimeValue={setCurrTimeValue}
          />
        );
      },
    });
  }, [currTimeLabel, currTimeValue, typeFollow, setCurrTimeValue]);

  const loadData = () => {
    const today = new Date();
    if (typeFollow === "weekly") {
      const data = getFollowWeek(today, expenses);
      return data;
    } else if (typeFollow === "monthly") {
      const data = getFollowMonth(currTimeValue, expenses);
      return data;
    } else if (typeFollow === "yearly") {
      const data = getFollowYear(currTimeValue, expenses);
      return data;
    }
    return expenses;
  };

  const content = (
    <ExpenseList
      items={loadData()}
      fallBack={fallBack}
      onRefresh={onRefresh}
      refreshing={refreshing}
    />
  );

  return (
    <View style={styles.container}>
      <View style={styles.nav}>
        <Pressable
          style={({ pressed }) => {
            pressed && styles.pressed;
          }}
          onPress={handleFollow.bind(null, "weekly")}
        >
          <Text
            style={[
              styles.follow,
              typeFollow === "weekly" && {
                borderBottomColor: GlobalStyles.colors.primary100,
                borderBottomWidth: 4,
              },
            ]}
          >
            {t("weekly")}
          </Text>
        </Pressable>
        <Pressable
          style={({ pressed }) => {
            pressed && styles.pressed;
          }}
          onPress={handleFollow.bind(null, "monthly")}
        >
          <Text
            style={[
              styles.follow,
              typeFollow === "monthly" && {
                borderBottomColor: GlobalStyles.colors.primary100,
                borderBottomWidth: 4,
              },
            ]}
          >
            {t("monthly")}
          </Text>
        </Pressable>
        <Pressable
          style={({ pressed }) => {
            pressed && styles.pressed;
          }}
          onPress={handleFollow.bind(null, "yearly")}
        >
          <Text
            style={[
              styles.follow,
              typeFollow === "yearly" && {
                borderBottomColor: GlobalStyles.colors.primary100,
                borderBottomWidth: 4,
              },
            ]}
          >
            {t("yearly")}
          </Text>
        </Pressable>
        <Pressable
          style={({ pressed }) => {
            pressed && styles.pressed;
          }}
          onPress={() => {
            navigation.navigate("AnnualYear");
          }}
        >
          <Text
            style={[
              styles.follow,
              typeFollow === "total" && {
                borderBottomColor: GlobalStyles.colors.primary100,
                borderBottomWidth: 4,
              },
            ]}
          >
            {t("total")}
          </Text>
        </Pressable>
      </View>
      <ExpenseSummary expenses={loadData()} />
      {content}
    </View>
  );
};

export default ExpenseOutput;

const styles = StyleSheet.create({
  container: {
    backgroundColor: GlobalStyles.colors.primary700,
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 6,
    // paddingBottom: 40,
  },
  infoText: {
    color: "#fff",
    fontSize: 16,
    textAlign: "center",
    marginTop: 32,
  },
  nav: {
    // backgroundColor: "#fff",
    flexDirection: "row",
    justifyContent: "space-evenly",
    alignItems: "center",
    marginBottom: 12,
    borderRadius: 8,
    borderBottomColor: GlobalStyles.colors.primary100,
    borderBottomWidth: 1,
  },
  follow: {
    width: 80,
    // borderBottomColor: "red",
    // borderBottomWidth: 1,
    color: GlobalStyles.colors.primary50,
    paddingVertical: 6,
    textAlign: "center",
    backgroundColor: "transparent",
  },
  pressed: {
    opacity: 0.6,
  },
});
