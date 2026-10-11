import { Pressable, StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";

import { GlobalStyles } from "../../constants/styles";

const { colors, spacing, radius, type } = GlobalStyles;

// Button variants from the design system:
//   primary (default) · secondary (outline) · flat/ghost · destructive
// `mode="flat"` is kept as an alias for ghost so existing callers keep working.
const PrimaryButton = ({
  children,
  onPress,
  mode = "primary",
  style,
  colorText,
  icon,
  disabled = false,
}) => {
  const variant = mode === "flat" ? "ghost" : mode;

  return (
    <View style={style}>
      <Pressable
        onPress={disabled ? undefined : onPress}
        disabled={disabled}
        accessibilityRole="button"
        accessibilityState={{ disabled }}
        style={({ pressed }) => [
          styles.base,
          VARIANTS[variant]?.container || VARIANTS.primary.container,
          disabled && styles.disabled,
          pressed && !disabled && styles.pressed,
        ]}
      >
        {!!icon && (
          <Ionicons
            name={icon}
            size={18}
            color={
              disabled
                ? colors.textMuted
                : (VARIANTS[variant]?.text || VARIANTS.primary.text).color
            }
          />
        )}
        <Text
          style={[
            styles.label,
            VARIANTS[variant]?.text || VARIANTS.primary.text,
            disabled && styles.labelDisabled,
            colorText === "login" && styles.loginText,
          ]}
        >
          {children}
        </Text>
      </Pressable>
    </View>
  );
};

export default PrimaryButton;

const VARIANTS = {
  primary: {
    container: { backgroundColor: colors.primary },
    text: { color: colors.onPrimary },
  },
  secondary: {
    container: {
      backgroundColor: "transparent",
      borderWidth: 1.5,
      borderColor: colors.primary,
    },
    text: { color: colors.primary },
  },
  ghost: {
    container: { backgroundColor: "transparent" },
    text: { color: colors.textMuted },
  },
  destructive: {
    container: { backgroundColor: colors.expenseText },
    text: { color: colors.onPrimary },
  },
  // Low-emphasis destructive action: red text on a tinted surface, so deleting
  // never competes with the primary action for attention.
  dangerGhost: {
    container: {
      backgroundColor: colors.expenseSurface,
      borderWidth: 1,
      borderColor: "#FBCACB",
    },
    text: { color: colors.expenseText },
  },
};

const styles = StyleSheet.create({
  base: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: spacing[2],
    minHeight: 48,
    paddingVertical: spacing[3],
    paddingHorizontal: spacing[4],
    borderRadius: radius.md,
    borderWidth: 1.5,
    borderColor: "transparent",
  },
  label: {
    ...type.bodyEmphasis,
    fontWeight: "600",
    textAlign: "center",
  },
  disabled: {
    backgroundColor: colors.border,
    borderColor: "transparent",
  },
  labelDisabled: {
    color: colors.textMuted,
  },
  pressed: {
    opacity: 0.8,
  },
  loginText: {
    fontSize: 16,
    fontWeight: "700",
  },
});
