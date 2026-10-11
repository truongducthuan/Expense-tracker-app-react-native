import { StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";

import { GlobalStyles } from "../../constants/styles";
import { getCategoryIcon, getInitial } from "../../constants/categoryIcons";
import useResolvedIcon from "../../hooks/useResolvedIcon";

const { colors, radius } = GlobalStyles;

// Rounded tile that fronts every transaction row.
//
// Icon resolution, in order:
//   1. an explicit `icon` prop (the caller knows better — e.g. transfers)
//   2. the icon the user chose for this category/account
//   3. the built-in map for the seeded names
//   4. the name's initial, so the tile is never blank
const CategoryAvatar = ({ name, size = 44, tint, background, icon }) => {
  const userIcon = useResolvedIcon(name);
  const resolved = icon || userIcon || getCategoryIcon(name);
  const fg = tint || colors.primary;
  const bg = background || colors.primarySurface;

  return (
    <View
      style={[
        styles.tile,
        {
          width: size,
          height: size,
          borderRadius: radius.md,
          backgroundColor: bg,
        },
      ]}
    >
      {resolved ? (
        <Ionicons name={resolved} size={size * 0.46} color={fg} />
      ) : (
        <Text style={[styles.initial, { color: fg, fontSize: size * 0.4 }]}>
          {getInitial(name)}
        </Text>
      )}
    </View>
  );
};

export default CategoryAvatar;

const styles = StyleSheet.create({
  tile: {
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  initial: {
    fontWeight: "700",
  },
});
