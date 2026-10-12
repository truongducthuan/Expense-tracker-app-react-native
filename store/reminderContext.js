import { createContext, useContext, useEffect, useRef, useState } from "react";
import { Platform } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Notifications from "expo-notifications";

import { useLanguage } from "./languageContext";

const STORAGE_KEY = "dailyReminder";

// 20:00 — the report's chosen slot: late enough that the day's spending has
// happened, early enough that the user is still awake to log it.
const DEFAULT_REMINDER = { enabled: false, hour: 20, minute: 0 };

const CHANNEL_ID = "daily-reminder";

const ReminderContext = createContext({
  reminder: DEFAULT_REMINDER,
  isReady: false,
  permissionDenied: false,
  setEnabled: async () => {},
  setTime: async () => {},
});

const ReminderProvider = ({ children }) => {
  const { t, lang } = useLanguage();
  const [reminder, setReminder] = useState(DEFAULT_REMINDER);
  const [isReady, setIsReady] = useState(false);
  const [permissionDenied, setPermissionDenied] = useState(false);

  // Identifier of the notification we scheduled, so it can be cancelled on its
  // own. Cancelling *all* scheduled notifications would also wipe anything a
  // future feature schedules.
  const scheduledId = useRef(null);

  const content = () => ({
    title: t("reminder_title"),
    body: t("reminder_body"),
  });

  const ensureChannel = async () => {
    if (Platform.OS !== "android") return;
    await Notifications.setNotificationChannelAsync(CHANNEL_ID, {
      name: t("daily_reminder"),
      importance: Notifications.AndroidImportance.DEFAULT,
    });
  };

  const cancelExisting = async () => {
    try {
      if (scheduledId.current) {
        await Notifications.cancelScheduledNotificationAsync(scheduledId.current);
        scheduledId.current = null;
        return;
      }
      // First run of this session: adopt whatever we scheduled previously so a
      // re-arm replaces it instead of stacking a second daily alert.
      const existing = await Notifications.getAllScheduledNotificationsAsync();
      await Promise.all(
        existing
          .filter((n) => n.content?.data?.kind === CHANNEL_ID)
          .map((n) => Notifications.cancelScheduledNotificationAsync(n.identifier))
      );
    } catch (err) {
      console.error("could not cancel reminder:", err);
    }
  };

  // Cancels any existing reminder, then schedules a daily repeat if enabled.
  const apply = async (next) => {
    await cancelExisting();
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

    await ensureChannel();

    scheduledId.current = await Notifications.scheduleNotificationAsync({
      content: {
        ...content(),
        sound: true,
        // Tags the notification as ours so a later session can find and
        // replace it without touching anything else.
        data: { kind: CHANNEL_ID },
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

  const persist = async (next) => {
    setReminder(next);
    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    } catch (err) {
      console.error(err);
    }
  };

  // Re-arm on every start, and whenever the language changes.
  //
  // Two reasons, both of which showed up as silent failures otherwise:
  //  • Android drops scheduled notifications on force-stop, app update and
  //    some OEM battery managers. Without re-arming, the switch still read
  //    "on" while nothing would ever fire again.
  //  • the text is baked in when scheduled, so a reminder set in Vietnamese
  //    kept arriving in Vietnamese after switching to English.
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        await ensureChannel();
        const stored = await AsyncStorage.getItem(STORAGE_KEY);
        const next = stored
          ? { ...DEFAULT_REMINDER, ...JSON.parse(stored) }
          : DEFAULT_REMINDER;
        if (cancelled) return;
        setReminder(next);

        if (next.enabled) {
          const ok = await apply(next);
          // Permission can be revoked between sessions; reflect that rather
          // than showing a reminder that cannot fire.
          if (!ok && !cancelled) await persist({ ...next, enabled: false });
        }
      } catch (err) {
        console.error(err);
      } finally {
        if (!cancelled) setIsReady(true);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [lang]);

  const setEnabled = async (enabled) => {
    const next = { ...reminder, enabled };
    const ok = await apply(next);
    await persist({ ...next, enabled: enabled && ok });
    return ok;
  };

  const setTime = async (hour, minute) => {
    const next = { ...reminder, hour, minute };
    await apply(next);
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
