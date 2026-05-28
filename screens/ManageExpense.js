import { useLayoutEffect, useState } from "react";
import { StyleSheet, Alert, ScrollView, View } from "react-native";
import IconButton from "../components/ui/IconButton";
import { GlobalStyles } from "../constants/styles";
import PrimaryButton from "../components/ui/PrimaryButton";
import { ExpenseStore } from "../store/context";
import ExpenseForm from "../components/ExpenseForm";
import { storeExpense, updateExpenses, deleteExpenses } from "../api/http";
import Loading from "../components/ui/Loading";
import ErrorOverlay from "../components/ui/ErrorOverlay";
import ManagePopup from "../components/popup/ManagePopup";
import NavExpense from "../components/expenses/NavExpense";
import { AuthStore } from "../store/authContext";

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

  const expenseId = route.params?.expenseId;
  const [isLoading, setIsLoading] = useState(false);
  const [isPopup, setIsPopup] = useState(false);
  const [nameHeader, setNameHeader] = useState("");
  const [error, setError] = useState(null);
  const isEditing = !!expenseId;
  const [titleName, setTitleName] = useState("expense");
  const [expensesInput, setExpensesInput] = useState({
    amount: "",
    date: new Date().toISOString().slice(0, 10),
    category: valueInputCategory ? valueInputCategory : "",
    account: valueInputAccount ? valueInputAccount : "",
    desc: "",
  });

  useLayoutEffect(() => {
    setExpensesInput((state) => {
      return {
        ...state,
        category: valueInputCategory,
        account: valueInputAccount,
      };
    });
  }, [valueInputAccount, valueInputCategory]);

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
      title: isEditing ? "Edit Expense" : "Add Expense",
    });
  }, [navigation, isEditing]);

  const handleNav = (nav) => {
    setTitleName(nav);
  };

  const handleDelete = async () => {
    setIsLoading(true);
    try {
      await deleteExpenses(expenseId);
    } catch (err) {
      setError("Could not delete expense - please try again!");
    }
    setIsLoading(false);
    deleteExpense(expenseId);
    navigation.goBack();
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
          setError("Could Edit expense - please try again!");
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
          setError("Could add expense - please try again!");
        }
      }
      setIsLoading(false);
    } else {
      Alert.alert("Invalid input!", "Please check your input values");
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
    return <Loading />;
  }


  return (
    <>
      {!isEditing && <NavExpense onPress={handleNav} titleName={titleName} />}
      <ScrollView style={styles.container}>
        <ExpenseForm
          setExpenses={setExpensesInput}
          expenses={expensesInput}
          setIsPopup={setIsPopup}
          setNameHeader={setNameHeader}
          titleName={titleName}
        />
        <View style={styles.buttons}>
          <PrimaryButton
            style={styles.button}
            mode={"flat"}
            onPress={cancelhandler}
          >
            Cancel
          </PrimaryButton>
          <PrimaryButton style={styles.button} onPress={handleConfirm}>
            {isEditing ? "Update" : "Add"}
          </PrimaryButton>
        </View>
        {isEditing && (
          <View style={styles.deleteContainer}>
            <IconButton
              icon={"trash"}
              color={GlobalStyles.colors.error500}
              size={36}
              onPress={handleDelete}
            />
          </View>
        )}
      </ScrollView>
      {isPopup && (
        <ManagePopup
          setIsPopup={setIsPopup}
          name={nameHeader}
          titleName={titleName}
        />
      )}
    </>
  );
};

export default ManageExpense;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    backgroundColor: GlobalStyles.colors.primary800,
  },
  deleteContainer: {
    marginTop: 16,
    paddingTop: 8,
    borderTopWidth: 2,
    borderTopColor: GlobalStyles.colors.primary500,
    alignItems: "center",
  },
  buttons: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 20,
  },
  button: {
    minWidth: 120,
    marginHorizontal: 8,
  },
});
