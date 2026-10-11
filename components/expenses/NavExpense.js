import { StyleSheet, View } from "react-native";

import SegmentedControl from "../ui/SegmentedControl";
import { GlobalStyles } from "../../constants/styles";
import { CATEGORY_TYPE } from "../../constants/config";
import { useLanguage } from "../../store/languageContext";

const { colors, spacing } = GlobalStyles;

// Type switch on the add-transaction screen. The old version was icon-only,
// which left users guessing which arrow meant what; each segment now carries
// its label and the active segment is tinted with the type's colour.
const NavExpense = ({ onPress, titleName }) => {
  const { t } = useLanguage();

  const options = [
    {
      value: CATEGORY_TYPE.EXPENSE,
      label: t("expense"),
      color: colors.expenseText,
    },
    { value: CATEGORY_TYPE.IMCOME, label: t("income"), color: colors.incomeText },
    {
      value: CATEGORY_TYPE.TRANSFER,
      label: t("transfer"),
      color: colors.infoText,
    },
  ];

  return (
    <View style={styles.wrap}>
      <SegmentedControl options={options} value={titleName} onChange={onPress} />
    </View>
  );
};

export default NavExpense;

const styles = StyleSheet.create({
  wrap: {
    backgroundColor: colors.screen,
    paddingHorizontal: spacing[4],
    paddingTop: spacing[4],
  },
});
