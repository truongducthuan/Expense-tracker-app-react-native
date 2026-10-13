import "react-native-gesture-handler";
import { useEffect } from "react";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { NavigationContainer } from "@react-navigation/native";
import * as SplashScreen from "expo-splash-screen";

import ContextProvider from "./store";
import RootNavigator from "./navigation/RootNavigator";
import { appNavigationTheme } from "./navigation/navigationTheme";
import { initDatabases } from "./util/database";
import { getNotifications } from "./util/notifications";

SplashScreen.preventAutoHideAsync();

// Show the daily reminder even while the app is in the foreground — otherwise
// a user who happens to have it open at 20:00 silently misses the nudge.
//
// Loaded through the guard: importing expo-notifications directly takes the
// app down on launch inside Expo Go on Android (see util/notifications.js).
getNotifications()?.setNotificationHandler({
  handleNotification: async () => ({
    // `shouldShowAlert` was split in two: the banner that slides in, and the
    // entry kept in the notification centre. Both are wanted here.
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: false,
    shouldSetBadge: false,
  }),
});

export default function App() {
  // One entry point: it runs every table's migrations and only then lets the
  // screens' reads through, so no screen can render pre-migration rows.
  useEffect(() => {
    initDatabases();
  }, []);

  return (
    // Gesture Handler v2 needs this at the root for gestures declared with the
    // new API (the drag-to-reorder list) to receive touches on Android.
    <GestureHandlerRootView style={{ flex: 1 }}>
      {/* Supplies the real device insets. Without it `useSafeAreaInsets` reads
          zero, and the tab bar would sit under the iPhone home indicator. */}
      <SafeAreaProvider>
        {/* The header is teal everywhere, so the status bar content is always light. */}
        <StatusBar style="light" />
        <ContextProvider>
          <NavigationContainer theme={appNavigationTheme}>
            <RootNavigator />
          </NavigationContainer>
        </ContextProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
