import { useEffect, useLayoutEffect, useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import DraggableFlatList, {
  ScaleDecorator,
} from "react-native-draggable-flatlist";
import { useNavigation } from "@react-navigation/native";

import { CategoryStore } from "../store/categoryContext";
import { ExpenseStore } from "../store/context";
import ReassignSheet from "../components/popup/ReassignSheet";
import { patchExpense } from "../api/http";
import { findAccountUsage, findCategoryUsage } from "../util/usage";
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
  reorderAccounts,
  reorderExpenseCategories,
  reorderIncomeCategories,
} from "../util/database";
import { CategoryIncomeStore } from "../store/incomeCategory";
import IconButton from "../components/ui/IconButton";
import { useLanguage } from "../store/languageContext";
import { useDialog } from "../store/dialogContext";

const { colors, spacing, radius, type } = GlobalStyles;

const ManageItem = ({ name }) => {
  const storeCategory = CategoryStore();
  const { accounts, removeAccount, setAccount } = AccountStore();
  const { categoriesIncome, removeCategoriesIncome, setCategoriesIncome } =
    CategoryIncomeStore();
  const navigation = useNavigation();
  const { lang, t } = useLanguage();
  const { alert, confirm } = useDialog();
  const { expenses, updateExpense } = ExpenseStore();
  const [isLoading, setIsLoading] = useState(true);
  const [pendingDelete, setPendingDelete] = useState(null);
  const [isReassigning, setIsReassigning] = useState(false);

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

  // Which transactions still point at this row by name. Nothing is a foreign
  // key, so deleting the row alone leaves those references dangling.
  const usageOf = (item) =>
    name === "account"
      ? findAccountUsage(expenses, item.name)
      : findCategoryUsage(
          expenses,
          item.name,
          name === "income_category" ? "income" : "expense"
        );

  // Deleting is destructive and was previously one stray tap away from a bin
  // icon. It now asks first (Nielsen #5), and when transactions depend on the
  // row it says how many and offers to move them rather than orphaning them.
  const handleDelete = (item) => {
    const usage = usageOf(item);

    if (!usage.length) {
      confirm({
        title: `${t("delete")} “${item.name}”`,
        confirmLabel: t("delete"),
        destructive: true,
      }).then((ok) => ok && removeItem(item.id));
      return;
    }

    setPendingDelete({ item, usage });
  };

  // Rewrites each affected transaction to the chosen name, then removes the
  // row. PATCH touches only the field that moves, so nothing else on the
  // record can be clobbered. A failure stops before the delete, leaving the
  // row in place rather than stranding half-moved transactions.
  const handleReassign = async (targetName) => {
    if (!pendingDelete || !targetName) return;
    const { item, usage } = pendingDelete;

    setIsReassigning(true);
    try {
      for (const hit of usage) {
        const patch = {};
        for (const field of hit.fields) patch[field] = targetName;
        await patchExpense(hit.id, patch);
        updateExpense(hit.id, patch);
      }
      await removeItem(item.id);
      setPendingDelete(null);
    } catch (err) {
      console.error(err);
      alert({ title: t("error_occurred"), message: t("could_not_save"), tone: "warning" });
    } finally {
      setIsReassigning(false);
    }
  };

  const handleDeleteOnly = async () => {
    if (!pendingDelete) return;
    await removeItem(pendingDelete.item.id);
    setPendingDelete(null);
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

  // Commits a new order. The whole visible list is rewritten to a clean
  // 0..n-1 sequence, so positions can never drift or collide. The store is
  // updated first — the write is a handful of tiny UPDATEs and the list should
  // not wait on disk before settling under the finger.
  const commitOrder = (next) => {
    const persist =
      name === "expense_category"
        ? reorderExpenseCategories
        : name === "income_category"
        ? reorderIncomeCategories
        : reorderAccounts;

    const apply =
      name === "expense_category"
        ? storeCategory.setCategories
        : name === "income_category"
        ? setCategoriesIncome
        : setAccount;

    apply(next);
    persist(next.map((row) => row.id)).catch((err) => console.error(err));
  };

  // Keyboard / screen-reader path. Dragging is a pointer gesture with no
  // single-tap equivalent (WCAG 2.5.7), so the same move is exposed as an
  // accessibility action on each row instead of as extra on-screen buttons.
  const moveBy = (index, direction) => {
    const target = index + direction;
    if (target < 0 || target >= data.length) return;
    const next = [...data];
    [next[index], next[target]] = [next[target], next[index]];
    commitOrder(next);
  };

  const renderItem = ({ item, drag, isActive, getIndex }) => {
    const index = getIndex() ?? 0;

    return (
      <ScaleDecorator activeScale={1.03}>
        <View
          style={[
            styles.row,
            index > 0 && styles.rowDivided,
            isActive && styles.rowActive,
          ]}
          accessibilityActions={[
            { name: "moveUp", label: t("move_up") },
            { name: "moveDown", label: t("move_down") },
          ]}
          onAccessibilityAction={({ nativeEvent }) => {
            if (nativeEvent.actionName === "moveUp") moveBy(index, -1);
            if (nativeEvent.actionName === "moveDown") moveBy(index, 1);
          }}
        >
          {/* Dedicated handle: dragging starts here, so scrolling the list and
              tapping a row stay unambiguous. */}
          <Pressable
            onLongPress={drag}
            delayLongPress={120}
            disabled={isActive}
            hitSlop={6}
            accessibilityRole="button"
            accessibilityLabel={`${t("reorder")} ${item.name}`}
            style={({ pressed }) => [styles.handle, pressed && styles.pressed]}
          >
            <Ionicons
              name="reorder-three-outline"
              size={22}
              color={colors.textMuted}
            />
          </Pressable>

          <CategoryAvatar name={item.name} icon={item.icon} size={34} />
          <Text style={styles.name} numberOfLines={1}>
            {item.name}
          </Text>

          <Pressable
            onPress={() => handleEdit(item.id)}
            hitSlop={4}
            accessibilityRole="button"
            accessibilityLabel={`${t("edit")} ${item.name}`}
            style={({ pressed }) => [styles.action, pressed && styles.pressed]}
          >
            <Ionicons name="create-outline" size={18} color={colors.primary} />
          </Pressable>

          <Pressable
            onPress={() => handleDelete(item)}
            hitSlop={4}
            accessibilityRole="button"
            accessibilityLabel={`${t("delete")} ${item.name}`}
            style={({ pressed }) => [styles.action, pressed && styles.pressed]}
          >
            <Ionicons name="trash-outline" size={18} color={colors.expense} />
          </Pressable>
        </View>
      </ScaleDecorator>
    );
  };

  let data = [];
  if (name === "expense_category") data = storeCategory.categories || [];
  else if (name === "income_category") data = categoriesIncome || [];
  else data = accounts || [];

  // Only the fetch shows a spinner — an empty list is a real state with its own
  // screen, not an endless loader (the old version spun forever when empty).
  if (isLoading) {
    return <Loading />;
  }

  if (!data.length) {
    return (
      <View style={[styles.container, styles.centered]}>
        <EmptyState
          icon="folder-open-outline"
          title={t("no_items_yet")}
          actionLabel={t("add_first_item")}
          onAction={() =>
            navigation.navigate("AddManageItem", { name: addScreenName() })
          }
        />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Card chrome lives on a wrapper, not the scrolling content: a row being
          dragged is lifted and scaled, and `overflow: hidden` on the content
          container would clip it mid-drag. */}
      <View style={styles.card}>
        <DraggableFlatList
          data={data}
          renderItem={renderItem}
          keyExtractor={(item) => String(item.id)}
          onDragEnd={({ data: next }) => commitOrder(next)}
          activationDistance={8}
          showsVerticalScrollIndicator={false}
        />
      </View>
      <Text style={styles.hint}>{t("reorder_hint")}</Text>

      <ReassignSheet
        visible={!!pendingDelete}
        itemName={pendingDelete?.item.name ?? ""}
        usageCount={pendingDelete?.usage.length ?? 0}
        options={data.filter((row) => row.id !== pendingDelete?.item.id)}
        busy={isReassigning}
        onCancel={() => setPendingDelete(null)}
        onDeleteOnly={handleDeleteOnly}
        onReassign={handleReassign}
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
  centered: {
    justifyContent: "center",
  },
  card: {
    flex: 1,
    margin: spacing[4],
    marginBottom: spacing[2],
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: "hidden",
  },
  hint: {
    ...type.caption,
    fontSize: 12,
    color: colors.textMuted,
    textAlign: "center",
    paddingHorizontal: spacing[4],
    paddingBottom: spacing[4],
  },
  handle: {
    width: 32,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
  },
  rowActive: {
    backgroundColor: colors.primarySurface,
    ...GlobalStyles.shadow.md,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing[1] + 2,
    minHeight: 60,
    paddingVertical: spacing[2],
    paddingHorizontal: spacing[3],
  },
  rowDivided: {
    borderTopWidth: 1,
    borderTopColor: colors.n100,
  },
  name: {
    flex: 1,
    minWidth: 0,
    marginLeft: spacing[1],
    ...type.body,
    fontSize: 15.5,
    fontWeight: "500",
    color: colors.text,
  },
  action: {
    width: 36,
    height: 36,
    borderRadius: radius.full,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.surfaceAlt,
  },
  actionDisabled: {
    opacity: 0.3,
  },
  pressed: {
    opacity: 0.6,
  },
});
