import { useState } from "react";
import { StyleSheet, Text, TextInput, View, Pressable } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { GlobalStyles } from "../../constants/styles";

const PrimaryInput = ({
  label,
  textInputConfig,
  style,
  value,
  isLogin,
  showSoftInputOnFocus,
  editable,
}) => {
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);

  let inputStyes = [styles.input];
  if (textInputConfig && textInputConfig.multiline) {
    inputStyes.push(styles.inputMultiline);
  }
  let labelText = { ...styles.label };
  if (isLogin) {
    labelText.color = GlobalStyles.colors.error500;
    labelText.fontSize = 14;
  }

  const isPasswordField = !!textInputConfig?.secureTextEntry;
  if (isPasswordField) {
    inputStyes.push(styles.inputWithIcon);
  }

  return (
    <>
      <View style={[styles.inputContainer, style]}>
        <Text style={labelText}>{label}</Text>
        <View style={styles.fieldRow}>
          <TextInput
            {...textInputConfig}
            style={inputStyes}
            value={value}
            secureTextEntry={isPasswordField && !isPasswordVisible}
            showSoftInputOnFocus={showSoftInputOnFocus === "true" ? false : true}
            editable={editable}
          />
          {isPasswordField && (
            <Pressable
              style={styles.eyeButton}
              onPress={() => setIsPasswordVisible((prev) => !prev)}
              hitSlop={8}
            >
              <Ionicons
                name={isPasswordVisible ? "eye-off" : "eye"}
                size={22}
                color={GlobalStyles.colors.primary700}
              />
            </Pressable>
          )}
        </View>
      </View>
    </>
  );
};

export default PrimaryInput;

const styles = StyleSheet.create({
  inputContainer: {
    marginHorizontal: 4,
    marginVertical: 8,
    // flex: 1,
  },
  label: {
    fontSize: 12,
    color: GlobalStyles.colors.primary100,
    marginBottom: 4,
  },
  fieldRow: {
    justifyContent: "center",
  },
  input: {
    backgroundColor: GlobalStyles.colors.primary100,
    padding: 6,
    borderRadius: 6,
    fontSize: 16,
    color: GlobalStyles.colors.primary700,
  },
  inputWithIcon: {
    paddingRight: 40,
  },
  inputMultiline: {
    minHeight: 80,
    textAlignVertical: "top",
  },
  eyeButton: {
    position: "absolute",
    right: 10,
  },
});
