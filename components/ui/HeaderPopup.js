import { Pressable, StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";

import { GlobalStyles } from "../../constants/styles";
import { useLanguage } from "../../store/languageContext";

const { colors, spacing, radius, type } = GlobalStyles;

// Header of the picker sheet: a grab handle, the title, and the two actions
// (manage the list / close). Both actions are 44pt targets (WCAG 2.5.5).
const HeaderPopup = ({ name, icon, size = 20, setIsPopup }) => {
  const navigation = useNavigation();
  const { t } = useLanguage();

  return (
    <View style={styles.wrap}>
      <View style={styles.handle} />
      <View style={styles.row}>
        <Text style={styles.title}>
          {name === "category" ? t("select_category") : t("select_account")}
        </Text>
        <View style={styles.actions}>
          <Pressable
            onPress={() => navigation.navigate("ManageItem")}
            hitSlop={8}
            accessibilityRole="button"
            accessibilityLabel={t("manage_categories")}
            style={({ pressed }) => [styles.action, pressed && styles.pressed]}
          >
            <Ionicons name={icon} size={size} color={colors.primary} />
          </Pressable>
          <Pressable
            onPress={() => setIsPopup((state) => !state)}
            hitSlop={8}
            accessibilityRole="button"
            accessibilityLabel={t("cancel")}
            style={({ pressed }) => [styles.action, pressed && styles.pressed]}
          >
            <Ionicons name="close" size={size} color={colors.textMuted} />
          </Pressable>
        </View>
      </View>
    </View>
  );
};

export default HeaderPopup;

const styles = StyleSheet.create({
  wrap: {
    paddingTop: spacing[2],
    paddingBottom: spacing[2],
    paddingHorizontal: spacing[4],
    borderBottomWidth: 1,
    borderBottomColor: colors.n100,
  },
  handle: {
    alignSelf: "center",
    width: 40,
    height: 4,
    borderRadius: radius.full,
    backgroundColor: colors.border,
    marginBottom: spacing[2],
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  title: {
    ...type.h3,
    color: colors.text,
    flex: 1,
  },
  actions: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing[2],
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
