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

import PrimaryInput from "../components/ui/PrimaryInput";
import PrimaryButton from "../components/ui/PrimaryButton";
import Card from "../components/ui/Card";
import CategoryAvatar from "../components/ui/CategoryAvatar";
import { ICON_CHOICES } from "../constants/categoryIcons";
import { CategoryStore } from "../store/categoryContext";
import Loading from "../components/ui/Loading";
import ErrorOverlay from "../components/ui/ErrorOverlay";
import { AccountStore } from "../store/accountContext";
import { GlobalStyles } from "../constants/styles";
import {
  addAccountDB,
  addExpenseCategory,
  addIncomeCategory,
  updateAccountDB,
  updateExpenseCategory,
  updateIncomeCategory,
} from "../util/database";
import { CategoryIncomeStore } from "../store/incomeCategory";
import { useLanguage } from "../store/languageContext";
import { useDialog } from "../store/dialogContext";
import { useSync } from "../store/syncContext";

const { colors, spacing, radius, type } = GlobalStyles;

// SQLite raises "UNIQUE constraint failed" when inserting/renaming to a name
// that already exists in the table.
const isDuplicateError = (err) =>
  typeof err?.message === "string" && err.message.includes("UNIQUE");

const AddManageItem = ({ route, navigation }) => {
  const storeContext = CategoryStore();
  const { accounts, addAccount, editAccount } = AccountStore();
  const { categoriesIncome, addCategoriesIncome, editCategoriesIncome } =
    CategoryIncomeStore();
  const { t, lang } = useLanguage();
  const { alert } = useDialog();
  const { publish } = useSync();

  const [valueInput, setValueInput] = useState("");
  const [icon, setIcon] = useState(null);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const name = route.params.name;
  const id = route.params?.id;

  // Renaming used to start from an empty field, so the user had to remember
  // what they were editing. Prefill it from the list being edited
  // (Nielsen #6 — recognition rather than recall).
  useLayoutEffect(() => {
    if (!id) return;
    const source =
      name === "ChangeExpense"
        ? storeContext.categories
        : name === "ChangeIncome"
        ? categoriesIncome
        : name === "ChangeAccount"
        ? accounts
        : null;
    const current = source?.find((item) => item.id === id);
    if (current?.name) setValueInput(current.name);
    if (current?.icon) setIcon(current.icon);
  }, [id, name]);

  useLayoutEffect(() => {
    const nameHeader = () => {
      if (name === "ManageCategoryIncome") return t("add_income_category");
      if (name === "ChangeExpense") return t("change_expense_category");
      if (name === "ManageCategoryExpense") return t("add_expense_category");
      if (name === "ChangeIncome") return t("change_income_category");
      if (name === "ManageAccount") return t("add_account");
      return t("change_account");
    };
    navigation.setOptions({
      title: nameHeader(),
    });
  }, [name, t]);

  const handleChange = async () => {
    if (!valueInput.trim().length || !name) {
      alert({ title: t("invalid_input"), message: t("please_check_input"), tone: "warning" });
      return;
    }

    setIsLoading(true);
    try {
      if (name === "ManageCategoryIncome") {
        const newId = await addIncomeCategory(valueInput, lang, icon);
        addCategoriesIncome({ name: valueInput, id: newId, icon });
      } else if (name === "ManageCategoryExpense") {
        const newId = await addExpenseCategory(valueInput, lang, icon);
        storeContext.addCategory({ name: valueInput, id: newId, icon });
      } else if (name === "ChangeExpense") {
        await updateExpenseCategory(valueInput, id, icon);
        storeContext.editCategory({ name: valueInput, icon }, id);
      } else if (name === "ChangeIncome") {
        await updateIncomeCategory(valueInput, id, icon);
        editCategoriesIncome({ name: valueInput, icon }, id);
      } else if (name === "ChangeAccount") {
        await updateAccountDB(valueInput, id, icon);
        editAccount({ name: valueInput, icon }, id);
      } else if (name === "ManageAccount") {
        const newId = await addAccountDB(valueInput, lang, icon);
        addAccount({ name: valueInput, id: newId, icon });
      }
      const table = name.includes("Income")
        ? "categories_income"
        : name.includes("Expense")
        ? "categories_expense"
        : "accounts";
      publish(table);
      // Adding a name clears its tombstone. That has to travel too: a leftover
      // tombstone on the account would delete the row again on the next sync.
      publish(`${table}_removed`);
      navigation.goBack();
    } catch (err) {
      if (isDuplicateError(err)) {
        alert({
          title: t("duplicate_name"),
          message: t("name_already_exists"),
          tone: "warning",
        });
      } else {
        setError(t("could_not_save"));
        console.error(err);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleError = () => {
    setError(null);
  };

  if (error && !isLoading) {
    return <ErrorOverlay message={error} onPress={handleError} />;
  }

  if (isLoading) {
    return <Loading message={t("saving")} />;
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <ScrollView
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
      >
        <Card>
          {/* Preview sits next to the field so the chosen icon is seen the
              way it will appear in the transaction list. */}
          <View style={styles.previewRow}>
            <CategoryAvatar name={valueInput} icon={icon} size={46} />
            <PrimaryInput
              label={t("name")}
              style={styles.input}
              value={valueInput}
              placeholder={t("name")}
              textInputConfig={{
                onChangeText: setValueInput,
                autoFocus: !id,
                returnKeyType: "done",
                onSubmitEditing: handleChange,
              }}
            />
          </View>
        </Card>

        <View style={styles.section}>
          <View style={styles.sectionHead}>
            <Text style={styles.label}>{t("icon")}</Text>
            {!!icon && (
              <Pressable
                onPress={() => setIcon(null)}
                hitSlop={8}
                accessibilityRole="button"
                style={({ pressed }) => pressed && styles.pressed}
              >
                <Text style={styles.clear}>{t("clear_icon")}</Text>
              </Pressable>
            )}
          </View>

          <Card>
            <View style={styles.iconGrid}>
              {ICON_CHOICES.map((choice) => {
                const active = icon === choice;
                return (
                  <Pressable
                    key={choice}
                    onPress={() => setIcon(choice)}
                    accessibilityRole="button"
                    accessibilityLabel={choice}
                    accessibilityState={{ selected: active }}
                    style={({ pressed }) => [
                      styles.iconCell,
                      active && styles.iconCellActive,
                      pressed && styles.pressed,
                    ]}
                  >
                    <Ionicons
                      name={choice}
                      size={21}
                      color={active ? colors.onPrimary : colors.textBody}
                    />
                  </Pressable>
                );
              })}
            </View>
            <Text style={styles.hint}>{t("icon_optional_hint")}</Text>
          </Card>
        </View>
      </ScrollView>

      <View style={styles.actionBar}>
        <PrimaryButton
          onPress={handleChange}
          disabled={!valueInput.trim().length}
        >
          {t("save")}
        </PrimaryButton>
      </View>
    </KeyboardAvoidingView>
  );
};

export default AddManageItem;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.screen,
  },
  content: {
    padding: spacing[4],
    gap: spacing[4],
    paddingBottom: spacing[5],
  },
  previewRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing[3],
  },
  input: {
    flex: 1,
    marginVertical: 0,
  },
  section: {
    gap: spacing[2],
  },
  sectionHead: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: spacing[1],
  },
  label: {
    ...type.label,
    color: colors.textMuted,
  },
  clear: {
    fontSize: 12.5,
    fontWeight: "600",
    color: colors.primary,
  },
  iconGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing[2],
  },
  iconCell: {
    width: 46,
    height: 46,
    borderRadius: radius.md,
    borderWidth: 1.5,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    alignItems: "center",
    justifyContent: "center",
  },
  iconCellActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  hint: {
    ...type.caption,
    fontSize: 12,
    color: colors.textMuted,
    marginTop: spacing[3],
  },
  actionBar: {
    paddingHorizontal: spacing[4],
    paddingTop: spacing[3],
    paddingBottom: spacing[4],
    backgroundColor: colors.surface,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  pressed: {
    opacity: 0.6,
  },
});
