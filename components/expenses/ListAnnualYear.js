import { FlatList, StyleSheet, Text, View } from "react-native";

import Card from "../ui/Card";
import { GlobalStyles } from "../../constants/styles";
import useMoney from "../../hooks/useMoney";
import { useLanguage } from "../../store/languageContext";

const { colors, spacing, radius, type } = GlobalStyles;

// Year-by-year income vs expense. Each row states both figures with their
// labels and the net underneath, so the comparison doesn't rely on the two
// colours alone.
const ListAnnualYear = ({ data }) => {
  const { t } = useLanguage();
  const { money, signed } = useMoney();

  return (
    <FlatList
      data={data}
      keyExtractor={(item) => String(item.year)}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
      renderItem={({ item }) => {
        let income = 0;
        let expense = 0;
        for (const entry of item.value) {
          if (entry.type === "income") income = entry.total;
          else expense = entry.total;
        }
        const net = income - expense;

        return (
          <Card style={styles.card}>
            <View style={styles.head}>
              <Text style={styles.year}>{item.year}</Text>
              <Text
                style={[
                  styles.net,
                  { color: net < 0 ? colors.expenseText : colors.incomeText },
                ]}
              >
                {signed(net)}
              </Text>
            </View>

            <View style={styles.split}>
              <View style={styles.splitItem}>
                <Text style={styles.splitLabel}>{t("total_income")}</Text>
                <Text style={[styles.splitValue, { color: colors.incomeText }]}>
                  {money(income)}
                </Text>
              </View>
              <View style={styles.divider} />
              <View style={styles.splitItem}>
                <Text style={styles.splitLabel}>{t("total_expense")}</Text>
                <Text style={[styles.splitValue, { color: colors.expenseText }]}>
                  {money(expense)}
                </Text>
              </View>
            </View>
          </Card>
        );
      }}
    />
  );
};

export default ListAnnualYear;

const styles = StyleSheet.create({
  content: {
    paddingBottom: spacing[6],
    gap: spacing[3],
  },
  card: {
    gap: spacing[3],
  },
  head: {
    flexDirection: "row",
    alignItems: "baseline",
    justifyContent: "space-between",
  },
  year: {
    ...type.h3,
    color: colors.text,
  },
  net: {
    ...type.bodyEmphasis,
    fontWeight: "700",
  },
  split: {
    flexDirection: "row",
    alignItems: "stretch",
    paddingTop: spacing[3],
    borderTopWidth: 1,
    borderTopColor: colors.n100,
  },
  splitItem: {
    flex: 1,
    gap: 2,
  },
  splitLabel: {
    ...type.label,
    color: colors.textMuted,
  },
  splitValue: {
    ...type.bodyEmphasis,
    fontWeight: "600",
  },
  divider: {
    width: 1,
    backgroundColor: colors.n100,
    marginHorizontal: spacing[3],
    borderRadius: radius.full,
  },
});
