import { GlobalStyles } from "../constants/styles";

// Shared header/tab-bar styling reused by every bottom-tab navigator.
export const baseTabScreenOptions = {
  headerStyle: { backgroundColor: GlobalStyles.colors.primary500 },
  headerTintColor: "#fff",
  tabBarStyle: { backgroundColor: GlobalStyles.colors.primary500 },
  tabBarActiveTintColor: GlobalStyles.colors.accent500,
  tabBarLabelStyle: { paddingBottom: 5 },
};
