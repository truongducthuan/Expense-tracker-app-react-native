import { useMemo } from "react";
import { Pressable, StyleSheet, View } from "react-native";

import HeaderPopup from "../ui/HeaderPopup";
import ListItem from "./ListItem";
import { GlobalStyles } from "../../constants/styles";
import { CATEGORY_TYPE } from "../../constants/config";
import { CategoryStore } from "../../store/categoryContext";
import { AccountStore } from "../../store/accountContext";
import { CategoryIncomeStore } from "../../store/incomeCategory";
import { ExpenseStore } from "../../store/context";

const { colors, radius } = GlobalStyles;

// Bottom sheet for picking a category or account. Tapping the dimmed backdrop
// closes it, so there is always a way out without hunting for the ✕
// (Nielsen #3 — user control and freedom).
const ManagePopup = ({ setIsPopup, name, titleName }) => {
  const { categories } = CategoryStore();
  const { accounts } = AccountStore();
  const { categoriesIncome } = CategoryIncomeStore();
  const { valueInputCategory, valueInputAccount } = ExpenseStore();

  const items = useMemo(() => {
    if (name !== "category") return accounts;
    if (titleName === CATEGORY_TYPE.EXPENSE) return categories;
    if (titleName === CATEGORY_TYPE.IMCOME) return categoriesIncome;
    return accounts;
  }, [name, titleName, categories, categoriesIncome, accounts]);

  return (
    <View style={styles.overlay}>
      <Pressable
        style={styles.backdrop}
        onPress={() => setIsPopup(false)}
        accessibilityRole="button"
      />
      <View style={styles.sheet}>
        <HeaderPopup name={name} icon="create-outline" setIsPopup={setIsPopup} />
        <ListItem
          items={items || []}
          name={name}
          setIsPopup={setIsPopup}
          selected={name === "category" ? valueInputCategory : valueInputAccount}
        />
      </View>
    </View>
  );
};

export default ManagePopup;

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: "flex-end",
    zIndex: 100,
    elevation: 100,
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(17,24,39,0.45)",
  },
  sheet: {
    maxHeight: "72%",
    backgroundColor: colors.surface,
    borderTopLeftRadius: radius.lg + 4,
    borderTopRightRadius: radius.lg + 4,
    ...GlobalStyles.shadow.lg,
  },
});
