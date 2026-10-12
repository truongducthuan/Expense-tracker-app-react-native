import { useState, useLayoutEffect } from "react";
import { useNavigation } from "@react-navigation/native";

import Loading from "../components/ui/Loading";
import ErrorOverlay from "../components/ui/ErrorOverlay";
import AuthForm from "../components/auth/AuthForm";
import { loginApi, signUpApi, sendPasswordResetApi } from "../api/auth";
import { AuthStore } from "../store/authContext";
import useGoogleAuth from "../hooks/useGoogleAuth";
import { useLanguage } from "../store/languageContext";
import { useDialog } from "../store/dialogContext";

const EMPTY_FORM = { email: "", password: "" };

const Authentication = () => {
  const navigation = useNavigation();
  const { login } = AuthStore();
  const { t } = useLanguage();
  const { alert } = useDialog();

  const [isLogin, setIsLogin] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);
  const [values, setValues] = useState(EMPTY_FORM);

  const goToApp = () =>
    navigation.navigate("DrawNavigation", { screen: "DrawNavigation" });

  const { isReady: googleReady, promptGoogleLogin } = useGoogleAuth({
    onSuccess: (user) => {
      login(user);
      goToApp();
    },
    onError: () => setErrorMessage(t("google_signin_failed")),
  });

  // The auth screen carries its own branding, so the native header is hidden
  // rather than repeating the title above it.
  useLayoutEffect(() => {
    navigation.setOptions({ headerShown: false });
  }, [navigation]);

  const handleChangeField = (name, value) =>
    setValues((prev) => ({ ...prev, [name]: value }));

  const handleToggleMode = () => setIsLogin((prev) => !prev);

  const handleForgotPassword = async () => {
    if (!values.email.includes("@")) {
      alert({ title: t("email_required"), message: t("enter_email_to_reset"), tone: "warning" });
      return;
    }
    try {
      await sendPasswordResetApi(values.email);
      alert({
        title: t("check_your_email"),
        message: `${t("reset_link_sent")} ${values.email}.`,
        tone: "success",
      });
    } catch (err) {
      setErrorMessage(t("could_not_send_reset"));
    }
  };

  const handleSubmit = async () => {
    const isValid =
      values.email.includes("@") && values.password.length >= 6;
    if (!isValid) {
      alert({ title: t("invalid_input"), message: t("check_values"), tone: "warning" });
      return;
    }

    setIsSubmitting(true);
    try {
      if (isLogin) {
        const data = await loginApi(values.email, values.password);
        login({
          email: data.email,
          name: data.name,
          photo: data?.photo,
          token: data.idToken,
        });
        setValues(EMPTY_FORM);
        goToApp();
      } else {
        await signUpApi(values.email, values.password);
        setValues(EMPTY_FORM);
        setIsLogin(true);
      }
    } catch (err) {
      setErrorMessage(
        isLogin ? t("could_not_login") : t("could_not_create_user")
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  if (errorMessage) {
    return (
      <ErrorOverlay
        message={errorMessage}
        onPress={() => setErrorMessage(null)}
      />
    );
  }

  if (isSubmitting) {
    return <Loading message={isLogin ? t("logging_in") : t("creating_user")} />;
  }

  return (
    <AuthForm
      isLogin={isLogin}
      values={values}
      onChangeField={handleChangeField}
      onSubmit={handleSubmit}
      onToggleMode={handleToggleMode}
      onForgotPassword={handleForgotPassword}
      onGooglePress={promptGoogleLogin}
      googleReady={googleReady}
    />
  );
};

export default Authentication;
