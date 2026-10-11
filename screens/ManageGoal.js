import { useLayoutEffect, useState } from "react";
import { Alert, ScrollView, StyleSheet, Text, View } from "react-native";

import Card from "../components/ui/Card";
import PrimaryInput from "../components/ui/PrimaryInput";
import PrimaryButton from "../components/ui/PrimaryButton";
import ProgressBar from "../components/ui/ProgressBar";
import { GlobalStyles } from "../constants/styles";
import { GoalStore } from "../store/goalContext";
import { useLanguage } from "../store/languageContext";
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
  const { money, symbol } = useMoney();
  const { goals, addGoal, editGoal, removeGoal } = GoalStore();

  const existing = goals.find((g) => g.id === goalId);
  const progress = existing ? computeGoalProgress(existing) : null;

  const [name, setName] = useState(existing?.name || "");
  const [target, setTarget] = useState(
    existing ? String(existing.target) : ""
  );
  const [deposit, setDeposit] = useState("");

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
        await updateGoalDB(goalId, name.trim(), numericTarget, null);
        editGoal({ name: name.trim(), target: numericTarget }, goalId);
      } else {
        const id = await addGoalDB(name.trim(), numericTarget, null);
        addGoal({
          id,
          name: name.trim(),
          target: numericTarget,
          saved: 0,
          deadline: null,
          createdAt: new Date().toISOString(),
        });
      }
      navigation.goBack();
    } catch (err) {
      console.error(err);
      Alert.alert(t("error_occurred"), t("could_not_save"));
    }
  };

  const handleDelete = () => {
    Alert.alert(t("delete_goal"), t("delete_goal_confirm"), [
      { text: t("cancel"), style: "cancel" },
      {
        text: t("delete"),
        style: "destructive",
        onPress: async () => {
          try {
            await deleteGoalDB(goalId);
            removeGoal(goalId);
            navigation.goBack();
          } catch (err) {
            console.error(err);
          }
        },
      },
    ]);
  };

  return (
    <View style={styles.root}>
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
    </View>
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
