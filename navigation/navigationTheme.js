import { GlobalStyles } from "../constants/styles";

const { colors, type } = GlobalStyles;

// Shared header styling: teal bar, white content.
export const baseHeaderOptions = {
  headerStyle: { backgroundColor: colors.primary },
  headerTintColor: colors.onPrimary,
  headerTitleStyle: { ...type.h3, color: colors.onPrimary },
  headerShadowVisible: false,
};

// Shared header/tab-bar styling reused by every bottom-tab navigator.
//
// The tab bar is a light surface with a teal active tint rather than the old
// solid-colour bar: it keeps the screen's visual weight at the content and lets
// the centre action button read as the primary affordance.
export const baseTabScreenOptions = {
  ...baseHeaderOptions,
  tabBarStyle: {
    backgroundColor: colors.surface,
    borderTopColor: colors.border,
    borderTopWidth: 1,
    height: 62,
    paddingTop: 6,
    paddingBottom: 8,
    // The raised centre action overhangs the bar, so it must not be clipped
    // (Android clips by default once elevation is set).
    elevation: 0,
    overflow: "visible",
  },
  tabBarActiveTintColor: colors.primary,
  tabBarInactiveTintColor: colors.textMuted,
  tabBarLabelStyle: { fontSize: 11, fontWeight: "600" },
  tabBarItemStyle: { paddingTop: 2 },
};

// react-navigation theme so the containers/cards behind screens match.
export const appNavigationTheme = {
  dark: false,
  colors: {
    primary: colors.primary,
    background: colors.screen,
    card: colors.surface,
    text: colors.text,
    border: colors.border,
    notification: colors.expense,
  },
};
