import { StyleSheet, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { GlobalStyles } from "../../constants/styles";
import useKeyboardVisible from "../../hooks/useKeyboardVisible";

const { colors, spacing } = GlobalStyles;

// The row of actions pinned to the bottom of a form.
//
// Android has drawn edge to edge since SDK 54, and iPhones have the home
// indicator: in both cases the app's own bottom edge is UNDERNEATH something
// the system owns. A bar with a fixed bottom padding puts its buttons behind
// the back/home/recents controls — which is exactly where Cancel and Add ended
// up on Android.
//
// The inset is however much the system actually took (a three-button bar, a
// gesture pill, or nothing), so it is read at runtime rather than guessed, and
// it lives here so the next screen with a bottom bar cannot forget it.
const ActionBar = ({ children, style }) => {
  const insets = useSafeAreaInsets();
  // While the keyboard is up it covers the navigation bar, so reserving space
  // for that bar as well leaves a dead strip between the buttons and the
  // keyboard — which is most of the empty gap under Cancel/Add on Android.
  const keyboardVisible = useKeyboardVisible();

  return (
    <View
      style={[
        styles.bar,
        { paddingBottom: spacing[4] + (keyboardVisible ? 0 : insets.bottom) },
        style,
      ]}
    >
      {children}
    </View>
  );
};

export default ActionBar;

const styles = StyleSheet.create({
  bar: {
    paddingHorizontal: spacing[4],
    paddingTop: spacing[3],
    backgroundColor: colors.surface,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
});
