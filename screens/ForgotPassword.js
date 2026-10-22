import { useEffect, useState } from "react";
import {
  KeyboardAvoidingView,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useNavigation, useRoute } from "@react-navigation/native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";

import PrimaryInput from "../components/ui/PrimaryInput";
import PrimaryButton from "../components/ui/PrimaryButton";
import { sendPasswordResetApi } from "../api/auth";
import { useLanguage } from "../store/languageContext";
import { GlobalStyles } from "../constants";

const { colors, spacing, radius, type } = GlobalStyles;

// Long enough that a mistyped address or a slow inbox doesn't turn into a
// burst of emails, and that Firebase's own TOO_MANY_ATTEMPTS limit is rarely
// what the user runs into.
const RESEND_COOLDOWN_SECONDS = 60;

const formatCountdown = (seconds) =>
  `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, "0")}`;

const ForgotPassword = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const insets = useSafeAreaInsets();
  const { t, lang } = useLanguage();

  // Carried over from the login form so the user doesn't type it twice.
  const [email, setEmail] = useState(route.params?.email ?? "");
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState(null);
  const [sentTo, setSentTo] = useState(null);

  // The cooldown is kept as a deadline rather than a decrementing counter, so
  // time spent with the app in the background still counts towards it.
  const [resendAt, setResendAt] = useState(0);
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    if (resendAt <= Date.now()) return;
    const id = setInterval(() => {
      const current = Date.now();
      setNow(current);
      if (current >= resendAt) clearInterval(id);
    }, 1000);
    return () => clearInterval(id);
  }, [resendAt]);

  const remaining = Math.max(0, Math.ceil((resendAt - now) / 1000));

  const handleSend = async () => {
    const address = email.trim();
    if (!address.includes("@")) {
      setError(t("invalid_email"));
      return;
    }

    setError(null);
    setIsSending(true);
    try {
      await sendPasswordResetApi(address, lang);
      const sentAt = Date.now();
      setSentTo(address);
      setNow(sentAt);
      setResendAt(sentAt + RESEND_COOLDOWN_SECONDS * 1000);
    } catch (err) {
      setError(t("could_not_send_reset"));
    } finally {
      setIsSending(false);
    }
  };

  let buttonLabel = t("send_reset_link");
  if (isSending) buttonLabel = t("sending");
  else if (remaining > 0)
    buttonLabel = t("resend_in", { time: formatCountdown(remaining) });
  else if (sentTo) buttonLabel = t("resend_link");

  return (
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
        <Pressable
          onPress={() => navigation.goBack()}
          hitSlop={8}
          accessibilityRole="button"
          accessibilityLabel={t("back_to_login")}
          style={({ pressed }) => [styles.backButton, pressed && styles.pressed]}
        >
          <Ionicons name="arrow-back" size={22} color={colors.text} />
        </Pressable>

        <View style={styles.header}>
          <View style={styles.iconBox}>
            <Ionicons name="lock-closed-outline" size={32} color={colors.primary} />
          </View>
          <Text style={styles.title}>{t("reset_password_title")}</Text>
          <Text style={styles.hint}>{t("reset_password_hint")}</Text>
        </View>

        <View style={styles.card}>
          <PrimaryInput
            label={t("email")}
            textInputConfig={{
              onChangeText: (text) => {
                setEmail(text);
                if (error) setError(null);
              },
              keyboardType: "email-address",
              autoCapitalize: "none",
              autoCorrect: false,
              autoComplete: "email",
              returnKeyType: "send",
              onSubmitEditing: remaining > 0 || isSending ? undefined : handleSend,
            }}
            placeholder="you@example.com"
            value={email}
            isLogin
          />

          {!!error && <Text style={styles.error}>{error}</Text>}

          {!!sentTo && !error && (
            <View style={styles.notice}>
              <Ionicons name="mail-outline" size={20} color={colors.incomeText} />
              <View style={styles.noticeBody}>
                <Text style={styles.noticeTitle}>{t("check_your_email")}</Text>
                <Text style={styles.noticeText}>
                  {`${t("reset_link_sent")} ${sentTo}. ${t("check_spam_hint")}`}
                </Text>
              </View>
            </View>
          )}

          <PrimaryButton
            style={styles.submit}
            onPress={handleSend}
            disabled={isSending || remaining > 0}
          >
            {buttonLabel}
          </PrimaryButton>
        </View>

        <Pressable
          onPress={() => navigation.goBack()}
          hitSlop={8}
          style={({ pressed }) => [styles.toggleWrap, pressed && styles.pressed]}
        >
          <Text style={styles.toggleText}>{t("back_to_login")}</Text>
        </Pressable>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

export default ForgotPassword;

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.primarySurface,
  },
  content: {
    flexGrow: 1,
    paddingHorizontal: spacing[4],
  },
  backButton: {
    alignSelf: "flex-start",
    width: 40,
    height: 40,
    borderRadius: radius.full,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.surface,
    ...GlobalStyles.shadow.sm,
  },
  header: {
    alignItems: "center",
    marginTop: spacing[4],
    marginBottom: spacing[5],
    gap: spacing[2],
  },
  iconBox: {
    width: 72,
    height: 72,
    borderRadius: radius.full,
    backgroundColor: colors.surface,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: spacing[1],
    ...GlobalStyles.shadow.sm,
  },
  title: {
    ...type.h2,
    color: colors.text,
  },
  hint: {
    ...type.body,
    color: colors.textMuted,
    textAlign: "center",
    paddingHorizontal: spacing[3],
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing[4],
    ...GlobalStyles.shadow.md,
  },
  error: {
    ...type.caption,
    color: colors.expenseText,
    marginTop: spacing[2],
  },
  notice: {
    flexDirection: "row",
    gap: spacing[2],
    marginTop: spacing[3],
    padding: spacing[3],
    borderRadius: radius.md,
    backgroundColor: colors.incomeSurface,
  },
  noticeBody: {
    flex: 1,
    gap: 2,
  },
  noticeTitle: {
    ...type.bodyEmphasis,
    color: colors.incomeText,
  },
  noticeText: {
    ...type.caption,
    color: colors.textBody,
  },
  submit: {
    marginTop: spacing[4],
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
