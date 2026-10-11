import { StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";

import PrimaryButton from "./PrimaryButton";
import { GlobalStyles } from "../../constants/styles";
import { useLanguage } from "../../store/languageContext";

const { colors, spacing, radius, type } = GlobalStyles;

// Error state: plain-language message plus a way forward, never a dead end
// (Nielsen #9). The caller keeps the user's entered data, so "Okay" returns to
// the form with everything still filled in.
const ErrorOverlay = ({ message, onPress }) => {
  const { t } = useLanguage();

  return (
    <View style={styles.container}>
      <View style={styles.iconCircle}>
        <Ionicons name="alert-circle-outline" size={32} color={colors.expense} />
      </View>
      <Text style={styles.title}>{t("error_occurred")}</Text>
      <Text style={styles.message}>{message}</Text>
      <PrimaryButton style={styles.button} onPress={onPress}>
        {t("okay")}
      </PrimaryButton>
    </View>
  );
};

export default ErrorOverlay;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: spacing[5],
    backgroundColor: colors.screen,
  },
  iconCircle: {
    width: 64,
    height: 64,
    borderRadius: radius.full,
    backgroundColor: colors.expenseSurface,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: spacing[4],
  },
  title: {
    ...type.h3,
    color: colors.text,
    textAlign: "center",
  },
  message: {
    ...type.body,
    color: colors.textMuted,
    textAlign: "center",
    marginTop: spacing[2],
    maxWidth: 300,
  },
  button: {
    marginTop: spacing[5],
    minWidth: 160,
  },
});
