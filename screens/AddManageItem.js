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
import { useLanguage } from "../store/languageContext";

// SQLite raises "UNIQUE constraint failed" when inserting/renaming to a name
// that already exists in the table.
const isDuplicateError = (err) =>
  typeof err?.message === "string" && err.message.includes("UNIQUE");

const AddManageItem = ({ route, navigation }) => {
  const storeContext = CategoryStore();
  const { addAccount, editAccount } = AccountStore();
  const { addCategoriesIncome, editCategoriesIncome } = CategoryIncomeStore();
  const { t, lang } = useLanguage();

  const [valueInput, setValueInput] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const name = route.params.name;
  const id = route.params?.id;

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
      Alert.alert(t("invalid_input"), t("please_check_input"));
      return;
    }

    setIsLoading(true);
    try {
      if (name === "ManageCategoryIncome") {
        const newId = await addIncomeCategory(valueInput, lang);
        addCategoriesIncome({ name: valueInput, id: newId });
      } else if (name === "ManageCategoryExpense") {
        const newId = await addExpenseCategory(valueInput, lang);
        storeContext.addCategory({ name: valueInput, id: newId });
      } else if (name === "ChangeExpense") {
        await updateExpenseCategory(valueInput, id);
        storeContext.editCategory({ name: valueInput }, id);
      } else if (name === "ChangeIncome") {
        await updateIncomeCategory(valueInput, id);
        editCategoriesIncome({ name: valueInput }, id);
      } else if (name === "ChangeAccount") {
        await updateAccountDB(valueInput, id);
        editAccount({ name: valueInput }, id);
      } else if (name === "ManageAccount") {
        const newId = await addAccountDB(valueInput, lang);
        addAccount({ name: valueInput, id: newId });
      }
      navigation.goBack();
    } catch (err) {
      if (isDuplicateError(err)) {
        Alert.alert(t("duplicate_name"), t("name_already_exists"));
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
        {t("save")}
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
