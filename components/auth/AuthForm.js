import { StyleSheet, Text, View, Pressable, Image } from "react-native";
import { Ionicons } from "@expo/vector-icons";

import PrimaryInput from "../ui/PrimaryInput";
import LanguageSwitch from "../ui/LanguageSwitch";
import { GlobalStyles, colorsArray } from "../../constants";
import { useLanguage } from "../../store/languageContext";

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

  return (
    <View style={styles.container}>
      <LanguageSwitch style={styles.langSwitch} />

      <View style={styles.logoBox}>
        <Image source={require("../../assets/pig.png")} style={styles.image} />
      </View>

      <Text style={styles.title}>{isLogin ? t("login") : t("sign_up")}</Text>

      <PrimaryInput
        label={t("email")}
        textInputConfig={{
          onChangeText: (text) => onChangeField("email", text),
          keyboardType: "email-address",
          autoCapitalize: "none",
        }}
        value={values.email}
        isLogin={true}
      />

      <PrimaryInput
        label={t("password")}
        textInputConfig={{
          onChangeText: (text) => onChangeField("password", text),
          secureTextEntry: true,
        }}
        value={values.password}
        isLogin={true}
      />

      <Pressable
        onPress={onSubmit}
        style={({ pressed }) => [styles.submitButton, pressed && styles.pressed]}
      >
        <Text style={styles.submitText}>
          {isLogin ? t("log_in") : t("sign_up")}
        </Text>
      </Pressable>

      {isLogin && (
        <Pressable
          onPress={onForgotPassword}
          style={({ pressed }) => pressed && styles.pressed}
        >
          <Text style={styles.forgotText}>{t("forgot_password")}</Text>
        </Pressable>
      )}

      <Pressable
        onPress={onToggleMode}
        style={({ pressed }) => pressed && styles.pressed}
      >
        <Text style={styles.toggleText}>
          {isLogin ? t("create_new_user") : t("log_in_instead")}
        </Text>
      </Pressable>

      <View style={styles.divider}>
        <View style={styles.dividerLine} />
        <Text style={styles.dividerText}>{t("or")}</Text>
        <View style={styles.dividerLine} />
      </View>

      <Pressable
        onPress={onGooglePress}
        disabled={!googleReady}
        style={({ pressed }) => [
          styles.googleButton,
          (!googleReady || pressed) && styles.pressed,
        ]}
      >
        <Ionicons
          name="logo-google"
          size={20}
          color={GlobalStyles.colors.primary700}
        />
        <Text style={styles.googleText}>{t("continue_with_google")}</Text>
      </Pressable>
    </View>
  );
};

export default AuthForm;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: GlobalStyles.colors.primary700,
    paddingTop: 56,
    paddingHorizontal: 24,
  },
  langSwitch: {
    position: "absolute",
    top: 18,
    right: 20,
  },
  logoBox: {
    alignSelf: "center",
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: GlobalStyles.colors.primary50,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 12,
    marginBottom: 14,
  },
  image: {
    width: 76,
    height: 76,
    resizeMode: "contain",
  },
  title: {
    color: "#fff",
    fontSize: 22,
    fontWeight: "700",
    textAlign: "center",
    marginBottom: 18,
    letterSpacing: 0.3,
  },
  submitButton: {
    backgroundColor: GlobalStyles.colors.accent500,
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: "center",
    marginTop: 18,
    shadowColor: "#000",
    shadowOpacity: 0.15,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 3,
  },
  submitText: {
    color: GlobalStyles.colors.primary800,
    fontSize: 16,
    fontWeight: "700",
    letterSpacing: 0.5,
  },
  forgotText: {
    color: '#fff',
    fontSize: 14,
    textAlign: "center",
    marginTop: 14,
    textDecorationLine: "underline",
  },
  toggleText: {
    color: '#fff',
    fontSize: 15,
    textAlign: "center",
    marginTop: 14,
  },
  divider: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 22,
    marginBottom: 14,
    gap: 10,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: GlobalStyles.colors.primary400,
  },
  dividerText: {
    color: GlobalStyles.colors.primary100,
    fontSize: 13,
  },
  googleButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    backgroundColor: "#fff",
    borderRadius: 12,
    paddingVertical: 13,
    paddingHorizontal: 20,
  },
  googleText: {
    color: GlobalStyles.colors.primary700,
    fontSize: 16,
    fontWeight: "600",
  },
  pressed: {
    opacity: 0.7,
  },
});
