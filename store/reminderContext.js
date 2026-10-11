import { createContext, useContext, useEffect, useState } from "react";
import { Platform } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Notifications from "expo-notifications";

const STORAGE_KEY = "dailyReminder";

// 20:00 — the report's chosen slot: late enough that the day's spending has
// happened, early enough that the user is still awake to log it.
const DEFAULT_REMINDER = { enabled: false, hour: 20, minute: 0 };

// Identifies our one scheduled notification so re-scheduling replaces it
// instead of stacking duplicates.
const CHANNEL_ID = "daily-reminder";

const ReminderContext = createContext({
  reminder: DEFAULT_REMINDER,
  isReady: false,
  permissionDenied: false,
  setEnabled: async () => {},
  setTime: async () => {},
});

const ReminderProvider = ({ children }) => {
  const [reminder, setReminder] = useState(DEFAULT_REMINDER);
  const [isReady, setIsReady] = useState(false);
  const [permissionDenied, setPermissionDenied] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        // Android needs an explicit channel before anything is scheduled.
        if (Platform.OS === "android") {
          await Notifications.setNotificationChannelAsync(CHANNEL_ID, {
            name: "Daily reminder",
            importance: Notifications.AndroidImportance.DEFAULT,
          });
        }
        const stored = await AsyncStorage.getItem(STORAGE_KEY);
        if (stored) setReminder({ ...DEFAULT_REMINDER, ...JSON.parse(stored) });
      } catch (err) {
        console.error(err);
      } finally {
        setIsReady(true);
      }
    })();
  }, []);

  const persist = async (next) => {
    setReminder(next);
    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    } catch (err) {
      console.error(err);
    }
  };

  // Cancels any existing reminder, then schedules a daily repeat if enabled.
  const apply = async (next, content) => {
    await Notifications.cancelAllScheduledNotificationsAsync();
    if (!next.enabled) return true;

    const { status } = await Notifications.getPermissionsAsync();
    let granted = status === "granted";
    if (!granted) {
      const asked = await Notifications.requestPermissionsAsync();
      granted = asked.status === "granted";
    }
    if (!granted) {
      setPermissionDenied(true);
      return false;
    }
    setPermissionDenied(false);

    await Notifications.scheduleNotificationAsync({
      content: {
        title: content?.title || "MoneyMind",
        body: content?.body || "What did you spend today?",
        sound: true,
      },
      trigger: {
        hour: next.hour,
        minute: next.minute,
        repeats: true,
        channelId: Platform.OS === "android" ? CHANNEL_ID : undefined,
      },
    });
    return true;
  };

  // `content` comes from the caller so the notification text is localised by
  // whatever language is active when the user sets the reminder.
  const setEnabled = async (enabled, content) => {
    const next = { ...reminder, enabled };
    const ok = await apply(next, content);
    await persist({ ...next, enabled: enabled && ok });
    return ok;
  };

  const setTime = async (hour, minute, content) => {
    const next = { ...reminder, hour, minute };
    await apply(next, content);
    await persist(next);
  };

  return (
    <ReminderContext.Provider
      value={{ reminder, isReady, permissionDenied, setEnabled, setTime }}
    >
      {children}
    </ReminderContext.Provider>
  );
};

export const useReminder = () => useContext(ReminderContext);
export default ReminderProvider;
