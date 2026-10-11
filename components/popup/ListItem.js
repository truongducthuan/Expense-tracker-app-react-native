import { FlatList, Pressable, StyleSheet, Text, View } from "react-native";

import CategoryAvatar from "../ui/CategoryAvatar";
import EmptyState from "../ui/EmptyState";
import { GlobalStyles } from "../../constants/styles";
import { ExpenseStore } from "../../store/context";
import { useLanguage } from "../../store/languageContext";

const { colors, spacing, radius, type } = GlobalStyles;

// Tile grid of categories / accounts. Icon + label on each tile so the user
// recognises the option instead of reading a list of bare names (Nielsen #6),
// and the current choice is outlined rather than only tinted.
const ListItem = ({ items, name, setIsPopup, selected }) => {
  const { setValueInputCategory, setValueInputAccount } = ExpenseStore();
  const { t } = useLanguage();

  const handleSelect = (value) => {
    if (name === "category") setValueInputCategory(value);
    else setValueInputAccount(value);
    setIsPopup(false);
  };

  const renderItem = ({ item }) => {
    const active = selected === item.name;
    return (
      <Pressable
        onPress={() => handleSelect(item.name)}
        accessibilityRole="button"
        accessibilityState={{ selected: active }}
        style={({ pressed }) => [
          styles.tile,
          active && styles.tileActive,
          pressed && styles.pressed,
        ]}
      >
        <CategoryAvatar name={item.name} icon={item.icon} size={38} />
        <Text
          style={[styles.name, active && styles.nameActive]}
          numberOfLines={2}
        >
          {item.name}
        </Text>
      </Pressable>
    );
  };

  return (
    <FlatList
      data={items}
      renderItem={renderItem}
      keyExtractor={(item) => String(item.id)}
      numColumns={3}
      columnWrapperStyle={styles.column}
      contentContainerStyle={styles.content}
      ListEmptyComponent={<EmptyState title={t("no_items_yet")} icon="folder-open-outline" />}
      showsVerticalScrollIndicator={false}
    />
  );
};

export default ListItem;

const styles = StyleSheet.create({
  content: {
    paddingHorizontal: spacing[4],
    paddingTop: spacing[3],
    paddingBottom: spacing[6],
    gap: spacing[2],
  },
  column: {
    gap: spacing[2],
  },
  tile: {
    flex: 1,
    minHeight: 92,
    alignItems: "center",
    justifyContent: "center",
    gap: spacing[1] + 2,
    paddingVertical: spacing[3],
    paddingHorizontal: spacing[1] + 2,
    borderRadius: radius.md,
    borderWidth: 1.5,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  tileActive: {
    borderColor: colors.primary,
    backgroundColor: colors.primarySurface,
  },
  name: {
    ...type.caption,
    fontSize: 12,
    fontWeight: "500",
    color: colors.textBody,
    textAlign: "center",
  },
  nameActive: {
    color: colors.primary,
    fontWeight: "600",
  },
  pressed: {
    opacity: 0.7,
  },
});
