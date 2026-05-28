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
      if (name === "ManageCategoryIncome") {
        return "Add Income Category";
      } else if (name === "ChangeExpense") {
        return "Change Expense Category";
      } else if (name === "ManageCategoryExpense") {
        return "Add Expense Category";
      } else if (name === "ChangeIncome") {
        return "Change Income Category";
      } else if (name === "ManageAccount") {
        return "Add Account";
      } else {
        return "Change Account";
      }
    };
    navigation.setOptions({
      title: nameHeader(),
    });
  }, [name]);

  const handleChange = async () => {
    if (valueInput.trim().length > 0 && name) {
      setIsLoading(true);
      if (name === "ManageCategoryIncome") {
        try {
          const id = await addIncomeCategory(valueInput);
          addCategoriesIncome({ name: valueInput, id });
          navigation.goBack();
        } catch (err) {
          setError("Could add account - Please try again");
          console.error(err);
        }
      } else if (name === "ManageCategoryExpense") {
        try {
          const id = await addExpenseCategory(valueInput);
          storeContext.addCategory({ name: valueInput, id });
          navigation.goBack();
        } catch (err) {
          setError("Could add category - Please try again");
          console.error(err);
        }
      } else if (name === "ChangeExpense") {
        try {
          await updateExpenseCategory(valueInput, id);
          storeContext.editCategory({ name: valueInput }, id);
          navigation.goBack();
        } catch (err) {
          setError("Could update category - Please try again");
          console.error(err);
        }
      } else if (name === "ChangeIncome") {
        try {
          await updateIncomeCategory(valueInput, id);
          editCategoriesIncome({ name: valueInput }, id);
          navigation.goBack();
        } catch (err) {
          setError("Could update category - Please try again");
          console.error(err);
        }
      } else if (name === "ChangeAccount") {
        await updateAccountDB(valueInput, id);
        editAccount({ name: valueInput }, id);
        navigation.goBack();
      } else if (name === "ManageAccount") {
        const id = await addAccountDB(valueInput);
        addAccount({ name: valueInput, id });
        navigation.goBack();
      }
      setIsLoading(false);
    } else {
      Alert.alert("Input invalid", "Please check your input value!");
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
    <View>
      <PrimaryInput
        style={styles.input}
        textInputConfig={{
          onChangeText: (e) => setValueInput(e),
        }}
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
