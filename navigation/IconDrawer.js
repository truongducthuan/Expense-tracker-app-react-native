import { Pressable, StyleSheet } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";

import { GlobalStyles } from "../constants/styles";

const { colors, spacing, radius } = GlobalStyles;

const IconDrawer = () => {
  const navigation = useNavigation();

  return (
    <Pressable
      onPress={() => navigation.openDrawer()}
      hitSlop={8}
      accessibilityRole="button"
      accessibilityLabel="Open menu"
      style={({ pressed }) => [styles.button, pressed && styles.pressed]}
    >
      <Ionicons name="menu" color={colors.onPrimary} size={22} />
    </Pressable>
  );
};

export default IconDrawer;

const styles = StyleSheet.create({
  button: {
    width: 38,
    height: 38,
    marginLeft: spacing[4],
    borderRadius: radius.full,
    alignItems: "center",
    justifyContent: "center",
  },
  pressed: {
    backgroundColor: "rgba(255,255,255,0.18)",
  },
});
