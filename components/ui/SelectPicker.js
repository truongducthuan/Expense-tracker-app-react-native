import { useState } from "react";
import { View, StyleSheet, Text, Pressable } from "react-native";
import { Ionicons } from "@expo/vector-icons";

import ChartPopup from "../popup/ChartPopup";
import { GlobalStyles } from "../../constants/styles";
import { ExpenseStore } from "../../store/context";
import { useLanguage } from "../../store/languageContext";

const EXPENSE = ["weekly", "monthly", "yearly", "total"];
const TODO = ["weekly", "monthly", "yearly"];

const SelectPicker = ({ mode, onSelect }) => {
  const { valueSelectChart } = ExpenseStore();
  const { t } = useLanguage();
  const [isPopup, setIsPopup] = useState(false);

  const showPopup = () => {
    setIsPopup(!isPopup);
  };

  return (
    <>
      <View>
        <Pressable
          onPress={showPopup}
          style={({ pressed }) => [styles.container, pressed && styles.pressed]}
        >
          <Text style={styles.text}>{t(valueSelectChart)}</Text>
          <Ionicons
            name={isPopup ? "chevron-up" : "chevron-down"}
            size={16}
            color="#fff"
          />
        </Pressable>
      </View>
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
  container: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 6,
    height: 28,
    minWidth: 80,
    borderWidth: 1,
    borderColor: GlobalStyles.colors.primary50,
    marginRight: 24,
    borderRadius: 6,
    paddingVertical: 2,
    paddingHorizontal: 10,
  },
  text: {
    color: "#fff",
    textTransform: "capitalize",
    fontSize: 14,
  },
  header: {
    fontSize: 32,
    backgroundColor: "#fff",
  },
  pressed: {
    opacity: 0.6,
  },
});
