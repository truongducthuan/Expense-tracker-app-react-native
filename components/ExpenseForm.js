import { useState, useEffect } from "react";
import { Modal, Pressable, StyleSheet, Text, View } from "react-native";
import { Calendar } from "react-native-calendars";

import PrimaryInput from "./ui/PrimaryInput";
import Card from "./ui/Card";
import { GlobalStyles } from "../constants/styles";
import { CATEGORY_TYPE } from "../constants/config";
import { formatInput, formatAmount } from "../util/format";
import useMoney from "../hooks/useMoney";
import { useLanguage } from "../store/languageContext";

const { colors, spacing, radius, type } = GlobalStyles;

const TYPE_COLOR = {
  [CATEGORY_TYPE.EXPENSE]: colors.expenseText,
  [CATEGORY_TYPE.IMCOME]: colors.incomeText,
  [CATEGORY_TYPE.TRANSFER]: colors.infoText,
};

const ExpenseForm = ({
  setExpenses,
  expenses,
  setIsPopup,
  setNameHeader,
  titleName,
}) => {
  const { t } = useLanguage();
  const { symbol } = useMoney();

  const [selected, setSelected] = useState(expenses.date);
  const [isShowDate, setIsShowDate] = useState(false);

  useEffect(() => {
    setSelected(expenses.date);
  }, [expenses.date]);

  const amountColor = TYPE_COLOR[titleName] || colors.text;
  const hasAmount = !!expenses.amount && expenses.amount !== "0";

  const handleAmount = (e) => {
    setIsPopup(false);
    setExpenses((state) => ({ ...state, amount: formatInput(e) }));
  };

  const handleDesc = (e) => {
    setIsPopup(false);
    setExpenses((state) => ({ ...state, desc: e }));
  };

  const openPicker = (field) => {
    setNameHeader(field);
    setIsPopup(true);
  };

  return (
    <View style={styles.form}>
      {/* The amount leads the screen — it is the one value every transaction
          must have, so it gets display type rather than another labelled row. */}
      <Card style={styles.amountCard}>
        <Text style={styles.amountLabel}>{t("amount")}</Text>
        <View style={styles.amountRow}>
          <PrimaryInput
            bare
            textInputConfig={{
              keyboardType: "decimal-pad",
              onChangeText: handleAmount,
              onPressIn: () => setIsPopup(false),
            }}
            placeholder="0"
            inputStyle={[
              styles.amountInput,
              { color: hasAmount ? amountColor : colors.border },
            ]}
            style={styles.amountField}
            value={formatAmount(expenses.amount)}
          />
          <Text style={[styles.currency, { color: amountColor }]}>
            {symbol}
          </Text>
        </View>
        <View
          style={[
            styles.amountRule,
            hasAmount && { backgroundColor: amountColor },
          ]}
        />
      </Card>

      <Pressable onPress={() => openPicker("category")}>
        <PrimaryInput
          label={titleName === CATEGORY_TYPE.TRANSFER ? t("from") : t("category")}
          value={expenses.category}
          placeholder={t("select_category")}
          editable={false}
          selectable
        />
      </Pressable>

      <Pressable onPress={() => openPicker("account")}>
        <PrimaryInput
          label={titleName === CATEGORY_TYPE.TRANSFER ? t("to") : t("account")}
          value={expenses.account}
          placeholder={t("select_account")}
          editable={false}
          selectable
        />
      </Pressable>

      <Pressable
        onPress={() => {
          setIsPopup(false);
          setIsShowDate(true);
        }}
      >
        <PrimaryInput
          label={t("date")}
          value={selected}
          editable={false}
          selectable
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
        }}
        value={expenses.desc}
      />

      {/* The calendar used to be absolutely positioned over the form, which
          left it clipped on short screens; it is a centred modal now. */}
      <Modal
        visible={isShowDate}
        transparent
        animationType="fade"
        onRequestClose={() => setIsShowDate(false)}
      >
        <Pressable
          style={styles.modalBackdrop}
          onPress={() => setIsShowDate(false)}
        >
          <Pressable style={styles.calendarCard} onPress={() => {}}>
            <Calendar
              onDayPress={(day) => {
                setIsShowDate(false);
                setSelected(day.dateString);
                setExpenses((state) => ({ ...state, date: day.dateString }));
              }}
              markedDates={{
                [selected]: { selected: true, disableTouchEvent: true },
              }}
              theme={{
                todayTextColor: colors.primary,
                selectedDayBackgroundColor: colors.primary,
                arrowColor: colors.primary,
                textMonthFontWeight: "700",
                textDayHeaderFontWeight: "600",
              }}
            />
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
};

export default ExpenseForm;

const styles = StyleSheet.create({
  form: {
    gap: spacing[1],
  },
  amountCard: {
    marginBottom: spacing[2],
    paddingBottom: spacing[3],
  },
  amountLabel: {
    ...type.label,
    color: colors.textMuted,
  },
  amountRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing[2],
  },
  amountField: {
    flex: 1,
    marginVertical: 0,
  },
  amountInput: {
    ...type.display,
    fontSize: 34,
    paddingVertical: spacing[1],
  },
  currency: {
    ...type.h2,
    fontWeight: "700",
  },
  amountRule: {
    height: 2,
    borderRadius: 2,
    backgroundColor: colors.n100,
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: "rgba(17,24,39,0.45)",
    alignItems: "center",
    justifyContent: "center",
    padding: spacing[5],
  },
  calendarCard: {
    width: "100%",
    maxWidth: 380,
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing[2],
    overflow: "hidden",
    ...GlobalStyles.shadow.lg,
  },
});
