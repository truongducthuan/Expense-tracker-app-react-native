import { ScrollView, StyleSheet, Text, View, Pressable } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";

import { GlobalStyles } from "../constants/styles";
import { useLanguage } from "../store/languageContext";

const LANGS = [
  { code: "vi", labelKey: "vietnamese" },
  { code: "en", labelKey: "english" },
];

const CATEGORY_LINKS = [
  {
    titleKey: "expense_category",
    screen: "ManageCategoryExpense",
    icon: "trending-down",
  },
  {
    titleKey: "income_category",
    screen: "ManageCategoryIncome",
    icon: "trending-up",
  },
  { titleKey: "accounts", screen: "ManageAccount", icon: "wallet" },
];

const Settings = () => {
  const navigation = useNavigation();
  const { lang, setLang, t } = useLanguage();

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.sectionTitle}>{t("language")}</Text>
      <View style={styles.langRow}>
        {LANGS.map(({ code, labelKey }) => {
          const active = lang === code;
          return (
            <Pressable
              key={code}
              onPress={() => setLang(code)}
              style={({ pressed }) => [
                styles.langButton,
                active && styles.langButtonActive,
                pressed && styles.pressed,
              ]}
            >
              <Text
                style={[styles.langText, active && styles.langTextActive]}
              >
                {t(labelKey)}
              </Text>
            </Pressable>
          );
        })}
      </View>

      <Text style={styles.sectionTitle}>{t("manage_categories")}</Text>
      <View style={styles.linksGroup}>
        {CATEGORY_LINKS.map(({ titleKey, screen, icon }) => (
          <Pressable
            key={screen}
            onPress={() =>
              navigation.navigate("ManageItem", { screen })
            }
            style={({ pressed }) => [
              styles.linkRow,
              pressed && styles.pressed,
            ]}
          >
            <Ionicons
              name={icon}
              size={22}
              color={GlobalStyles.colors.primary500}
            />
            <Text style={styles.linkText}>{t(titleKey)}</Text>
            <Ionicons
              name="chevron-forward"
              size={20}
              color={GlobalStyles.colors.primary400}
            />
          </Pressable>
        ))}
      </View>
    </ScrollView>
  );
};

export default Settings;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: GlobalStyles.colors.primary700,
  },
  content: {
    padding: 20,
    paddingBottom: 40,
  },
  sectionTitle: {
    color: "#fff",
    fontSize: 13,
    fontWeight: "600",
    textTransform: "uppercase",
    marginTop: 12,
    marginBottom: 8,
    opacity: 0.8,
  },
  langRow: {
    flexDirection: "row",
    backgroundColor: GlobalStyles.colors.primary50,
    borderRadius: 10,
    padding: 4,
  },
  langButton: {
    flex: 1,
    paddingVertical: 10,
    alignItems: "center",
    borderRadius: 8,
  },
  langButtonActive: {
    backgroundColor: GlobalStyles.colors.primary500,
  },
  langText: {
    fontSize: 15,
    color: GlobalStyles.colors.primary500,
    fontWeight: "500",
  },
  langTextActive: {
    color: "#fff",
    fontWeight: "700",
  },
  linksGroup: {
    backgroundColor: GlobalStyles.colors.primary50,
    borderRadius: 10,
    overflow: "hidden",
  },
  linkRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 14,
    paddingHorizontal: 14,
    gap: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: GlobalStyles.colors.primary200,
  },
  linkText: {
    flex: 1,
    fontSize: 16,
    color: GlobalStyles.colors.primary700,
  },
  pressed: {
    opacity: 0.6,
  },
});
