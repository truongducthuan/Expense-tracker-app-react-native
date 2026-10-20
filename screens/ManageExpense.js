import { useEffect, useLayoutEffect, useRef, useState } from "react";
import {
  KeyboardAvoidingView,
  ScrollView,
  StyleSheet,
  View,
} from "react-native";

import { GlobalStyles } from "../constants/styles";
import { CATEGORY_TYPE } from "../constants/config";
import PrimaryButton from "../components/ui/PrimaryButton";
import ActionBar from "../components/ui/ActionBar";
import { ExpenseStore } from "../store/context";
import ExpenseForm from "../components/ExpenseForm";
import { storeExpense, updateExpenses, deleteExpenses } from "../api/http";
import Loading from "../components/ui/Loading";
import ErrorOverlay from "../components/ui/ErrorOverlay";
import ManagePopup from "../components/popup/ManagePopup";
import NavExpense from "../components/expenses/NavExpense";
import { AuthStore } from "../store/authContext";
import { useLanguage } from "../store/languageContext";
import { useDialog } from "../store/dialogContext";
import useKeyboardVisible from "../hooks/useKeyboardVisible";
import LayoutProbe from "../components/dev/LayoutProbe";

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
  const { alert, confirm } = useDialog();

  const expenseId = route.params?.expenseId;
  const scrollRef = useRef(null);
  // Set while the description — the last field on the form — holds focus.
  const bottomFieldFocused = useRef(false);
  const keyboardVisible = useKeyboardVisible();
  // TEMPORARY, see components/dev/LayoutProbe.
  const [probe, setProbe] = useState({ root: 0, scroll: 0, kav: 0 });
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

  // The description sits at the bottom of the form, so the keyboard opens
  // straight over it. The window shrinks to make room, but nothing was moving
  // the content, which is how the field people were typing into ended up
  // underneath the keyboard.
  //
  // Scrolling has to happen AFTER the window has shrunk, or it scrolls to the
  // old, taller bottom and the field stays hidden — so it waits for the
  // keyboard event rather than guessing a delay. When the keyboard is already
  // up (moving across from the amount field) there is no event coming, and the
  // scroll can happen at once.
  const revealBottomField = () => {
    bottomFieldFocused.current = true;
    if (keyboardVisible) scrollRef.current?.scrollToEnd({ animated: true });
  };

  const releaseBottomField = () => {
    bottomFieldFocused.current = false;
  };

  useEffect(() => {
    if (!keyboardVisible || !bottomFieldFocused.current) return;
    // One frame after the resize lands, so the new content height is known.
    const id = setTimeout(
      () => scrollRef.current?.scrollToEnd({ animated: true }),
      50
    );
    return () => clearTimeout(id);
  }, [keyboardVisible]);

  // Deleting is irreversible here, so it asks first (Nielsen #3 — the prototype
  // offers 5s undo instead; a confirm is the honest equivalent without a
  // queue to undo from).
  const handleDelete = async () => {
    const ok = await confirm({
      title: t("delete_expense"),
      message: t("delete_expense_confirm"),
      confirmLabel: t("delete"),
      destructive: true,
    });
    if (!ok) return;

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
      alert({ title: t("invalid_input"), message: t("check_values"), tone: "warning" });
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
    <View
      style={styles.root}
      onLayout={(e) => {
        // Read it synchronously: the event object is recycled before a state
        // updater runs, so touching it in there finds nativeEvent already null.
        const height = e.nativeEvent.layout.height;
        setProbe((p) => ({ ...p, root: height }));
      }}
    >
      <LayoutProbe
        rootHeight={probe.root}
        scrollHeight={probe.scroll}
        kavHeight={probe.kav}
      />
      {/* `padding` on Android too, not just iOS.
          Measured on a real device: with the keyboard open the window is
          exactly as tall as with it closed (705dp either way) — Android stopped
          resizing the window when edge-to-edge became unconditional in SDK 54.
          The keyboard simply sits on top of the app. Passing no behaviour meant
          "the OS already made room", which is no longer true, which is why the
          description field and the buttons ended up underneath it. */}
      <KeyboardAvoidingView
        style={styles.root}
        behavior="padding"
        onLayout={(e) => {
          const height = e.nativeEvent.layout.height;
          setProbe((p) => ({ ...p, kav: height }));
        }}
      >
        {!isEditing && <NavExpense onPress={handleNav} titleName={titleName} />}

        <ScrollView
          ref={scrollRef}
          style={styles.scroll}
          contentContainerStyle={styles.content}
          keyboardShouldPersistTaps="handled"
          // Dragging the list away is the other way out of the keyboard,
          // without having to find the Done key.
          keyboardDismissMode="on-drag"
          onLayout={(e) => {
            const height = e.nativeEvent.layout.height;
            setProbe((p) => ({ ...p, scroll: height }));
          }}
        >
          <ExpenseForm
            setExpenses={setExpensesInput}
            expenses={expensesInput}
            setIsPopup={setIsPopup}
            setNameHeader={setNameHeader}
            titleName={titleName}
            onFieldFocus={revealBottomField}
            onFieldBlur={releaseBottomField}
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
        <ActionBar style={styles.actionRow}>
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
        </ActionBar>
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
  actionRow: {
    flexDirection: "row",
    gap: spacing[3],
  },
  actionSecondary: {
    flex: 1,
  },
  actionPrimary: {
    flex: 1.4,
  },
});
