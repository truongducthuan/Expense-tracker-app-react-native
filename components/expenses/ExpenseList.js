import { useMemo } from "react";
import { RefreshControl, SectionList, StyleSheet, Text, View } from "react-native";
import { useNavigation } from "@react-navigation/native";

import ExpenseItem from "./ExpenseItem";
import EmptyState from "../ui/EmptyState";
import { GlobalStyles } from "../../constants/styles";
import { groupByDay } from "../../util/date";
import useMoney from "../../hooks/useMoney";
import { useLanguage } from "../../store/languageContext";

const { colors, spacing, radius, type } = GlobalStyles;

// Transactions grouped into day sections with a sticky header carrying the
// day's net total, so the list stays legible when it gets long.
const ExpenseList = ({ items, fallBack, onRefresh, refreshing }) => {
  const navigation = useNavigation();
  const { t } = useLanguage();
  const { signed } = useMoney();

  const sections = useMemo(
    () => groupByDay(items, { today: t("today"), yesterday: t("yesterday") }),
    [items, t]
  );

  const refreshControl = onRefresh ? (
    <RefreshControl
      refreshing={!!refreshing}
      onRefresh={onRefresh}
      tintColor={colors.primary}
      colors={[colors.primary]}
    />
  ) : undefined;

  return (
    <SectionList
      style={styles.list}
      sections={sections}
      keyExtractor={(item) => String(item.id)}
      renderItem={({ item, index, section }) => (
        <View
          style={[
            styles.rowWrap,
            index === 0 && styles.rowFirst,
            index === section.data.length - 1
              ? styles.rowLast
              : styles.rowSeparator,
          ]}
        >
          <ExpenseItem {...item} />
        </View>
      )}
      renderSectionHeader={({ section }) => (
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>{section.title}</Text>
          <Text
            style={[
              styles.sectionNet,
              { color: section.net < 0 ? colors.expenseText : colors.incomeText },
            ]}
          >
            {signed(section.net)}
          </Text>
        </View>
      )}
      stickySectionHeadersEnabled
      contentContainerStyle={[
        styles.content,
        !sections.length && styles.contentEmpty,
      ]}
      ListEmptyComponent={
        <EmptyState
          icon="receipt-outline"
          title={fallBack || t("no_expense")}
          message={t("empty_transactions_hint")}
          actionLabel={t("add_expense")}
          onAction={() => navigation.navigate("ManageExpense")}
        />
      }
      refreshControl={refreshControl}
      showsVerticalScrollIndicator={false}
    />
  );
};

export default ExpenseList;

const styles = StyleSheet.create({
  // Explicit flex: the list sits below the period filter + balance card, so it
  // must claim the remaining height rather than size to its content.
  list: {
    flex: 1,
  },
  content: {
    paddingBottom: spacing[6],
  },
  contentEmpty: {
    flexGrow: 1,
    justifyContent: "center",
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: colors.screen,
    paddingTop: spacing[4],
    paddingBottom: spacing[2],
  },
  sectionTitle: {
    ...type.label,
    color: colors.textMuted,
  },
  sectionNet: {
    fontSize: 12.5,
    fontWeight: "700",
  },
  // Rounded group: the first and last row of a day carry the card corners.
  rowWrap: {
    borderWidth: 1,
    borderTopWidth: 0,
    borderBottomWidth: 0,
    borderColor: colors.border,
    overflow: "hidden",
    backgroundColor: colors.surface,
  },
  rowFirst: {
    borderTopWidth: 1,
    borderTopLeftRadius: radius.lg,
    borderTopRightRadius: radius.lg,
  },
  rowLast: {
    borderBottomWidth: 1,
    borderBottomLeftRadius: radius.lg,
    borderBottomRightRadius: radius.lg,
  },
  // Hairline between rows inside a day, inset so it doesn't touch the border.
  rowSeparator: {
    borderBottomWidth: 1,
    borderBottomColor: colors.n100,
  },
});
