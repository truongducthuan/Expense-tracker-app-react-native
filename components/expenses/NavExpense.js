import { Pressable, StyleSheet, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";

import { GlobalStyles } from "../../constants/styles";

const TABS = [
  { type: "expense", icon: "trending-down-outline", color: "#e53935" },
  { type: "income", icon: "trending-up-outline", color: "#2e9e0a" },
  { type: "transfer", icon: "swap-horizontal", color: "#1e88e5" },
];

const NavExpense = ({ onPress, titleName }) => {
  return (
    <View style={styles.nav}>
      {TABS.map(({ type, icon, color }) => {
        const active = titleName === type;
        return (
          <Pressable
            key={type}
            onPress={() => onPress(type)}
            style={({ pressed }) => [
              styles.button,
              { backgroundColor: active ? color : GlobalStyles.colors.primary50 },
              pressed && styles.pressed,
            ]}
          >
            <Ionicons name={icon} size={24} color={active ? "#fff" : color} />
          </Pressable>
        );
      })}
    </View>
  );
};

export default NavExpense;

const styles = StyleSheet.create({
  nav: {
    flexDirection: "row",
    justifyContent: "space-between",
    backgroundColor: GlobalStyles.colors.primary800,
    paddingHorizontal: 32,
    paddingTop: 8,
  },
  button: {
    flex: 1,
    marginHorizontal: 6,
    paddingVertical: 8,
    borderRadius: 8,
    alignItems: "center",
    backgroundColor: GlobalStyles.colors.primary50,
  },
  pressed: {
    opacity: 0.6,
  },
});
