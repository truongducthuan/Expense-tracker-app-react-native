import {
  Image,
  KeyboardAvoidingView,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import PrimaryInput from "../ui/PrimaryInput";
import PrimaryButton from "../ui/PrimaryButton";
import LanguageSwitch from "../ui/LanguageSwitch";
import { GlobalStyles } from "../../constants";
import { useLanguage } from "../../store/languageContext";

const { colors, spacing, radius, type } = GlobalStyles;

const AuthForm = ({
  isLogin,
  values,
  onChangeField,
  onSubmit,
  onToggleMode,
  onForgotPassword,
  onGooglePress,
  googleReady,
}) => {
  const { t } = useLanguage();
  // The header is hidden here and Android draws edge to edge, so nothing else
  // keeps the language switch out from under the status bar or the last link
  // off the navigation bar.
  const insets = useSafeAreaInsets();

  return (
    // `padding` on Android too: since edge-to-edge the window no longer
    // resizes for the keyboard, so leaving it undefined hid the fields.
    <KeyboardAvoidingView style={styles.root} behavior="padding">
      <ScrollView
        contentContainerStyle={[
          styles.content,
          {
            paddingTop: insets.top + spacing[3],
            paddingBottom: insets.bottom + spacing[6],
          },
        ]}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.topBar}>
          <LanguageSwitch />
        </View>

        <View style={styles.brand}>
          <View style={styles.logoBox}>
            <Image source={require("../../assets/pig.png")} style={styles.image} />
          </View>
          <Text style={styles.appName}>MoneyMind</Text>
          <Text style={styles.tagline}>{t("app_tagline")}</Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.title}>{isLogin ? t("login") : t("sign_up")}</Text>

          <PrimaryInput
            label={t("email")}
            textInputConfig={{
              onChangeText: (text) => onChangeField("email", text),
              keyboardType: "email-address",
              autoCapitalize: "none",
              autoCorrect: false,
            }}
            placeholder="you@example.com"
            value={values.email}
            isLogin
          />

          <PrimaryInput
            label={t("password")}
            textInputConfig={{
              onChangeText: (text) => onChangeField("password", text),
              secureTextEntry: true,
            }}
            placeholder="••••••"
            value={values.password}
            isLogin
          />

          <PrimaryButton style={styles.submit} onPress={onSubmit}>
            {isLogin ? t("log_in") : t("sign_up")}
          </PrimaryButton>

          {isLogin && (
            <Pressable
              onPress={onForgotPassword}
              hitSlop={8}
              style={({ pressed }) => [styles.linkWrap, pressed && styles.pressed]}
            >
              <Text style={styles.link}>{t("forgot_password")}</Text>
            </Pressable>
          )}

          <View style={styles.divider}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>{t("or")}</Text>
            <View style={styles.dividerLine} />
          </View>

          <Pressable
            onPress={onGooglePress}
            disabled={!googleReady}
            accessibilityRole="button"
            style={({ pressed }) => [
              styles.googleButton,
              (!googleReady || pressed) && styles.pressed,
            ]}
          >
            <Ionicons name="logo-google" size={19} color={colors.textBody} />
            <Text style={styles.googleText}>{t("continue_with_google")}</Text>
          </Pressable>
        </View>

        <Pressable
          onPress={onToggleMode}
          hitSlop={8}
          style={({ pressed }) => [styles.toggleWrap, pressed && styles.pressed]}
        >
          <Text style={styles.toggleText}>
            {isLogin ? t("create_new_user") : t("log_in_instead")}
          </Text>
        </Pressable>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

export default AuthForm;

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.primarySurface,
  },
  content: {
    flexGrow: 1,
    paddingHorizontal: spacing[4],
  },
  topBar: {
    alignItems: "flex-end",
  },
  brand: {
    alignItems: "center",
    marginTop: spacing[3],
    marginBottom: spacing[5],
    gap: spacing[1],
  },
  logoBox: {
    width: 88,
    height: 88,
    borderRadius: radius.full,
    backgroundColor: colors.surface,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: spacing[2],
    ...GlobalStyles.shadow.sm,
  },
  image: {
    width: 64,
    height: 64,
    resizeMode: "contain",
  },
  appName: {
    ...type.h1,
    fontSize: 26,
    color: colors.primary,
    letterSpacing: -0.4,
  },
  tagline: {
    ...type.caption,
    color: colors.textMuted,
    textAlign: "center",
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing[4],
    ...GlobalStyles.shadow.md,
  },
  title: {
    ...type.h3,
    color: colors.text,
    marginBottom: spacing[2],
  },
  submit: {
    marginTop: spacing[4],
  },
  linkWrap: {
    alignSelf: "center",
    paddingVertical: spacing[3],
  },
  link: {
    ...type.caption,
    fontSize: 13.5,
    color: colors.primary,
    fontWeight: "500",
  },
  divider: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing[3],
    marginTop: spacing[2],
    marginBottom: spacing[4],
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: colors.border,
  },
  dividerText: {
    ...type.caption,
    color: colors.textMuted,
  },
  googleButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: spacing[2] + 2,
    minHeight: 48,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  googleText: {
    ...type.bodyEmphasis,
    fontWeight: "600",
    color: colors.textBody,
  },
  toggleWrap: {
    alignSelf: "center",
    marginTop: spacing[5],
    paddingVertical: spacing[2],
  },
  toggleText: {
    ...type.body,
    color: colors.primary,
    fontWeight: "500",
  },
  pressed: {
    opacity: 0.7,
  },
});
