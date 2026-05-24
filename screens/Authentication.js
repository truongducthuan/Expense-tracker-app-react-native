import React, { useState, useLayoutEffect } from "react";
import {
  StyleSheet,
  Text,
  View,
  Pressable,
  Alert,
  Image,
} from "react-native";
import { useNavigation } from "@react-navigation/native";

import PrimaryInput from "../components/ui/PrimaryInput";
import { GlobalStyles } from "../constants/styles";
import PrimaryButton from "../components/ui/PrimaryButton";
import Loading from "../components/ui/Loading";
import { loginApi, signUpApi, loginWithGoogle, getStatusCodes } from "../api/auth";
import ErrorOverlay from "../components/ui/ErrorOverlay";
import { AuthStore } from "../store/authContext";

// GoogleSigninButton is a native component — not available in Expo Go.
// Resolved at runtime so the import never crashes in Expo Go.
let GoogleSigninButton = null;
try {
  GoogleSigninButton =
    require("@react-native-google-signin/google-signin").GoogleSigninButton;
} catch {
  // running in Expo Go — Google Sign-In button will be hidden
}

const Authentication = () => {
  const navigation = useNavigation();
  const { login } = AuthStore();

  const [isAuthentication, setIsAuthentication] = useState(false);
  const [isLogin, setIsLogin] = useState(true);
  const [errorMessage, setErrorMessage] = useState(null);
  const [valueInput, setValueInput] = useState({ email: "", password: "" });

  useLayoutEffect(() => {
    navigation.setOptions({
      title: isLogin ? "Login" : "Sign up",
      headerTitleAlign: "center",
    });
  }, [navigation, isLogin]);

  function handleInputValue(name, e) {
    setValueInput((prev) => ({ ...prev, [name]: e }));
  }

  const clearInputValue = () => setValueInput({ email: "", password: "" });

  const handleConfirm = async () => {
    if (!valueInput.email.includes("@") || valueInput.password.length < 6) {
      Alert.alert("Invalid input!", "Please check your input values");
      return;
    }
    setIsAuthentication(true);
    if (!isLogin) {
      try {
        await signUpApi(valueInput.email, valueInput.password);
        clearInputValue();
        setIsLogin(true);
      } catch {
        setErrorMessage("Could not create user - please try again!");
      }
    } else {
      try {
        const data = await loginApi(valueInput.email, valueInput.password);
        login({
          email: data.email,
          name: data.name,
          photo: data?.photo,
          token: data.idToken,
          id: data.localId,
        });
        clearInputValue();
        navigation.navigate("DrawNavigation", { screen: "DrawNavigation" });
      } catch {
        setErrorMessage("Could not login with this account - please try again!");
      }
    }
    setIsAuthentication(false);
  };

  const handleLoginWithGoogle = async () => {
    try {
      const data = await loginWithGoogle();
      if (!data) return; // user cancelled
      login({
        email: data.user.email,
        name: data.user.name,
        photo: data.user?.photo,
        token: data.idToken,
        id: data.user.id,
      });
      navigation.navigate("DrawNavigation", { screen: "DrawNavigation" });
    } catch (err) {
      const statusCodes = getStatusCodes();
      if (err.code === statusCodes.IN_PROGRESS) {
        Alert.alert("Please wait", "Sign in is already in progress.");
      } else if (err.code === statusCodes.PLAY_SERVICES_NOT_AVAILABLE) {
        Alert.alert("Error", "Google Play Services not available or outdated.");
      } else {
        Alert.alert("Sign in failed", "Could not sign in with Google. Please try again.");
      }
    }
  };

  if (errorMessage) {
    return (
      <ErrorOverlay message={errorMessage} onPress={() => setErrorMessage(null)} />
    );
  }

  if (isAuthentication) {
    return <Loading message={!isLogin ? "Creating user..." : "Logging in..."} />;
  }

  return (
    <View style={styles.container}>
      <View style={styles.imageContainer}>
        <Image source={require("../assets/pig.png")} style={styles.image} />
      </View>
      <View style={styles.inputRow}>
        <PrimaryInput
          label={"Email"}
          textInputConfig={{
            onChangeText: handleInputValue.bind(this, "email"),
            keyboardType: "email-address",
            autoCapitalize: "none",
          }}
          style={styles.rowInput}
          value={valueInput.email}
          isLogin={true}
        />
      </View>
      <View style={styles.inputRow}>
        <PrimaryInput
          label={"Password"}
          textInputConfig={{
            onChangeText: handleInputValue.bind(this, "password"),
            secureTextEntry: true,
          }}
          style={styles.rowInput}
          value={valueInput.password}
          isLogin={true}
        />
      </View>
      <View style={styles.containerButton}>
        <PrimaryButton onPress={handleConfirm} style={styles.button} mode={"flat"} colorText={"login"}>
          {isLogin ? "Log In" : "Sign Up"}
        </PrimaryButton>
      </View>
      <View>
        <Pressable
          onPress={() => setIsLogin((prev) => !prev)}
          style={({ pressed }) => pressed && styles.pressed}
        >
          <Text style={styles.buttonRedirect}>
            {isLogin ? "Create a new user" : "Log in instead"}
          </Text>
        </Pressable>
      </View>

      {GoogleSigninButton && (
        <>
          <Text style={{ color: GlobalStyles.colors.primary50, marginTop: 8 }}>Or</Text>
          <Pressable onPress={handleLoginWithGoogle} style={{ marginVertical: 20 }}>
            <GoogleSigninButton />
          </Pressable>
        </>
      )}
    </View>
  );
};

export default Authentication;

const styles = StyleSheet.create({
  container: {
    backgroundColor: GlobalStyles.colors.primary200,
    flex: 1,
    paddingTop: 80,
    alignItems: "center",
    paddingHorizontal: 20,
  },
  rowInput: {
    flex: 1,
  },
  inputRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  containerButton: {
    backgroundColor: GlobalStyles.colors.error500,
    width: "97%",
    borderRadius: 8,
    marginTop: 12,
  },
  buttonRedirect: {
    color: "white",
    marginTop: 12,
    fontSize: 16,
    marginVertical: 4,
  },
  pressed: {
    opacity: 0.5,
  },
  image: {
    width: "100%",
    height: "100%",
  },
  imageContainer: {
    height: 100,
    width: 100,
  },
});
