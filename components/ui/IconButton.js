import { Pressable, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";

import { GlobalStyles } from "../../constants/styles";

const { spacing, radius } = GlobalStyles;

// Header/inline icon button. The touch target is 40×40 plus hit slop so it
// clears the 44pt minimum (WCAG 2.5.5) without the icon itself growing.
const IconButton = ({ icon, size = 22, color, onPress, accessibilityLabel }) => (
  <Pressable
    onPress={onPress}
    hitSlop={8}
    accessibilityRole="button"
    accessibilityLabel={accessibilityLabel || icon}
    style={({ pressed }) => [styles.button, pressed && styles.pressed]}
  >
    <Ionicons name={icon} size={size} color={color} />
  </Pressable>
);

export default IconButton;

const styles = StyleSheet.create({
  button: {
    width: 40,
    height: 40,
    marginHorizontal: spacing[2],
    borderRadius: radius.full,
    alignItems: "center",
    justifyContent: "center",
  },
  pressed: {
    backgroundColor: "rgba(255,255,255,0.18)",
  },
});
