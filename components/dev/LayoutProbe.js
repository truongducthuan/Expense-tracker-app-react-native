import { useEffect, useState } from "react";
import { Dimensions, Keyboard, Platform, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

// TEMPORARY. Prints the numbers that decide this screen's layout, so a
// screenshot answers what the screen itself cannot: whether the window is
// being resized for the keyboard, how tall the scroll area really is, and
// what the safe-area insets report. Delete once the keyboard bugs are closed.
const LayoutProbe = ({ rootHeight, scrollHeight, kavHeight }) => {
  const insets = useSafeAreaInsets();
  const [kb, setKb] = useState({ h: 0, screenY: 0 });
  const [dims, setDims] = useState({
    win: Dimensions.get("window").height,
    scr: Dimensions.get("screen").height,
  });

  useEffect(() => {
    const show = Keyboard.addListener("keyboardDidShow", (e) =>
      setKb({
        h: Math.round(e.endCoordinates.height),
        screenY: Math.round(e.endCoordinates.screenY),
      })
    );
    const hide = Keyboard.addListener("keyboardDidHide", () =>
      setKb({ h: 0, screenY: 0 })
    );
    const dim = Dimensions.addEventListener("change", ({ window, screen }) =>
      setDims({ win: window.height, scr: screen.height })
    );
    return () => {
      show.remove();
      hide.remove();
      dim.remove();
    };
  }, []);

  const line = (label, value) => (
    <Text style={styles.text}>
      {label}: {value}
    </Text>
  );

  return (
    <View style={styles.box} pointerEvents="none">
      {line("win/scr", `${Math.round(dims.win)}/${Math.round(dims.scr)}`)}
      {line("insets t/b", `${Math.round(insets.top)}/${Math.round(insets.bottom)}`)}
      {line("kb h/screenY", `${kb.h}/${kb.screenY}`)}
      {line("root", Math.round(rootHeight))}
      {line("kav", Math.round(kavHeight))}
      {line("scroll", Math.round(scrollHeight))}
      {line("os", Platform.OS)}
    </View>
  );
};

export default LayoutProbe;

const styles = StyleSheet.create({
  box: {
    position: "absolute",
    top: 4,
    right: 4,
    zIndex: 999,
    elevation: 999,
    backgroundColor: "rgba(0,0,0,0.82)",
    paddingHorizontal: 8,
    paddingVertical: 6,
    borderRadius: 6,
  },
  text: {
    color: "#FFF",
    fontSize: 11,
    fontVariant: ["tabular-nums"],
  },
});
