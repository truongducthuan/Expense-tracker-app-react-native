import { StyleSheet, Text, View, Pressable, Image } from "react-native";
import { Ionicons } from "@expo/vector-icons";

import PrimaryInput from "../ui/PrimaryInput";
import PrimaryButton from "../ui/PrimaryButton";
import { GlobalStyles } from "../../constants/styles";

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
  return (
    <View style={styles.container}>
      <View style={styles.imageContainer}>
        <Image source={require("../../assets/pig.png")} style={styles.image} />
      </View>

      <View style={styles.inputRow}>
        <PrimaryInput
          label={"Email"}
          textInputConfig={{
            onChangeText: (text) => onChangeField("email", text),
            keyboardType: "email-address",
          }}
          style={styles.rowInput}
          value={values.email}
          isLogin={true}
        />
      </View>

      <View style={styles.inputRow}>
        <PrimaryInput
          label={"Password"}
          textInputConfig={{
            onChangeText: (text) => onChangeField("password", text),
            secureTextEntry: true,
          }}
          style={styles.rowInput}
          value={values.password}
          isLogin={true}
        />
      </View>

      <View style={styles.containerButton}>
        <PrimaryButton
          onPress={onSubmit}
          style={styles.button}
          mode={"flat"}
          colorText={"login"}
        >
          {isLogin ? "Log In" : "Sign Up"}
        </PrimaryButton>
      </View>

      {isLogin && (
        <Pressable
          onPress={onForgotPassword}
          style={({ pressed }) => pressed && styles.pressed}
        >
          <Text style={styles.forgotText}>Forgot password?</Text>
        </Pressable>
      )}

      <Pressable
        onPress={onToggleMode}
        style={({ pressed }) => pressed && styles.pressed}
      >
        <Text style={styles.buttonRedirect}>
          {isLogin ? "Create a new user" : "Log in instead"}
        </Text>
      </Pressable>

      <Text style={{ color: GlobalStyles.colors.primary50 }}>Or</Text>

      <Pressable
        onPress={onGooglePress}
        disabled={!googleReady}
        style={({ pressed }) => [
          styles.googleButton,
          (!googleReady || pressed) && styles.pressed,
        ]}
      >
        <Ionicons name="logo-google" size={20} color="#fff" />
        <Text style={styles.googleText}>Continue with Google</Text>
      </Pressable>
    </View>
  );
};

export default AuthForm;

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
  forgotText: {
    color: GlobalStyles.colors.error500,
    marginTop: 12,
    fontSize: 15,
    textDecorationLine: "underline",
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
  googleButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: GlobalStyles.colors.primary500,
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 20,
    marginVertical: 20,
    width: "97%",
  },
  googleText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
});
