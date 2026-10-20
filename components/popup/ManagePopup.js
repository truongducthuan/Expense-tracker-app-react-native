import { useEffect, useMemo } from "react";
import { Keyboard, Modal, Pressable, StyleSheet, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import HeaderPopup from "../ui/HeaderPopup";
import ListItem from "./ListItem";
import { GlobalStyles, fillParent } from "../../constants/styles";
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
  const insets = useSafeAreaInsets();

  const { categories } = CategoryStore();
  const { accounts } = AccountStore();
  const { categoriesIncome } = CategoryIncomeStore();
  const { valueInputCategory, valueInputAccount } = ExpenseStore();

  // The sheet needs the whole lower half of the screen. If it opens while a
  // field still has focus it gets whatever is left above the keyboard.
  useEffect(() => {
    Keyboard.dismiss();
  }, []);

  const items = useMemo(() => {
    if (name !== "category") return accounts;
    if (titleName === CATEGORY_TYPE.EXPENSE) return categories;
    if (titleName === CATEGORY_TYPE.IMCOME) return categoriesIncome;
    return accounts;
  }, [name, titleName, categories, categoriesIncome, accounts]);

  // A real Modal, not an absolutely-positioned overlay inside the screen.
  //
  // As an overlay it inherited whatever the form's layout was doing: measured
  // on a device, the scroll area had collapsed to 160dp of a 697dp screen, so
  // the sheet came up against the bottom of that with a wide empty band above
  // it. A Modal is its own window — it is always the full screen, whatever the
  // screen underneath is doing — and it brings the Android back button with it.
  return (
    <Modal
      visible
      transparent
      animationType="fade"
      statusBarTranslucent
      navigationBarTranslucent
      onRequestClose={() => setIsPopup(false)}
    >
      <View style={styles.overlay}>
        <Pressable
          style={styles.backdrop}
          onPress={() => setIsPopup(false)}
          accessibilityRole="button"
        />
        <View style={[styles.sheet, { paddingBottom: insets.bottom }]}>
          <HeaderPopup
            name={name}
            icon="create-outline"
            setIsPopup={setIsPopup}
          />
          <ListItem
            items={items || []}
            name={name}
            setIsPopup={setIsPopup}
            selected={
              name === "category" ? valueInputCategory : valueInputAccount
            }
          />
        </View>
      </View>
    </Modal>
  );
};

export default ManagePopup;

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: "flex-end",
  },
  backdrop: {
    ...fillParent,
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
