import { useEffect, useState } from "react";
import { Keyboard, Platform } from "react-native";

// Whether the soft keyboard is currently on screen.
//
// iOS announces the keyboard before it animates, Android only once it has
// arrived, so each platform gets the event that fires at the right moment —
// using `DidShow` on iOS makes layout jump a frame after the keyboard.
const useKeyboardVisible = () => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const showEvent =
      Platform.OS === "ios" ? "keyboardWillShow" : "keyboardDidShow";
    const hideEvent =
      Platform.OS === "ios" ? "keyboardWillHide" : "keyboardDidHide";

    const shown = Keyboard.addListener(showEvent, () => setVisible(true));
    const hidden = Keyboard.addListener(hideEvent, () => setVisible(false));

    return () => {
      shown.remove();
      hidden.remove();
    };
  }, []);

  return visible;
};

export default useKeyboardVisible;
