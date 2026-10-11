import { useEffect, useLayoutEffect, useState } from "react";
import { Alert, FlatList, Pressable, StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";

import { CategoryStore } from "../store/categoryContext";
import { GlobalStyles } from "../constants/styles";
import Loading from "../components/ui/Loading";
import EmptyState from "../components/ui/EmptyState";
import CategoryAvatar from "../components/ui/CategoryAvatar";
import { AccountStore } from "../store/accountContext";
import {
  deleteAccountDB,
  deleteCategoryIncomeDB,
  deleteExpenseCategory,
  fetchAccountDB,
  fetchCategoriesExpenseDB,
  fetchCategoryIncomeDB,
} from "../util/database";
import { CategoryIncomeStore } from "../store/incomeCategory";
import IconButton from "../components/ui/IconButton";
import { useLanguage } from "../store/languageContext";

const { colors, spacing, radius, type } = GlobalStyles;

const ManageItem = ({ name }) => {
  const storeCategory = CategoryStore();
  const { accounts, removeAccount, setAccount } = AccountStore();
  const { categoriesIncome, removeCategoriesIncome, setCategoriesIncome } =
    CategoryIncomeStore();
  const navigation = useNavigation();
  const { lang, t } = useLanguage();
  const [isLoading, setIsLoading] = useState(true);

  // Keep the on-screen list in sync with the current language by re-fetching
  // from the DB whenever the user switches language (or opens this screen).
  useEffect(() => {
    (async () => {
      setIsLoading(true);
      try {
        if (name === "expense_category") {
          storeCategory.setCategories(await fetchCategoriesExpenseDB(lang));
        } else if (name === "income_category") {
          setCategoriesIncome(await fetchCategoryIncomeDB(lang));
        } else {
          setAccount(await fetchAccountDB(lang));
        }
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    })();
  }, [lang, name]);

  useLayoutEffect(() => {
    navigation.setOptions({
      headerLeft: ({ tintColor }) => {
        return (
          <IconButton
            icon="arrow-back"
            size={24}
            color={tintColor}
            onPress={() => {
              navigation.goBack();
            }}
          />
        );
      },
    });
  });

  const removeItem = async (id) => {
    try {
      if (name === "expense_category") {
        await deleteExpenseCategory(id);
        storeCategory.removeCategory(id);
      } else if (name === "account") {
        await deleteAccountDB(id);
        removeAccount(id);
      } else {
        await deleteCategoryIncomeDB(id);
        removeCategoriesIncome(id);
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Deleting a category is destructive and was previously one stray tap away
  // from a bin icon — it now asks first (Nielsen #5).
  const handleDelete = (item) => {
    Alert.alert(t("delete"), `${item.name}`, [
      { text: t("cancel"), style: "cancel" },
      {
        text: t("delete"),
        style: "destructive",
        onPress: () => removeItem(item.id),
      },
    ]);
  };

  const handleEdit = (id) => {
    if (name === "expense_category") {
      navigation.navigate("AddManageItem", { name: "ChangeExpense", id });
    } else if (name === "account") {
      navigation.navigate("AddManageItem", { name: "ChangeAccount", id });
    } else {
      navigation.navigate("AddManageItem", { name: "ChangeIncome", id });
    }
  };

  const addScreenName = () => {
    if (name === "expense_category") return "ManageCategoryExpense";
    if (name === "income_category") return "ManageCategoryIncome";
    return "ManageAccount";
  };

  const renderItem = ({ item, index }) => (
    <View style={[styles.row, index > 0 && styles.rowDivided]}>
      <CategoryAvatar name={item.name} icon={item.icon} size={38} />
      <Text style={styles.name} numberOfLines={1}>
        {item.name}
      </Text>

      <Pressable
        onPress={() => handleEdit(item.id)}
        hitSlop={6}
        accessibilityRole="button"
        accessibilityLabel={`${t("edit")} ${item.name}`}
        style={({ pressed }) => [styles.action, pressed && styles.pressed]}
      >
        <Ionicons name="create-outline" size={19} color={colors.primary} />
      </Pressable>

      <Pressable
        onPress={() => handleDelete(item)}
        hitSlop={6}
        accessibilityRole="button"
        accessibilityLabel={`${t("delete")} ${item.name}`}
        style={({ pressed }) => [styles.action, pressed && styles.pressed]}
      >
        <Ionicons name="trash-outline" size={19} color={colors.expense} />
      </Pressable>
    </View>
  );

  let data = [];
  if (name === "expense_category") data = storeCategory.categories || [];
  else if (name === "income_category") data = categoriesIncome || [];
  else data = accounts || [];

  // Only the fetch shows a spinner — an empty list is a real state with its own
  // screen, not an endless loader (the old version spun forever when empty).
  if (isLoading) {
    return <Loading />;
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={data}
        renderItem={renderItem}
        keyExtractor={(item) => String(item.id)}
        contentContainerStyle={[
          styles.content,
          !data.length && styles.contentEmpty,
        ]}
        ListEmptyComponent={
          <EmptyState
            icon="folder-open-outline"
            title={t("no_items_yet")}
            actionLabel={t("add_first_item")}
            onAction={() =>
              navigation.navigate("AddManageItem", { name: addScreenName() })
            }
          />
        }
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
};

export default ManageItem;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.screen,
  },
  content: {
    margin: spacing[4],
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: "hidden",
  },
  contentEmpty: {
    flexGrow: 1,
    justifyContent: "center",
    borderWidth: 0,
    backgroundColor: "transparent",
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing[3],
    minHeight: 60,
    paddingVertical: spacing[2],
    paddingHorizontal: spacing[4],
  },
  rowDivided: {
    borderTopWidth: 1,
    borderTopColor: colors.n100,
  },
  name: {
    flex: 1,
    minWidth: 0,
    ...type.body,
    fontSize: 15.5,
    fontWeight: "500",
    color: colors.text,
  },
  action: {
    width: 40,
    height: 40,
    borderRadius: radius.full,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.surfaceAlt,
  },
  pressed: {
    opacity: 0.6,
  },
});
