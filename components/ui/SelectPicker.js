import { useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";

import ChartPopup from "../popup/ChartPopup";
import { GlobalStyles } from "../../constants/styles";
import { ExpenseStore } from "../../store/context";
import { useLanguage } from "../../store/languageContext";

const { colors, spacing, radius } = GlobalStyles;

const EXPENSE = ["weekly", "monthly", "yearly", "total"];
const TODO = ["weekly", "monthly", "yearly"];

const SelectPicker = ({ mode, onSelect }) => {
  const { valueSelectChart } = ExpenseStore();
  const { t } = useLanguage();
  const [isPopup, setIsPopup] = useState(false);

  return (
    <>
      <Pressable
        onPress={() => setIsPopup((open) => !open)}
        accessibilityRole="button"
        accessibilityState={{ expanded: isPopup }}
        style={({ pressed }) => [styles.trigger, pressed && styles.pressed]}
      >
        <Text style={styles.text}>{t(valueSelectChart)}</Text>
        <Ionicons
          name={isPopup ? "chevron-up" : "chevron-down"}
          size={15}
          color={colors.onPrimary}
        />
      </Pressable>

      {isPopup && (
        <ChartPopup
          data={mode === "todo" ? TODO : EXPENSE}
          currentValue={valueSelectChart}
          setIsPopup={setIsPopup}
          onSelect={onSelect}
        />
      )}
    </>
  );
};

export default SelectPicker;

const styles = StyleSheet.create({
  trigger: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: spacing[1] + 2,
    minHeight: 32,
    marginRight: spacing[4],
    paddingVertical: spacing[1] + 2,
    paddingHorizontal: spacing[3],
    borderRadius: radius.full,
    backgroundColor: "rgba(255,255,255,0.18)",
  },
  text: {
    color: colors.onPrimary,
    textTransform: "capitalize",
    fontSize: 13.5,
    fontWeight: "600",
  },
  pressed: {
    opacity: 0.7,
  },
});
