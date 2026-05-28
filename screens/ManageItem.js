import { useLayoutEffect, useState } from "react";
import { FlatList, Pressable, StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";

import { CategoryStore } from "../store/categoryContext";
import { GlobalStyles } from "../constants/styles";
import Loading from "../components/ui/Loading";
import { AccountStore } from "../store/accountContext";
import {
  deleteAccountDB,
  deleteCategoryIncomeDB,
  deleteExpenseCategory,
} from "../util/database";
import { CategoryIncomeStore } from "../store/incomeCategory";
import IconButton from "../components/ui/IconButton";

const ManageItem = ({ name }) => {
  const storeCategory = CategoryStore();
  const { accounts, removeAccount } = AccountStore();
  const { categoriesIncome, removeCategoriesIncome } = CategoryIncomeStore();
  const navigation = useNavigation();
  const [isLoading, setIsLoading] = useState(false);

  useLayoutEffect(() => {
    navigation.setOptions({
      headerLeft: ({ tintColor }) => {
        return (
          <IconButton
            icon="md-arrow-back"
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

  const handleDelete = async (id) => {
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

  const handleEdit = async (id) => {
    setIsLoading(true);
    if (name === "expense_category") {
      navigation.navigate("AddManageItem", { name: "ChangeExpense", id: id });
    } else if (name === "account") {
      navigation.navigate("AddManageItem", { name: "ChangeAccount", id: id });
    } else {
      navigation.navigate("AddManageItem", { name: "ChangeIncome", id: id });
    }
    setIsLoading(false);
  };

  const renderItem = (item) => {
    return (
      <View style={styles.listItem}>
        <View style={styles.left}>
          <Pressable
            onPress={handleDelete.bind(null, item.id)}
            style={({ pressed }) => pressed && styles.pressed}
          >
            <Ionicons name={"trash"} size={24} color={"red"} />
          </Pressable>
          <Text style={styles.name}>{item.name}</Text>
        </View>
        <View>
          <Pressable onPress={() => handleEdit(item.id)}>
            <Ionicons
              name="create"
              size={24}
              color={GlobalStyles.colors.primary400}
            />
          </Pressable>
        </View>
      </View>
    );
  };

  let data = [];
  if (name === "expense_category") {
    if (storeCategory.categories.length) {
      data = storeCategory.categories;
    }
  } else if (name === "income_category") {
    if (categoriesIncome.length) {
      data = categoriesIncome;
    }
  } else {
    if (accounts.length) {
      data = accounts;
    }
  }
  if (isLoading || data.length === 0) {
    return <Loading />;
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={data}
        renderItem={({ item }) => renderItem(item)}
        keyExtractor={(item) => item.id}
      />
    </View>
  );
};

export default ManageItem;

const styles = StyleSheet.create({
  container: {
    padding: 20,
  },
  name: {
    color: "#000",
    fontSize: 18,
    fontWeight: "bold",
    // textTransform: "capitalize",
  },
  listItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginVertical: 12,
  },
  left: {
    flexDirection: "row",
    alignItems: "center",
    gap: 20,
  },
  pressed: {
    opacity: 0.75,
  },
});
