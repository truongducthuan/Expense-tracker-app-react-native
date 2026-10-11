import { Pressable, StyleSheet, Text, View } from "react-native";

import { GlobalStyles } from "../../constants/styles";
import { useLanguage } from "../../store/languageContext";

const { colors, spacing, radius } = GlobalStyles;

const OPTIONS = [
  { code: "vi", label: "VI" },
  { code: "en", label: "EN" },
];

// Compact VI/EN toggle. Reads/writes the language directly via useLanguage so
// it works from any screen without props.
const LanguageSwitch = ({ style }) => {
  const { lang, setLang } = useLanguage();

  return (
    <View style={[styles.container, style]}>
      {OPTIONS.map(({ code, label }) => {
        const active = lang === code;
        return (
          <Pressable
            key={code}
            onPress={() => setLang(code)}
            accessibilityRole="button"
            accessibilityState={{ selected: active }}
            style={({ pressed }) => [
              styles.option,
              active && styles.optionActive,
              pressed && styles.pressed,
            ]}
          >
            <Text style={[styles.text, active && styles.textActive]}>
              {label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
};

export default LanguageSwitch;

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    backgroundColor: colors.surface,
    borderRadius: radius.full,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 3,
    gap: 2,
  },
  option: {
    minWidth: 40,
    paddingVertical: spacing[1] + 2,
    paddingHorizontal: spacing[3],
    borderRadius: radius.full,
    alignItems: "center",
  },
  optionActive: {
    backgroundColor: colors.primary,
  },
  text: {
    fontSize: 12.5,
    color: colors.textMuted,
    fontWeight: "700",
  },
  textActive: {
    color: colors.onPrimary,
  },
  pressed: {
    opacity: 0.7,
  },
});
