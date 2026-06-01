import { Pressable, StyleSheet, Text, View } from "react-native";

import { GlobalStyles } from "../../constants/styles";
import { useLanguage } from "../../store/languageContext";

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
    backgroundColor: GlobalStyles.colors.primary50,
    borderRadius: 999,
    padding: 3,
  },
  option: {
    paddingVertical: 4,
    paddingHorizontal: 12,
    borderRadius: 999,
  },
  optionActive: {
    backgroundColor: GlobalStyles.colors.primary500,
  },
  text: {
    fontSize: 13,
    color: GlobalStyles.colors.primary500,
    fontWeight: "600",
  },
  textActive: {
    color: "#fff",
  },
  pressed: {
    opacity: 0.6,
  },
});
