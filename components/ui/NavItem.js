import React from "react";
import { Pressable, Text, StyleSheet } from "react-native";
import { GlobalStyles } from "../../constants/styles";
import { formatAmount } from "../../util/format";

// When `color`/`activeColor` are passed the button is type-colored (e.g. red for
// expense, green for income): `color` is the resting background, `activeColor`
// the bolder background shown when selected. Without them it keeps the legacy
// look (light background, colored text) used by NavExpense.
const NavItem = ({ children, onPress, isNav, style, total, color, activeColor, isLabel=true }) => {
  const typed = !!color;
  const backgroundColor = typed
    ? isNav
      ? activeColor
      : color
    : GlobalStyles.colors.primary50;
  const textColor = typed
    ? "#fff"
    : isNav
    ? GlobalStyles.colors.error500
    : GlobalStyles.colors.primary200;

  return (
    <Pressable
      onPress={() => onPress(children.toLowerCase())}
      style={({ pressed }) => pressed && styles.pressed}
    >
      <Text
        style={[
          styles.title,
          style,
          { opacity: isNav ? 1 : 0.6 },
          { backgroundColor, color: textColor },
          isNav && typed && styles.active,
        ]}
      >
        {isLabel && children} {total ? `$${formatAmount(total)}` : null}
      </Text>
    </Pressable>
  );
};

export default NavItem;

const styles = StyleSheet.create({
  title: {
    fontSize: 14,
    fontWeight: "400",
    borderRadius: 8,
    width: "100%",
  },
  active: {
    fontWeight: "700",
  },
  pressed: {
    opacity: 0.6,
  },
});
