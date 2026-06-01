import { useState, useEffect } from "react";
import { StyleSheet, View, Text, Pressable } from "react-native";
import { Calendar } from "react-native-calendars";

import PrimaryInput from "./ui/PrimaryInput";
import { GlobalStyles } from "../constants/styles";
import { formatInput, formatAmount } from "../util/format";
import { useLanguage } from "../store/languageContext";

const ExpenseForm = ({
  setExpenses,
  expenses,
  setIsPopup,
  setNameHeader,
  titleName,
}) => {
  const { t } = useLanguage();

  const [selected, setSelected] = useState(expenses.date);
  const [isShowDate, setIsShowDate] = useState(false);

  useEffect(() => {
    setSelected(expenses.date)
  }, [expenses.date])
  
  const handleAmount = (e) => {
    setIsPopup(false);
    setExpenses((state) => {
      return {
        ...state,
        amount: formatInput(e)
      };
    });
  };
  const handleDate = () => {
    setIsPopup(false);
    setIsShowDate(true);
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
        <Text style={styles.title}>{t("your")} {t(titleName)}</Text>
        <View style={styles.inputRow}>
          <PrimaryInput
            label={t("amount")}
            textInputConfig={{
              keyboardType: "decimal-pad",
              onChangeText: handleAmount,
              onPressIn: () => setIsPopup(false),
            }}
            style={[styles.rowInput, styles.minWidth]}
            value={formatAmount(expenses.amount)}
          />
          <Pressable onPress={handleDate}>
            <PrimaryInput
              label={t("date")}
              style={[styles.rowInput, styles.minWidth]}
              value={selected}
              editable={false}
            />
          </Pressable>
        </View>
        {isShowDate && 
          <View style={styles.popupDate}>
            <Calendar
              onDayPress={day => {
                setIsShowDate(false)
                setSelected(day.dateString);
                setExpenses((state) => {
                  return {
                    ...state,
                    date: day.dateString,
                  };
                });
              }}
              markedDates={{
                [selected]: {selected: true, disableTouchEvent: true, selectedDotColor: 'orange'}
              }}
            />
          </View>
        }
        <Pressable onPress={handleSelectCategory.bind(null, "category")}>
          <PrimaryInput
            label={titleName === "transfer" ? t("from") : t("category")}
            style={styles.rowInput}
            value={expenses.category}
            editable={false}
          />
        </Pressable>
        <Pressable onPress={handleSelectAccount.bind(null, "account")}>
          <PrimaryInput
            label={titleName === "transfer" ? t("to") : t("account")}
            style={styles.rowInput}
            value={expenses.account}
            editable={false}
          />
        </Pressable>
        <PrimaryInput
          label={t("description")}
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
  minWidth: {
    minWidth: '48%'
  },
  form: {
    position: 'relative',
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
  popupDate: {
    position: 'absolute',
    top: '35%',
    right: 0,
    left: 0,
    elevation: 100,
    zIndex: 100
  }
});
