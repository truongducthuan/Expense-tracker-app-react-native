import { useLayoutEffect, useState } from "react";
import { Alert, StyleSheet, View } from "react-native";
import PrimaryInput from "../components/ui/PrimaryInput";
import PrimaryButton from "../components/ui/PrimaryButton";
import { CategoryStore } from "../store/categoryContext";
import Loading from "../components/ui/Loading";
import ErrorOverlay from "../components/ui/ErrorOverlay";
import { AccountStore } from "../store/accountContext";
import {
  addAccountDB,
  addExpenseCategory,
  addIncomeCategory,
  updateAccountDB,
  updateExpenseCategory,
  updateIncomeCategory,
} from "../util/database";
import { CategoryIncomeStore } from "../store/incomeCategory";

const AddManageItem = ({ route, navigation }) => {
  const storeContext = CategoryStore();
  const { addAccount, editAccount } = AccountStore();
  const { addCategoriesIncome, editCategoriesIncome } = CategoryIncomeStore();

  const [valueInput, setValueInput] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const name = route.params.name;
  const id = route.params?.id;

  useLayoutEffect(() => {
    const nameHeader = () => {
      if (name === "ManageCategoryIncome") return "Add Income Category";
      if (name === "ChangeExpense") return "Change Expense Category";
      if (name === "ManageCategoryExpense") return "Add Expense Category";
      if (name === "ChangeIncome") return "Change Income Category";
      if (name === "ManageAccount") return "Add Account";
      return "Change Account";
    };
    navigation.setOptions({ title: nameHeader() });
  }, [name]);

  const handleChange = () => {
    if (!valueInput.trim().length || !name) {
      Alert.alert("Input invalid", "Please check your input value!");
      return;
    }
    setIsLoading(true);
    try {
      if (name === "ManageCategoryIncome") {
        const newId = addIncomeCategory(valueInput);
        addCategoriesIncome({ name: valueInput, id: newId });
      } else if (name === "ManageCategoryExpense") {
        const newId = addExpenseCategory(valueInput);
        storeContext.addCategory({ name: valueInput, id: newId });
      } else if (name === "ChangeExpense") {
        updateExpenseCategory(valueInput, id);
        storeContext.editCategory({ name: valueInput }, id);
      } else if (name === "ChangeIncome") {
        updateIncomeCategory(valueInput, id);
        editCategoriesIncome({ name: valueInput }, id);
      } else if (name === "ChangeAccount") {
        updateAccountDB(valueInput, id);
        editAccount({ name: valueInput }, id);
      } else if (name === "ManageAccount") {
        const newId = addAccountDB(valueInput);
        addAccount({ name: valueInput, id: newId });
      }
      navigation.goBack();
    } catch (err) {
      setError("Operation failed - Please try again");
      console.error(err);
    }
    setIsLoading(false);
  };

  if (error && !isLoading) {
    return <ErrorOverlay message={error} onPress={() => setError(null)} />;
  }

  if (isLoading) {
    return <Loading />;
  }

  return (
    <View>
      <PrimaryInput
        style={styles.input}
        textInputConfig={{ onChangeText: (e) => setValueInput(e) }}
      />
      <PrimaryButton style={styles.button} onPress={handleChange}>
        Save
      </PrimaryButton>
    </View>
  );
};

export default AddManageItem;

const styles = StyleSheet.create({
  button: {
    marginHorizontal: 20,
    paddingTop: 16,
  },
  input: {
    marginHorizontal: 20,
  },
});
