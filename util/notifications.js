import { Platform } from "react-native";
import Constants, { ExecutionEnvironment } from "expo-constants";

// Why expo-notifications is never imported directly anywhere else.
//
// Importing the package runs DevicePushTokenAutoRegistration.fx, which
// registers a push-token listener at module scope. Since SDK 53 that listener
// THROWS inside Expo Go on Android — remote notifications were taken out of
// the Expo Go client — so a plain `import … from "expo-notifications"` kills
// the app at startup there, before a single screen renders. The app never asks
// for a push token; it only schedules a local reminder. It was taken down by a
// side effect of someone else's module.
//
// So the package is required lazily, and only where it can survive being
// loaded. Everything else asks this module first.

export const inExpoGo =
  Constants.executionEnvironment === ExecutionEnvironment.StoreClient;

// Expo Go on iOS still carries the notification code; only the Android client
// dropped it. A real build (development, TestFlight, store) has it on both.
export const notificationsAvailable = !(inExpoGo && Platform.OS === "android");

let cached = null;

export const getNotifications = () => {
  if (!notificationsAvailable) return null;
  // A literal string, so Metro still bundles it — it is the evaluation that is
  // deferred, not the resolution.
  if (!cached) cached = require("expo-notifications");
  return cached;
};
