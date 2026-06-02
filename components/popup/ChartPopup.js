import React from "react";
import { View, Text, StyleSheet, Pressable } from "react-native";
import { Ionicons } from "@expo/vector-icons";

import { GlobalStyles } from "../../constants/styles";
import { ExpenseStore } from "../../store/context";
import { useLanguage } from "../../store/languageContext";

const ICONS = {
  weekly: "calendar-outline",
  monthly: "today-outline",
  yearly: "time-outline",
  total: "stats-chart-outline",
};

const ChartPopup = ({ data, setIsPopup, currentValue, onSelect }) => {
  const { setValueSelectChart } = ExpenseStore();
  const { t } = useLanguage();

  return (
    <View style={styles.container}>
      {data.map((i, index) => {
        const isActive = currentValue === i;
        return (
          <Pressable
            key={i}
            style={({ pressed }) => [
              styles.item,
              index !== data.length - 1 && styles.divider,
              isActive && styles.itemActive,
              pressed && styles.pressed,
            ]}
            onPress={() => {
              setValueSelectChart(i);
              setIsPopup(false);
              onSelect?.(i);
            }}
          >
            <Ionicons
              name={ICONS[i] || "ellipse-outline"}
              size={18}
              color={isActive ? GlobalStyles.colors.primary500 : "#555"}
            />
            <Text style={[styles.text, isActive && styles.textActive]}>
              {t(i)}
            </Text>
            {isActive && (
              <Ionicons
                name="checkmark"
                size={18}
                color={GlobalStyles.colors.primary500}
                style={styles.check}
              />
            )}
          </Pressable>
        );
      })}
    </View>
  );
};

export default ChartPopup;

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    right: 0,
    top: 55,
    minWidth: 150,
    backgroundColor: "#fff",
    paddingVertical: 6,
    borderRadius: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.18,
    shadowRadius: 8,
    elevation: 6,
    zIndex: 10,
  },
  item: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
    paddingHorizontal: 14,
    gap: 10,
  },
  divider: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "#eee",
  },
  itemActive: {
    backgroundColor: GlobalStyles.colors.primary50,
  },
  text: {
    flex: 1,
    fontSize: 14,
    color: "#333",
    textTransform: "capitalize",
  },
  textActive: {
    color: GlobalStyles.colors.primary500,
    fontWeight: "600",
  },
  check: {
    marginLeft: 6,
  },
  pressed: {
    opacity: 0.65,
  },
});
