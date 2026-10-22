import { Platform } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";

import { getNotifications } from "./notifications";
import { getStartOfWeek } from "./date";

// The "Remind me at 70/80/90/100%" setting on a budget. It was saved with every
// budget but nothing ever read it, so no alert was ever sent.

const STORAGE_KEY = "budgetAlertsSent";
export const BUDGET_ALERT_CHANNEL = "budget-alerts";

// Which alerts have already gone out, per budget: the period/limit/threshold
// they were for, and the highest level sent. Each level is sent once per
// period; editing the limit or the threshold starts over, since the old alert
// no longer describes the budget.
export const loadSentAlerts = async () => {
  try {
    const stored = await AsyncStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : {};
  } catch (err) {
    console.error(err);
    return {};
  }
};

export const saveSentAlerts = async (sent) => {
  try {
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(sent));
  } catch (err) {
    console.error(err);
  }
};

// Identifies "this budget, as configured, in this period".
export const alertSignature = (budget, now = new Date()) => {
  let periodKey;
  if (budget.period === "weekly") {
    const start = getStartOfWeek(now);
    periodKey = `w${start.getFullYear()}-${start.getMonth() + 1}-${start.getDate()}`;
  } else if (budget.period === "yearly") {
    periodKey = `y${now.getFullYear()}`;
  } else {
    periodKey = `m${now.getFullYear()}-${now.getMonth() + 1}`;
  }
  return `${periodKey}|${budget.amount}|${budget.threshold}`;
};

// 0 = nothing due, 1 = reached the user's threshold, 2 = over the limit.
// A 100% threshold has no separate warning: reaching it IS going over.
export const alertLevel = (progress) => {
  if (progress.limit <= 0) return 0;
  if (progress.ratio >= 1) return 2;
  const threshold = Number(progress.threshold) || 80;
  if (threshold < 100 && progress.ratio * 100 >= threshold) return 1;
  return 0;
};

// Asks only while the system still lets us; once the user has said no for
// good, this stays quiet rather than nagging.
const ensurePermission = async (Notifications) => {
  const current = await Notifications.getPermissionsAsync();
  if (current.status === "granted") return true;
  if (!current.canAskAgain) return false;
  const asked = await Notifications.requestPermissionsAsync();
  return asked.status === "granted";
};

// Asked when a budget is saved: that is when the user has just chosen to be
// reminded. Budgets made before alerts existed never went through that, so
// the first alert that comes due asks as well (see sendBudgetAlert).
export const requestBudgetAlertPermission = async () => {
  const Notifications = getNotifications();
  if (!Notifications) return false;
  try {
    return await ensurePermission(Notifications);
  } catch (err) {
    console.error(err);
    return false;
  }
};

// Fires immediately. Returns false when it could not be shown (no permission,
// or no notification support in this client), so the caller doesn't mark it
// as sent.
export const sendBudgetAlert = async ({ title, body, channelName }) => {
  const Notifications = getNotifications();
  if (!Notifications) return false;
  try {
    if (!(await ensurePermission(Notifications))) return false;
    if (Platform.OS === "android") {
      await Notifications.setNotificationChannelAsync(BUDGET_ALERT_CHANNEL, {
        name: channelName,
        importance: Notifications.AndroidImportance.HIGH,
      });
    }
    await Notifications.scheduleNotificationAsync({
      content: { title, body, sound: true, data: { kind: BUDGET_ALERT_CHANNEL } },
      trigger:
        Platform.OS === "android" ? { channelId: BUDGET_ALERT_CHANNEL } : null,
    });
    return true;
  } catch (err) {
    console.error("could not send budget alert:", err);
    return false;
  }
};
