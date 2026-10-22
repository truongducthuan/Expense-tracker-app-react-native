import { useCallback } from "react";
import { useFocusEffect } from "@react-navigation/native";
import { setStatusBarStyle } from "expo-status-bar";

// Everywhere else the screen starts with a teal header, so the clock and
// battery are drawn light. The sign-in screens sit on the pale mint background
// instead, and light-on-mint made them all but invisible — about 1.1:1, against
// the 4.5:1 the rest of this design holds itself to. Dark while the screen has
// focus, back to light on the way out.
//
// Call it once for a whole group of mint screens (the auth stack), not in each
// of them: a screen being pushed runs its focus effect on mount, BEFORE the
// navigator blurs the one underneath, so the older screen's cleanup would win
// and switch the bar back to light on the new screen.
const useDarkStatusBar = () =>
  useFocusEffect(
    useCallback(() => {
      setStatusBarStyle("dark");
      return () => setStatusBarStyle("light");
    }, [])
  );

export default useDarkStatusBar;
