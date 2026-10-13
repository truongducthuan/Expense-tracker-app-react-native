import { useLayoutEffect, useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

import Card from "../components/ui/Card";
import PrimaryButton from "../components/ui/PrimaryButton";
import ActionBar from "../components/ui/ActionBar";
import PrimaryInput from "../components/ui/PrimaryInput";
import Loading from "../components/ui/Loading";
import { GlobalStyles } from "../constants/styles";
import { AuthStore } from "../store/authContext";
import { useLanguage } from "../store/languageContext";
import { useDialog } from "../store/dialogContext";
import { deleteAccount, reauthenticate } from "../api/account";

const { colors, spacing, radius, type } = GlobalStyles;

// Deleting the account from inside the app.
//
// Both stores require an app that creates accounts to offer this, and to make
// it reachable rather than buried. It spells out what goes, asks for the
// password again, and confirms once — at which point nothing is recoverable,
// so the warning is plain rather than decorative (Nielsen #5).
const DeleteAccount = ({ navigation }) => {
  const { user, logout } = AuthStore();
  const { t } = useLanguage();
  const { alert, confirm } = useDialog();

  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);

  // A Google sign-in never created a password-based account here, so there is
  // nothing to re-authenticate against — only this app's data to remove.
  const needsPassword = user?.provider !== "google";

  useLayoutEffect(() => {
    navigation.setOptions({ title: t("delete_account") });
  }, [navigation, t]);

  const handleDelete = async () => {
    const ok = await confirm({
      title: t("delete_account"),
      message: t("delete_account_confirm"),
      confirmLabel: t("delete_account_action"),
      destructive: true,
    });
    if (!ok) return;

    setBusy(true);
    try {
      const idToken = needsPassword
        ? await reauthenticate(user.email, password)
        : null;
      await deleteAccount({ email: user.email, idToken });
      await logout();
      // Back to the sign-in screen with nothing left behind it.
      navigation.reset({ index: 0, routes: [{ name: "Navigation" }] });
    } catch (err) {
      const code = err?.response?.data?.error?.message;
      alert({
        title: t("could_not_delete_account"),
        message:
          code === "INVALID_LOGIN_CREDENTIALS" || code === "INVALID_PASSWORD"
            ? t("wrong_password")
            : t("could_not_delete_account_hint"),
        tone: "warning",
      });
    } finally {
      setBusy(false);
    }
  };

  if (busy) return <Loading message={t("deleting_account")} />;

  const canDelete = needsPassword ? password.length >= 6 : true;

  return (
    <KeyboardAvoidingView
      style={styles.root}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <ScrollView
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
      >
        <Card style={styles.warningCard}>
          <View style={styles.warningHead}>
            <Ionicons name="warning" size={20} color={colors.expenseText} />
            <Text style={styles.warningTitle}>{t("delete_account_title")}</Text>
          </View>
          <Text style={styles.body}>{t("delete_account_body")}</Text>

          <View style={styles.list}>
            {[
              "delete_account_item_transactions",
              "delete_account_item_plans",
              "delete_account_item_lists",
              "delete_account_item_login",
            ].map((key) => (
              <View key={key} style={styles.listRow}>
                <Ionicons name="close-circle" size={16} color={colors.expenseText} />
                <Text style={styles.listText}>{t(key)}</Text>
              </View>
            ))}
          </View>

          <Text style={styles.note}>{t("delete_account_note")}</Text>
        </Card>

        <Card>
          <Text style={styles.account}>{user?.email}</Text>
          {needsPassword ? (
            <PrimaryInput
              label={t("password")}
              value={password}
              placeholder={t("password")}
              textInputConfig={{
                onChangeText: setPassword,
                secureTextEntry: true,
                autoCapitalize: "none",
                returnKeyType: "done",
              }}
            />
          ) : (
            <Text style={styles.body}>{t("delete_account_google_hint")}</Text>
          )}
        </Card>
      </ScrollView>

      <ActionBar style={styles.actionRow}>
        <PrimaryButton mode="secondary" onPress={() => navigation.goBack()}>
          {t("cancel")}
        </PrimaryButton>
        <PrimaryButton
          mode="destructive"
          icon="trash-outline"
          style={styles.deleteButton}
          onPress={handleDelete}
          disabled={!canDelete}
        >
          {t("delete_account_action")}
        </PrimaryButton>
      </ActionBar>
    </KeyboardAvoidingView>
  );
};

export default DeleteAccount;

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.screen,
  },
  content: {
    padding: spacing[4],
    gap: spacing[4],
    paddingBottom: spacing[5],
  },
  warningCard: {
    borderWidth: 1,
    borderColor: colors.expenseText,
    backgroundColor: colors.expenseSurface,
  },
  warningHead: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing[2],
    marginBottom: spacing[2],
  },
  warningTitle: {
    ...type.h3,
    color: colors.expenseText,
    flex: 1,
  },
  body: {
    ...type.body,
    color: colors.textBody,
  },
  list: {
    gap: spacing[2],
    marginTop: spacing[3],
  },
  listRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing[2],
  },
  listText: {
    ...type.body,
    color: colors.textBody,
    flex: 1,
  },
  note: {
    ...type.caption,
    color: colors.textMuted,
    marginTop: spacing[3],
  },
  account: {
    ...type.bodyEmphasis,
    fontWeight: "600",
    color: colors.text,
    marginBottom: spacing[2],
  },
  actionRow: {
    flexDirection: "row",
    gap: spacing[3],
  },
  deleteButton: {
    flex: 1,
  },
});
