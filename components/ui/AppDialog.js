import { Modal, Pressable, StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";

import PrimaryButton from "./PrimaryButton";
import { GlobalStyles } from "../../constants/styles";

const { colors, spacing, radius, type } = GlobalStyles;

// Tone decides the icon and its tint. Keeping it to a small set stops dialogs
// drifting into arbitrary colours, and matches the status palette used by the
// budget rows.
const TONES = {
  info: { icon: "information-circle", tint: colors.info, surface: colors.infoSurface },
  warning: { icon: "alert-circle", tint: colors.warningText, surface: colors.warningSurface },
  danger: { icon: "trash", tint: colors.expenseText, surface: colors.expenseSurface },
  success: { icon: "checkmark-circle", tint: colors.incomeText, surface: colors.incomeSurface },
};

// The app's dialog. Replaces Alert.alert, which renders the OS widget and
// ignores the design system entirely — different shape, type and colour on
// each platform, and no way to mark the destructive choice consistently.
//
// Rendered by DialogProvider; screens never mount this directly, they call
// `useDialog()`.
const AppDialog = ({
  visible,
  title,
  message,
  tone = "info",
  confirmLabel,
  cancelLabel,
  destructive = false,
  onConfirm,
  onCancel,
}) => {
  const palette = TONES[destructive ? "danger" : tone] || TONES.info;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      // Android back button and iOS swipe both resolve as a cancel, so the
      // promise never dangles.
      onRequestClose={onCancel}
    >
      <View style={styles.overlay}>
        <Pressable style={styles.backdrop} onPress={onCancel} />

        <View style={styles.card} accessibilityViewIsModal accessibilityRole="alert">
          <View style={[styles.iconWrap, { backgroundColor: palette.surface }]}>
            <Ionicons name={palette.icon} size={24} color={palette.tint} />
          </View>

          {!!title && <Text style={styles.title}>{title}</Text>}
          {!!message && <Text style={styles.message}>{message}</Text>}

          <View style={styles.actions}>
            <PrimaryButton
              mode={destructive ? "destructive" : "primary"}
              onPress={onConfirm}
            >
              {confirmLabel}
            </PrimaryButton>

            {/* A dialog with no cancel is an acknowledgement, not a choice. */}
            {!!cancelLabel && (
              <PrimaryButton mode="secondary" onPress={onCancel}>
                {cancelLabel}
              </PrimaryButton>
            )}
          </View>
        </View>
      </View>
    </Modal>
  );
};

export default AppDialog;

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    alignItems: "center",
    justifyContent: "center",
    padding: spacing[5],
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(17,24,39,0.45)",
  },
  card: {
    width: "100%",
    maxWidth: 340,
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing[5],
    alignItems: "center",
    ...GlobalStyles.shadow.lg,
  },
  iconWrap: {
    width: 56,
    height: 56,
    borderRadius: radius.full,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: spacing[3],
  },
  title: {
    ...type.h3,
    color: colors.text,
    textAlign: "center",
  },
  message: {
    ...type.body,
    color: colors.textMuted,
    textAlign: "center",
    marginTop: spacing[2],
  },
  actions: {
    width: "100%",
    gap: spacing[2],
    marginTop: spacing[5],
  },
});
