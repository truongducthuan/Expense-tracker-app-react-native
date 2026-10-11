import { useLayoutEffect, useState } from "react";
import { Alert, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, View } from "react-native";

import { GlobalStyles } from "../constants/styles";
import { CATEGORY_TYPE } from "../constants/config";
import PrimaryButton from "../components/ui/PrimaryButton";
import { ExpenseStore } from "../store/context";
import ExpenseForm from "../components/ExpenseForm";
import { storeExpense, updateExpenses, deleteExpenses } from "../api/http";
import Loading from "../components/ui/Loading";
import ErrorOverlay from "../components/ui/ErrorOverlay";
import ManagePopup from "../components/popup/ManagePopup";
import NavExpense from "../components/expenses/NavExpense";
import { AuthStore } from "../store/authContext";
import { useLanguage } from "../store/languageContext";

const { colors, spacing } = GlobalStyles;

const ManageExpense = ({ route, navigation }) => {
  const {
    addExpense,
    deleteExpense,
    updateExpense,
    expenses,
    valueInputCategory,
    valueInputAccount,
    setValueInputCategory,
    setValueInputAccount,
  } = ExpenseStore();
  const { user, isAuthenticated } = AuthStore();
  const { t } = useLanguage();

  const expenseId = route.params?.expenseId;
  const [isLoading, setIsLoading] = useState(false);
  const [isPopup, setIsPopup] = useState(false);
  const [nameHeader, setNameHeader] = useState("");
  const [error, setError] = useState(null);
  const isEditing = !!expenseId;
  const [titleName, setTitleName] = useState(CATEGORY_TYPE.EXPENSE);
  const [expensesInput, setExpensesInput] = useState({
    amount: "",
    date: new Date().toISOString().slice(0, 10),
    category: valueInputCategory ? valueInputCategory : "",
    account: valueInputAccount ? valueInputAccount : "",
    desc: "",
  });

  // Sync the form when the user picks a new category/account from the popup.
  // Skip empty store values so the existing form value (e.g. the original
  // category in edit mode) isn't wiped out.
  useLayoutEffect(() => {
    if (!valueInputCategory) return;
    setExpensesInput((state) => ({ ...state, category: valueInputCategory }));
  }, [valueInputCategory]);

  useLayoutEffect(() => {
    if (!valueInputAccount) return;
    setExpensesInput((state) => ({ ...state, account: valueInputAccount }));
  }, [valueInputAccount]);

  useLayoutEffect(() => {
    if (isEditing && expenseId) {
      const updateItem = expenses.find((e) => e.id === expenseId);
      setTitleName(updateItem.type);
      setExpensesInput((state) => {
        return {
          ...state,
          amount: updateItem.amount.toString(),
          date: updateItem.date.toISOString().slice(0, 10),
          desc: updateItem.desc,
          category: updateItem.category,
          account: updateItem.account,
        };
      });
    }
  }, [navigation, isEditing]);

  useLayoutEffect(() => {
    navigation.setOptions({
      title: isEditing ? t("edit_expense") : t("add_expense"),
    });
  }, [navigation, isEditing]);

  const handleNav = (nav) => {
    setTitleName(nav);
  };

  // Deleting is irreversible here, so it asks first (Nielsen #3 — the prototype
  // offers 5s undo instead; a confirm is the honest equivalent without a
  // queue to undo from).
  const handleDelete = () => {
    Alert.alert(t("delete_expense"), t("delete_expense_confirm"), [
      { text: t("cancel"), style: "cancel" },
      {
        text: t("delete"),
        style: "destructive",
        onPress: async () => {
          setIsLoading(true);
          try {
            await deleteExpenses(expenseId);
            deleteExpense(expenseId);
            navigation.goBack();
          } catch (err) {
            setError(t("could_not_delete"));
          } finally {
            setIsLoading(false);
          }
        },
      },
    ]);
  };

  const cancelhandler = () => {
    navigation.goBack();
  };

  const handleConfirm = async () => {
    setIsPopup(false);
    setIsLoading(true);
    expensesInput.amount = expensesInput.amount.replace(/\./g, '');
    const amountIsValid =
      !isNaN(expensesInput.amount) && +expensesInput.amount > 0;
    const dateIsValid = expensesInput.date.toString() !== "Invalid Date";
    const categoryValid = expensesInput.category.trim().length > 0;
    const accountValid = expensesInput.account.trim().length > 0;

    if (
      amountIsValid &&
      dateIsValid &&
      categoryValid &&
      accountValid &&
      isAuthenticated
    ) {
      if (isEditing) {
        try {
          await updateExpenses(expenseId, {
            ...expensesInput,
            date: new Date(expensesInput.date),
            type: titleName,
            year: new Date(expensesInput.date).getFullYear(),
            user: user.email,
          });
          updateExpense(expenseId, {
            ...expensesInput,
            date: new Date(expensesInput.date),
            type: titleName,
            year: new Date(expensesInput.date).getFullYear(),
            user: user.email,
          });
          setValueInputCategory("");
          setValueInputAccount("");
          navigation.goBack();
        } catch (err) {
          setError(t("could_not_edit"));
        }
      } else {
        try {
          const id = await storeExpense({
            ...expensesInput,
            date: new Date(expensesInput.date),
            type: titleName,
            year: new Date(expensesInput.date).getFullYear(),
            user: user.email,
          });
          const res = {
            ...expensesInput,
            date: new Date(expensesInput.date),
            type: titleName,
            year: new Date(expensesInput.date).getFullYear(),
            user: user.email,
            id,
          };
          addExpense(res);
          setValueInputCategory("");
          setValueInputAccount("");
          navigation.goBack();
        } catch (err) {
          setError(t("could_not_add"));
        }
      }
      setIsLoading(false);
    } else {
      Alert.alert(t("invalid_input"), t("check_values"));
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

  // Save stays disabled until amount, category and account are all set, so the
  // user is stopped before the error rather than after it (Nielsen #5).
  const canSave =
    !!String(expensesInput.amount).replace(/\./g, "").trim() &&
    !!expensesInput.category.trim() &&
    !!expensesInput.account.trim();

  return (
    <View style={styles.root}>
      <KeyboardAvoidingView
        style={styles.root}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        {!isEditing && <NavExpense onPress={handleNav} titleName={titleName} />}

        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.content}
          keyboardShouldPersistTaps="handled"
        >
          <ExpenseForm
            setExpenses={setExpensesInput}
            expenses={expensesInput}
            setIsPopup={setIsPopup}
            setNameHeader={setNameHeader}
            titleName={titleName}
          />

          {isEditing && (
            <PrimaryButton
              mode="dangerGhost"
              icon="trash-outline"
              style={styles.deleteButton}
              onPress={handleDelete}
            >
              {t("delete_expense")}
            </PrimaryButton>
          )}
        </ScrollView>

        {/* Actions pinned to the bottom: the primary action sits in the thumb
            zone rather than scrolling off the top (Fitts's law). */}
        <View style={styles.actionBar}>
          <PrimaryButton
            style={styles.actionSecondary}
            mode="secondary"
            onPress={cancelhandler}
          >
            {t("cancel")}
          </PrimaryButton>
          <PrimaryButton
            style={styles.actionPrimary}
            onPress={handleConfirm}
            disabled={!canSave}
          >
            {isEditing ? t("update") : t("add")}
          </PrimaryButton>
        </View>
      </KeyboardAvoidingView>

      {isPopup && (
        <ManagePopup
          setIsPopup={setIsPopup}
          name={nameHeader}
          titleName={titleName}
        />
      )}
    </View>
  );
};

export default ManageExpense;

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.screen,
  },
  scroll: {
    flex: 1,
  },
  content: {
    padding: spacing[4],
    paddingBottom: spacing[5],
  },
  deleteButton: {
    marginTop: spacing[3],
  },
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
  actionSecondary: {
    flex: 1,
  },
  actionPrimary: {
    flex: 1.4,
  },
});
