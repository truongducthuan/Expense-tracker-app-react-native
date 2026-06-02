import React from "react";
import { Pressable, StyleSheet, View, Text } from "react-native";
import { Ionicons } from "@expo/vector-icons";

import { GlobalStyles } from "../../constants/styles";

const HeaderTime = ({
  currTimeValue,
  valueSelect,
  currTimeLabel,
  setCurrTimeValue,
}) => {
  const period = valueSelect.toLowerCase();

  const isPrevDisabled =
    period === "weekly" ||
    ((period === "monthly" || period === "yearly") && currTimeValue <= 1);

  const isNextDisabled = (() => {
    const date = new Date();
    if (period === "weekly") return true;
    if (period === "monthly") return currTimeValue >= date.getMonth() + 1;
    if (period === "yearly") return currTimeValue >= date.getFullYear();
    return false;
  })();

  const handlePrev = () => {
    if (isPrevDisabled) return;
    setCurrTimeValue((state) => state - 1);
  };

  const handleNext = () => {
    if (isNextDisabled) return;
    setCurrTimeValue((state) => state + 1);
  };

  return (
    <View style={styles.header}>
      <Pressable
        onPress={handlePrev}
        disabled={isPrevDisabled}
        style={({ pressed }) => [
          styles.iconBtn,
          isPrevDisabled && styles.iconBtnDisabled,
          pressed && !isPrevDisabled && styles.pressed,
        ]}
      >
        <Ionicons name="chevron-back" size={18} color="#fff" />
      </Pressable>

      <View style={styles.timeWrap}>
        <Text style={styles.time}>
          {currTimeLabel}
          <Text style={styles.timeSep}> · </Text>
          <Text style={styles.timeValue}>{currTimeValue}</Text>
        </Text>
      </View>

      <Pressable
        onPress={handleNext}
        disabled={isNextDisabled}
        style={({ pressed }) => [
          styles.iconBtn,
          isNextDisabled && styles.iconBtnDisabled,
          pressed && !isNextDisabled && styles.pressed,
        ]}
      >
        <Ionicons name="chevron-forward" size={18} color="#fff" />
      </Pressable>
    </View>
  );
};

export default HeaderTime;

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  iconBtn: {
    width: 20,
    height: 20,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    // backgroundColor: "rgba(255,255,255,0.12)",
  },
  iconBtnDisabled: {
    opacity: 0,
  },
  timeWrap: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 14,
    backgroundColor: "rgba(255,255,255,0.12)",
    minWidth: 60,
    alignItems: "center",
  },
  time: {
    color: GlobalStyles.colors.primary50,
    fontSize: 15,
    fontWeight: "500",
    textTransform: "capitalize",
  },
  timeSep: {
    color: "rgba(255,255,255,0.55)",
    fontWeight: "400",
  },
  timeValue: {
    color: "#fff",
    fontWeight: "700",
  },
  pressed: {
    opacity: 0.6,
  },
});
