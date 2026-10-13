import { useState } from "react";
import {
  ActivityIndicator,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";

import CategoryAvatar from "../ui/CategoryAvatar";
import PrimaryButton from "../ui/PrimaryButton";
import { GlobalStyles } from "../../constants/styles";
import { useLanguage } from "../../store/languageContext";

const { colors, spacing, radius, type } = GlobalStyles;

// Asked before deleting something that transactions still point at.
//
// Deleting used to silently orphan those records: the row vanished from the
// list but its money kept showing up under "not in your account list". This
// states the consequence first (Nielsen #5) and offers the way out — move the
// transactions somewhere else — with keeping them as the explicit alternative.
const ReassignSheet = ({
  visible,
  itemName,
  usageCount,
  options,
  busy,
  onCancel,
  onDeleteOnly,
  onReassign,
  // Lets the same sheet serve two jobs: confirming a delete, and cleaning up
  // transactions left behind by one that already happened.
  title,
  message,
  primaryLabel,
  secondaryLabel,
  busyLabel,
}) => {
  const insets = useSafeAreaInsets();
  const { t } = useLanguage();
  const [target, setTarget] = useState(null);

  const close = () => {
    setTarget(null);
    onCancel();
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={close}
    >
      <View style={styles.overlay}>
        <Pressable style={styles.backdrop} onPress={busy ? undefined : close} />

        <View style={[styles.sheet, { paddingBottom: spacing[4] + insets.bottom }]}>
          <View style={styles.handle} />

          <View style={styles.header}>
            <View style={styles.warnIcon}>
              <Ionicons
                name="alert-circle-outline"
                size={22}
                color={colors.warningText}
              />
            </View>
            <View style={styles.headerText}>
              <Text style={styles.title}>
                {title ?? `${t("delete")} “${itemName}”`}
              </Text>
              <Text style={styles.subtitle}>
                {message ?? t("in_use_warning", { count: usageCount })}
              </Text>
            </View>
          </View>

          <Text style={styles.sectionLabel}>{t("move_to")}</Text>

          <ScrollView style={styles.list} keyboardShouldPersistTaps="handled">
            {options.map((option) => {
              const active = target === option.name;
              return (
                <Pressable
                  key={option.id ?? option.name}
                  onPress={() => setTarget(option.name)}
                  disabled={busy}
                  accessibilityRole="radio"
                  accessibilityState={{ selected: active }}
                  style={({ pressed }) => [
                    styles.option,
                    active && styles.optionActive,
                    pressed && styles.pressed,
                  ]}
                >
                  <CategoryAvatar
                    name={option.name}
                    icon={option.icon}
                    size={32}
                  />
                  <Text style={styles.optionName} numberOfLines={1}>
                    {option.name}
                  </Text>
                  <Ionicons
                    name={active ? "radio-button-on" : "radio-button-off"}
                    size={19}
                    color={active ? colors.primary : colors.border}
                  />
                </Pressable>
              );
            })}

            {!options.length && (
              <Text style={styles.noOptions}>{t("no_other_items")}</Text>
            )}
          </ScrollView>

          {busy ? (
            <View style={styles.busy}>
              <ActivityIndicator color={colors.primary} />
              <Text style={styles.busyText}>
                {busyLabel ?? t("moving_transactions")}
              </Text>
            </View>
          ) : (
            <View style={styles.actions}>
              <PrimaryButton
                onPress={() => onReassign(target)}
                disabled={!target}
              >
                {primaryLabel ?? t("move_and_delete")}
              </PrimaryButton>

              {!!onDeleteOnly && (
                <PrimaryButton mode="dangerGhost" onPress={onDeleteOnly}>
                  {secondaryLabel ?? t("delete_keep_transactions")}
                </PrimaryButton>
              )}

              <PrimaryButton mode="ghost" onPress={close}>
                {t("cancel")}
              </PrimaryButton>
            </View>
          )}
        </View>
      </View>
    </Modal>
  );
};

export default ReassignSheet;

const styles = StyleSheet.create({
  overlay: { ...StyleSheet.absoluteFillObject, justifyContent: "flex-end" },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(17,24,39,0.45)",
  },
  sheet: {
    maxHeight: "85%",
    backgroundColor: colors.surface,
    borderTopLeftRadius: radius.lg + 4,
    borderTopRightRadius: radius.lg + 4,
    ...GlobalStyles.shadow.lg,
  },
  handle: {
    alignSelf: "center",
    width: 40,
    height: 4,
    borderRadius: radius.full,
    backgroundColor: colors.border,
    marginTop: spacing[2],
    marginBottom: spacing[3],
  },
  header: {
    flexDirection: "row",
    gap: spacing[3],
    paddingHorizontal: spacing[4],
    marginBottom: spacing[4],
  },
  warnIcon: {
    width: 40,
    height: 40,
    borderRadius: radius.full,
    backgroundColor: colors.warningSurface,
    alignItems: "center",
    justifyContent: "center",
  },
  headerText: { flex: 1, minWidth: 0 },
  title: { ...type.h3, color: colors.text },
  subtitle: {
    ...type.caption,
    color: colors.textBody,
    marginTop: 2,
  },
  sectionLabel: {
    ...type.label,
    color: colors.textMuted,
    paddingHorizontal: spacing[4],
    marginBottom: spacing[2],
  },
  list: {
    flexGrow: 0,
    paddingHorizontal: spacing[4],
  },
  option: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing[3],
    minHeight: 52,
    paddingHorizontal: spacing[3],
    marginBottom: spacing[2],
    borderRadius: radius.md,
    borderWidth: 1.5,
    borderColor: colors.border,
  },
  optionActive: {
    borderColor: colors.primary,
    backgroundColor: colors.primarySurface,
  },
  optionName: { flex: 1, minWidth: 0, ...type.body, color: colors.text },
  noOptions: {
    ...type.caption,
    color: colors.textMuted,
    paddingVertical: spacing[4],
    textAlign: "center",
  },
  actions: {
    gap: spacing[2],
    paddingHorizontal: spacing[4],
    paddingTop: spacing[3],
  },
  busy: {
    alignItems: "center",
    gap: spacing[2],
    paddingVertical: spacing[5],
  },
  busyText: { ...type.caption, color: colors.textMuted },
  pressed: { opacity: 0.7 },
});
