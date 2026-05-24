import { StyleSheet, View, Text, Pressable } from "react-native";
import PrimaryInput from "./ui/PrimaryInput";
import { GlobalStyles } from "../constants/styles";

const ExpenseForm = ({
  setExpenses,
  expenses,
  setIsPopup,
  setNameHeader,
  titleName,
}) => {
  const handleAmount = (e) => {
    setIsPopup(false);
    setExpenses((state) => {
      return {
        ...state,
        amount: +e,
      };
    });
  };
  const handleDate = (e) => {
    setIsPopup(false);
    setExpenses((state) => {
      return {
        ...state,
        date: e,
      };
    });
  };
  const handleDesc = (e) => {
    setIsPopup(false);
    setExpenses((state) => {
      return {
        ...state,
        desc: e,
      };
    });
  };
  const handleSelectCategory = (name) => {
    setNameHeader(name);
    setIsPopup(true);
  };
  const handleSelectAccount = (name) => {
    setNameHeader(name);

    setIsPopup(true);
  };

  return (
    <>
      <View style={styles.form}>
        <Text style={styles.title}>Your {titleName}</Text>
        <View style={styles.inputRow}>
          <PrimaryInput
            label={"Amount"}
            textInputConfig={{
              keyboardType: "decimal-pad",
              onChangeText: handleAmount,
              onPressIn: () => setIsPopup(false),
            }}
            style={styles.rowInput}
            value={expenses.amount.toString()}
          />
          <PrimaryInput
            label={"Date"}
            textInputConfig={{
              // keyboardType: "decimal-pad",
              onChangeText: handleDate,
              placeholder: "YYYY-MM-DD",
              maxLength: 10,
            }}
            style={styles.rowInput}
            value={expenses.date}
          />
        </View>
        <Pressable onPress={handleSelectCategory.bind(null, "category")}>
          <PrimaryInput
            label={titleName === "transfer" ? "From" : "Category"}
            style={styles.rowInput}
            value={expenses.category}
            editable={false}
          />
        </Pressable>
        <Pressable onPress={handleSelectAccount.bind(null, "account")}>
          <PrimaryInput
            label={titleName === "transfer" ? "To" : "Account"}
            style={styles.rowInput}
            value={expenses.account}
            editable={false}
          />
        </Pressable>
        <PrimaryInput
          label={"Description"}
          textInputConfig={{
            onChangeText: handleDesc,
            multiline: true,
            autoCorrect: false,
            autoCapitalize: "none",
            onPressIn: () => setIsPopup(false),

            // numberOfLines: 4,
          }}
          value={expenses.desc}
        />
      </View>
    </>
  );
};

export default ExpenseForm;

const styles = StyleSheet.create({
  inputRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  rowInput: {
    flex: 1,
  },
  form: {
    marginTop: 40,
  },
  title: {
    fontSize: 19,
    fontWeight: "bold",
    color: "white",
    textAlign: "center",
    marginVertical: 20,
    textTransform: "capitalize",
  },
  text: {
    fontSize: 12,
    color: GlobalStyles.colors.primary100,
    marginBottom: 4,
  },
  selectInput: {
    padding: 20,
    backgroundColor: GlobalStyles.colors.primary100,
    borderRadius: 8,
  },
  marginBottom: {
    marginBottom: 8,
  },
});
