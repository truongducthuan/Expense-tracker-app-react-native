import { useState, useLayoutEffect } from "react";
import { Alert } from "react-native";
import { useNavigation } from "@react-navigation/native";

import Loading from "../components/ui/Loading";
import ErrorOverlay from "../components/ui/ErrorOverlay";
import AuthForm from "../components/auth/AuthForm";
import { loginApi, signUpApi, sendPasswordResetApi } from "../api/auth";
import { AuthStore } from "../store/authContext";
import useGoogleAuth from "../hooks/useGoogleAuth";

const EMPTY_FORM = { email: "", password: "" };

const Authentication = () => {
  const navigation = useNavigation();
  const { login } = AuthStore();

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
    onError: () => setErrorMessage("Google sign-in failed - please try again!"),
  });

  useLayoutEffect(() => {
    navigation.setOptions({
      title: isLogin ? "Login" : "Sign up",
      headerTitleAlign: "center",
    });
  }, [navigation, isLogin]);

  const handleChangeField = (name, value) =>
    setValues((prev) => ({ ...prev, [name]: value }));

  const handleToggleMode = () => setIsLogin((prev) => !prev);

  const handleForgotPassword = async () => {
    if (!values.email.includes("@")) {
      Alert.alert(
        "Email required",
        "Please enter your email above to reset your password."
      );
      return;
    }
    try {
      await sendPasswordResetApi(values.email);
      Alert.alert(
        "Check your email",
        `A password reset link was sent to ${values.email}.`
      );
    } catch (err) {
      setErrorMessage(
        "Could not send reset email - please check the address and try again!"
      );
    }
  };

  const handleSubmit = async () => {
    const isValid =
      values.email.includes("@") && values.password.length >= 6;
    if (!isValid) {
      Alert.alert("Invalid input!", "Please check your input values");
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
        isLogin
          ? "Could not login with this account - please try again!"
          : "Could not create user - please try again!"
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
    return <Loading message={isLogin ? "Logging..." : "Creating user..."} />;
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
