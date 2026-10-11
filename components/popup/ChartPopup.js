import { Pressable, StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";

import { GlobalStyles } from "../../constants/styles";
import { ExpenseStore } from "../../store/context";
import { useLanguage } from "../../store/languageContext";

const { colors, spacing, radius, type } = GlobalStyles;

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
    <View style={styles.sheet}>
      {data.map((item, index) => {
        const isActive = currentValue === item;
        return (
          <Pressable
            key={item}
            accessibilityRole="menuitem"
            accessibilityState={{ selected: isActive }}
            style={({ pressed }) => [
              styles.item,
              index !== data.length - 1 && styles.divider,
              pressed && styles.pressed,
            ]}
            onPress={() => {
              setValueSelectChart(item);
              setIsPopup(false);
              onSelect?.(item);
            }}
          >
            <Ionicons
              name={ICONS[item] || "ellipse-outline"}
              size={18}
              color={isActive ? colors.primary : colors.textMuted}
            />
            <Text style={[styles.text, isActive && styles.textActive]}>
              {t(item)}
            </Text>
            {isActive && (
              <Ionicons name="checkmark" size={18} color={colors.primary} />
            )}
          </Pressable>
        );
      })}
    </View>
  );
};

export default ChartPopup;

const styles = StyleSheet.create({
  sheet: {
    position: "absolute",
    right: spacing[4],
    top: 52,
    minWidth: 172,
    backgroundColor: colors.surface,
    paddingVertical: spacing[1],
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    zIndex: 10,
    ...GlobalStyles.shadow.lg,
  },
  item: {
    flexDirection: "row",
    alignItems: "center",
    minHeight: 44,
    paddingVertical: spacing[2],
    paddingHorizontal: spacing[3] + 2,
    gap: spacing[3],
  },
  divider: {
    borderBottomWidth: 1,
    borderBottomColor: colors.n100,
  },
  text: {
    flex: 1,
    ...type.body,
    color: colors.textBody,
    textTransform: "capitalize",
  },
  textActive: {
    color: colors.primary,
    fontWeight: "600",
  },
  pressed: {
    backgroundColor: colors.surfaceAlt,
  },
});
