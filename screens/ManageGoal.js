import { useLayoutEffect, useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

import Card from "../components/ui/Card";
import PrimaryInput from "../components/ui/PrimaryInput";
import PrimaryButton from "../components/ui/PrimaryButton";
import ProgressBar from "../components/ui/ProgressBar";
import { GlobalStyles } from "../constants/styles";
import { GoalStore } from "../store/goalContext";
import { AccountStore } from "../store/accountContext";
import { useLanguage } from "../store/languageContext";
import { useDialog } from "../store/dialogContext";
import { useSync } from "../store/syncContext";
import CategoryAvatar from "../components/ui/CategoryAvatar";
import {
  addGoalDB,
  updateGoalDB,
  deleteGoalDB,
  depositGoalDB,
} from "../util/database";
import { formatInput, formatAmount } from "../util/format";
import { computeGoalProgress } from "../util/budget";
import useMoney from "../hooks/useMoney";

const { colors, spacing, type } = GlobalStyles;

const ManageGoal = ({ route, navigation }) => {
  const goalId = route.params?.goalId;
  const mode = route.params?.mode;
  const isEditing = !!goalId;
  const isDeposit = mode === "deposit";

  const { t } = useLanguage();
  const { alert, confirm } = useDialog();
  const { publish } = useSync();
  const { money, symbol } = useMoney();
  const { goals, addGoal, editGoal, removeGoal } = GoalStore();
  const { accounts } = AccountStore();

  const existing = goals.find((g) => g.id === goalId);
  const progress = existing ? computeGoalProgress(existing) : null;

  const [name, setName] = useState(existing?.name || "");
  const [target, setTarget] = useState(
    existing ? String(existing.target) : ""
  );
  const [deposit, setDeposit] = useState("");
  const [account, setAccount] = useState(existing?.account ?? null);

  useLayoutEffect(() => {
    navigation.setOptions({
      title: isDeposit
        ? t("add_money")
        : isEditing
        ? t("edit_goal")
        : t("add_goal"),
    });
  }, [navigation, isEditing, isDeposit, t]);

  const numericTarget = Number(String(target).replace(/\./g, "")) || 0;
  const numericDeposit = Number(String(deposit).replace(/\./g, "")) || 0;

  const canSave = isDeposit
    ? numericDeposit > 0
    : !!name.trim() && numericTarget > 0;

  const handleSave = async () => {
    if (!canSave) return;
    try {
      if (isDeposit) {
        await depositGoalDB(goalId, numericDeposit);
        editGoal({ saved: (existing?.saved || 0) + numericDeposit }, goalId);
      } else if (isEditing) {
        await updateGoalDB(goalId, name.trim(), numericTarget, null, account);
        editGoal({ name: name.trim(), target: numericTarget, account }, goalId);
      } else {
        const id = await addGoalDB(name.trim(), numericTarget, null, account);
        addGoal({
          id,
          name: name.trim(),
          target: numericTarget,
          saved: 0,
          deadline: null,
          createdAt: new Date().toISOString(),
          account,
        });
      }
      publish("goals");
      navigation.goBack();
    } catch (err) {
      console.error(err);
      alert({ title: t("error_occurred"), message: t("could_not_save"), tone: "warning" });
    }
  };

  const handleDelete = async () => {
    const ok = await confirm({
      title: t("delete_goal"),
      message: t("delete_goal_confirm"),
      confirmLabel: t("delete"),
      destructive: true,
    });
    if (!ok) return;
    try {
      await deleteGoalDB(goalId);
      removeGoal(goalId);
      publish("goals");
      navigation.goBack();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.root}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <ScrollView
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
      >
        {/* Depositing shows where the goal stands first, so the amount is
            entered with the remaining figure in view. */}
        {isDeposit && progress && (
          <Card style={styles.statusCard}>
            <Text style={styles.goalName}>{progress.name}</Text>
            <Text style={styles.goalAmounts}>
              {t("goal_saved_of", {
                saved: money(progress.saved),
                target: money(progress.target),
              })}
            </Text>
            <ProgressBar ratio={progress.ratio} height={8} />
            <Text style={styles.goalRemaining}>
              {t("remaining")}: {money(progress.remaining)}
            </Text>
          </Card>
        )}

        <Card style={styles.card}>
          {isDeposit ? (
            <>
              <Text style={styles.label}>{t("amount_to_add")}</Text>
              <View style={styles.amountRow}>
                <PrimaryInput
                  bare
                  value={formatAmount(deposit)}
                  placeholder="0"
                  inputStyle={styles.amountInput}
                  style={styles.amountField}
                  textInputConfig={{
                    keyboardType: "decimal-pad",
                    autoFocus: true,
                    onChangeText: (e) => setDeposit(formatInput(e)),
                  }}
                />
                <Text style={styles.currency}>{symbol}</Text>
              </View>
            </>
          ) : (
            <>
              <PrimaryInput
                label={t("goal_name")}
                value={name}
                placeholder={t("goal_name")}
                style={styles.field}
                textInputConfig={{
                  onChangeText: setName,
                  autoFocus: !isEditing,
                }}
              />

              <Text style={styles.label}>{t("goal_target")}</Text>
              <View style={styles.amountRow}>
                <PrimaryInput
                  bare
                  value={formatAmount(target)}
                  placeholder="0"
                  inputStyle={styles.amountInput}
                  style={styles.amountField}
                  textInputConfig={{
                    keyboardType: "decimal-pad",
                    onChangeText: (e) => setTarget(formatInput(e)),
                  }}
                />
                <Text style={styles.currency}>{symbol}</Text>
              </View>
            </>
          )}
        </Card>

        {/* Linking a wallet turns the goal into a live reading of that
            wallet's balance: money moved into it counts automatically, and
            the goal completes when the wallet reaches the target. Optional —
            without a link the goal is topped up by hand. */}
        {!isDeposit && (
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>{t("goal_account")}</Text>

            <Card padded={false}>
              <Pressable
                onPress={() => setAccount(null)}
                accessibilityRole="radio"
                accessibilityState={{ selected: !account }}
                style={({ pressed }) => [
                  styles.walletRow,
                  pressed && styles.pressed,
                ]}
              >
                <View style={styles.manualIcon}>
                  <Ionicons name="hand-left-outline" size={17} color={colors.textMuted} />
                </View>
                <View style={styles.walletText}>
                  <Text style={styles.walletName}>{t("goal_manual")}</Text>
                  <Text style={styles.walletHint}>{t("goal_manual_hint")}</Text>
                </View>
                <Ionicons
                  name={!account ? "radio-button-on" : "radio-button-off"}
                  size={19}
                  color={!account ? colors.primary : colors.border}
                />
              </Pressable>

              {accounts.map((item) => {
                const active = account === item.name;
                return (
                  <Pressable
                    key={item.id}
                    onPress={() => setAccount(item.name)}
                    accessibilityRole="radio"
                    accessibilityState={{ selected: active }}
                    style={({ pressed }) => [
                      styles.walletRow,
                      styles.walletDivided,
                      pressed && styles.pressed,
                    ]}
                  >
                    <CategoryAvatar name={item.name} icon={item.icon} size={32} />
                    <Text style={styles.walletName} numberOfLines={1}>
                      {item.name}
                    </Text>
                    <Ionicons
                      name={active ? "radio-button-on" : "radio-button-off"}
                      size={19}
                      color={active ? colors.primary : colors.border}
                    />
                  </Pressable>
                );
              })}
            </Card>

            {!!account && (
              <Text style={styles.linkNote}>
                {t("goal_account_note", { name: account })}
              </Text>
            )}
          </View>
        )}

        {isEditing && !isDeposit && (
          <PrimaryButton
            mode="dangerGhost"
            icon="trash-outline"
            onPress={handleDelete}
          >
            {t("delete_goal")}
          </PrimaryButton>
        )}
      </ScrollView>

      <View style={styles.actionBar}>
        <PrimaryButton
          style={styles.actionSecondary}
          mode="secondary"
          onPress={() => navigation.goBack()}
        >
          {t("cancel")}
        </PrimaryButton>
        <PrimaryButton
          style={styles.actionPrimary}
          onPress={handleSave}
          disabled={!canSave}
        >
          {t("save")}
        </PrimaryButton>
      </View>
    </KeyboardAvoidingView>
  );
};

export default ManageGoal;

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.screen },
  content: {
    padding: spacing[4],
    paddingBottom: spacing[5],
    gap: spacing[4],
  },
  statusCard: { gap: spacing[2] },
  goalName: { ...type.h3, color: colors.text },
  goalAmounts: { ...type.caption, color: colors.textMuted },
  goalRemaining: { ...type.caption, color: colors.textBody },
  card: { gap: spacing[1] },
  section: { gap: spacing[2] },
  sectionLabel: { ...type.label, color: colors.textMuted },
  walletRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing[3],
    minHeight: 56,
    paddingHorizontal: spacing[4],
    paddingVertical: spacing[2],
  },
  walletDivided: {
    borderTopWidth: 1,
    borderTopColor: colors.n100,
  },
  walletText: { flex: 1, minWidth: 0 },
  walletName: { flex: 1, minWidth: 0, ...type.body, color: colors.text },
  walletHint: { ...type.caption, fontSize: 12, color: colors.textMuted },
  manualIcon: {
    width: 32,
    height: 32,
    borderRadius: 10,
    backgroundColor: colors.surfaceAlt,
    alignItems: "center",
    justifyContent: "center",
  },
  linkNote: {
    ...type.caption,
    fontSize: 12,
    color: colors.primary,
    paddingHorizontal: spacing[1],
  },
  pressed: { opacity: 0.7 },
  field: { marginTop: 0 },
  label: { ...type.label, color: colors.textMuted, marginTop: spacing[2] },
  amountRow: { flexDirection: "row", alignItems: "center", gap: spacing[2] },
  amountField: { flex: 1, marginVertical: 0 },
  amountInput: { ...type.display, fontSize: 32, color: colors.text },
  currency: { ...type.h2, fontWeight: "700", color: colors.text },
  actionBar: {
    flexDirection: "row",
    gap: spacing[3],
    paddingHorizontal: spacing[4],
    paddingTop: spacing[3],
    paddingBottom: spacing[4],
    backgroundColor: colors.surface,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  actionSecondary: { flex: 1 },
  actionPrimary: { flex: 1.4 },
});
