import { useState } from "react";
import {
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import DateTimePicker from "@react-native-community/datetimepicker";
import { useNavigation } from "@react-navigation/native";

import Card from "../components/ui/Card";
import SegmentedControl from "../components/ui/SegmentedControl";
import { GlobalStyles } from "../constants/styles";
import { CURRENCY_CODES, CURRENCIES } from "../constants/currencies";
import { useLanguage } from "../store/languageContext";
import { useCurrency } from "../store/currencyContext";
import { useReminder } from "../store/reminderContext";

const { colors, spacing, radius, type } = GlobalStyles;

const LANGS = [
  { code: "vi", labelKey: "vietnamese" },
  { code: "en", labelKey: "english" },
];

const CATEGORY_LINKS = [
  {
    titleKey: "expense_category",
    screen: "ManageCategoryExpense",
    icon: "trending-down",
    tint: GlobalStyles.colors.expense,
    surface: GlobalStyles.colors.expenseSurface,
  },
  {
    titleKey: "income_category",
    screen: "ManageCategoryIncome",
    icon: "trending-up",
    tint: GlobalStyles.colors.income,
    surface: GlobalStyles.colors.incomeSurface,
  },
  {
    titleKey: "accounts",
    screen: "ManageAccount",
    icon: "wallet",
    tint: GlobalStyles.colors.primary,
    surface: GlobalStyles.colors.primarySurface,
  },
];

const pad = (n) => String(n).padStart(2, "0");

// Settings grouped by the task it serves rather than by where the data lives
// (Nielsen #2): what the app does for you, how it shows money, then the lists
// you own.
const Settings = () => {
  const navigation = useNavigation();
  const { lang, setLang, t } = useLanguage();
  const { code, setCurrency } = useCurrency();
  const { reminder, permissionDenied, setEnabled, setTime } = useReminder();

  const [showTimePicker, setShowTimePicker] = useState(false);

  const notificationContent = {
    title: t("reminder_title"),
    body: t("reminder_body"),
  };

  const handleToggleReminder = (value) => {
    setEnabled(value, notificationContent);
  };

  const handleTimeChange = (event, date) => {
    // Android fires with type "dismissed" when the user backs out.
    setShowTimePicker(Platform.OS === "ios");
    if (event?.type === "dismissed" || !date) return;
    setTime(date.getHours(), date.getMinutes(), notificationContent);
  };

  const reminderDate = new Date();
  reminderDate.setHours(reminder.hour, reminder.minute, 0, 0);

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Reminder ------------------------------------------------------- */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>{t("reminder")}</Text>
        <Card padded={false}>
          <View style={styles.row}>
            <View style={[styles.rowIcon, { backgroundColor: colors.warningSurface }]}>
              <Ionicons
                name="notifications"
                size={19}
                color={colors.warningText}
              />
            </View>
            <View style={styles.rowText}>
              <Text style={styles.rowTitle}>{t("daily_reminder")}</Text>
              <Text style={styles.rowHint}>{t("daily_reminder_hint")}</Text>
            </View>
            <Switch
              value={reminder.enabled}
              onValueChange={handleToggleReminder}
              trackColor={{ false: colors.border, true: colors.primaryLight }}
              thumbColor={reminder.enabled ? colors.primary : colors.surface}
              accessibilityLabel={t("daily_reminder")}
            />
          </View>

          {reminder.enabled && (
            <Pressable
              onPress={() => setShowTimePicker(true)}
              accessibilityRole="button"
              style={({ pressed }) => [
                styles.row,
                styles.rowDivided,
                pressed && styles.pressed,
              ]}
            >
              <View style={[styles.rowIcon, { backgroundColor: colors.primarySurface }]}>
                <Ionicons name="time" size={19} color={colors.primary} />
              </View>
              <Text style={styles.rowTitle}>{t("reminder_time")}</Text>
              <Text style={styles.rowValue}>
                {pad(reminder.hour)}:{pad(reminder.minute)}
              </Text>
              <Ionicons name="chevron-forward" size={18} color={colors.border} />
            </Pressable>
          )}

          {permissionDenied && (
            <View style={[styles.row, styles.rowDivided, styles.warningRow]}>
              <Ionicons
                name="alert-circle"
                size={18}
                color={colors.warningText}
              />
              <View style={styles.rowText}>
                <Text style={styles.warningTitle}>
                  {t("notifications_blocked")}
                </Text>
                <Text style={styles.rowHint}>
                  {t("notifications_blocked_hint")}
                </Text>
              </View>
            </View>
          )}
        </Card>

        {showTimePicker && (
          <DateTimePicker
            value={reminderDate}
            mode="time"
            is24Hour
            display={Platform.OS === "ios" ? "spinner" : "default"}
            onChange={handleTimeChange}
          />
        )}
      </View>

      {/* Display -------------------------------------------------------- */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>{t("preferences")}</Text>
        <Card>
          <Text style={styles.fieldLabel}>{t("language")}</Text>
          <SegmentedControl
            options={LANGS.map(({ code: c, labelKey }) => ({
              value: c,
              label: t(labelKey),
            }))}
            value={lang}
            onChange={setLang}
          />

          <Text style={[styles.fieldLabel, styles.fieldSpaced]}>
            {t("currency_unit")}
          </Text>
          <View style={styles.currencyGrid}>
            {CURRENCY_CODES.map((c) => {
              const active = code === c;
              return (
                <Pressable
                  key={c}
                  onPress={() => setCurrency(c)}
                  accessibilityRole="button"
                  accessibilityState={{ selected: active }}
                  style={({ pressed }) => [
                    styles.currencyChip,
                    active && styles.currencyChipActive,
                    pressed && styles.pressed,
                  ]}
                >
                  <Text
                    style={[
                      styles.currencySymbol,
                      active && styles.currencyTextActive,
                    ]}
                  >
                    {CURRENCIES[c].symbol}
                  </Text>
                  <Text
                    style={[
                      styles.currencyCode,
                      active && styles.currencyTextActive,
                    ]}
                  >
                    {c}
                  </Text>
                </Pressable>
              );
            })}
          </View>
          <Text style={styles.note}>{t("currency_display_note")}</Text>
        </Card>
      </View>

      {/* Data ----------------------------------------------------------- */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>{t("manage_categories")}</Text>
        <Card padded={false}>
          {CATEGORY_LINKS.map(({ titleKey, screen, icon, tint, surface }, index) => (
            <Pressable
              key={screen}
              onPress={() => navigation.navigate("ManageItem", { screen })}
              accessibilityRole="button"
              android_ripple={{ color: colors.surfaceAlt }}
              style={({ pressed }) => [
                styles.row,
                index > 0 && styles.rowDivided,
                pressed && styles.pressed,
              ]}
            >
              <View style={[styles.rowIcon, { backgroundColor: surface }]}>
                <Ionicons name={icon} size={19} color={tint} />
              </View>
              <Text style={styles.rowTitle}>{t(titleKey)}</Text>
              <Ionicons name="chevron-forward" size={18} color={colors.border} />
            </Pressable>
          ))}
        </Card>
      </View>
    </ScrollView>
  );
};

export default Settings;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.screen,
  },
  content: {
    padding: spacing[4],
    paddingBottom: spacing[6],
    gap: spacing[5],
  },
  section: {
    gap: spacing[2],
  },
  sectionTitle: {
    ...type.label,
    color: colors.textMuted,
    paddingHorizontal: spacing[1],
  },
  fieldLabel: {
    ...type.caption,
    color: colors.textBody,
    marginBottom: spacing[2],
  },
  fieldSpaced: {
    marginTop: spacing[4],
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing[3],
    minHeight: 56,
    paddingVertical: spacing[3],
    paddingHorizontal: spacing[4],
  },
  rowDivided: {
    borderTopWidth: 1,
    borderTopColor: colors.n100,
  },
  rowIcon: {
    width: 36,
    height: 36,
    borderRadius: radius.sm + 2,
    alignItems: "center",
    justifyContent: "center",
  },
  rowText: {
    flex: 1,
    minWidth: 0,
  },
  rowTitle: {
    flex: 1,
    ...type.body,
    fontSize: 15.5,
    color: colors.text,
  },
  rowHint: {
    ...type.caption,
    fontSize: 12.5,
    color: colors.textMuted,
    marginTop: 1,
  },
  rowValue: {
    ...type.bodyEmphasis,
    fontWeight: "600",
    color: colors.primary,
  },
  warningRow: {
    backgroundColor: colors.warningSurface,
    alignItems: "flex-start",
  },
  warningTitle: {
    ...type.bodyEmphasis,
    fontSize: 14,
    color: colors.warningText,
  },
  currencyGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing[2],
  },
  currencyChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    minHeight: 44,
    paddingHorizontal: spacing[3],
    borderRadius: radius.full,
    borderWidth: 1.5,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  currencyChipActive: {
    borderColor: colors.primary,
    backgroundColor: colors.primarySurface,
  },
  currencySymbol: {
    fontSize: 15,
    fontWeight: "700",
    color: colors.textBody,
  },
  currencyCode: {
    fontSize: 12.5,
    fontWeight: "600",
    color: colors.textMuted,
  },
  currencyTextActive: {
    color: colors.primary,
  },
  note: {
    ...type.caption,
    fontSize: 12,
    color: colors.textMuted,
    marginTop: spacing[2],
  },
  pressed: {
    backgroundColor: colors.surfaceAlt,
  },
});
