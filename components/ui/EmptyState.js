import { Pressable, StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";

import { GlobalStyles } from "../../constants/styles";

const { colors, spacing, radius, type } = GlobalStyles;

// Empty states always offer a way out of the empty state (Nielsen #9) — pass
// `actionLabel`/`onAction` whenever the user can create the missing data.
const EmptyState = ({
  icon = "receipt-outline",
  title,
  message,
  actionLabel,
  onAction,
  style,
}) => (
  <View style={[styles.container, style]}>
    <View style={styles.iconCircle}>
      <Ionicons name={icon} size={30} color={colors.primary} />
    </View>
    {!!title && <Text style={styles.title}>{title}</Text>}
    {!!message && <Text style={styles.message}>{message}</Text>}
    {!!actionLabel && !!onAction && (
      <Pressable
        onPress={onAction}
        style={({ pressed }) => [styles.action, pressed && styles.pressed]}
      >
        <Text style={styles.actionText}>{actionLabel}</Text>
      </Pressable>
    )}
  </View>
);

export default EmptyState;

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: spacing[6] + spacing[4],
    paddingHorizontal: spacing[5],
  },
  iconCircle: {
    width: 64,
    height: 64,
    borderRadius: radius.full,
    backgroundColor: colors.primarySurface,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: spacing[4],
  },
  title: {
    ...type.h3,
    color: colors.text,
    textAlign: "center",
  },
  message: {
    ...type.caption,
    color: colors.textMuted,
    textAlign: "center",
    marginTop: spacing[1] + 2,
    maxWidth: 280,
  },
  action: {
    marginTop: spacing[4],
    backgroundColor: colors.primary,
    borderRadius: radius.md,
    paddingVertical: spacing[3],
    paddingHorizontal: spacing[5],
    minHeight: 44,
    justifyContent: "center",
  },
  actionText: {
    ...type.bodyEmphasis,
    fontWeight: "600",
    color: colors.onPrimary,
  },
  pressed: {
    opacity: 0.8,
  },
});
