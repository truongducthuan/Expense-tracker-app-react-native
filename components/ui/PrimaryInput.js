import { useState } from "react";
import { Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";

import { GlobalStyles } from "../../constants/styles";

const { colors, spacing, radius, type } = GlobalStyles;

// Labelled field on a light surface. Focus is shown with a teal border rather
// than a colour change alone, and read-only fields (category / account / date,
// which open a picker) get a chevron so they read as tappable rather than
// broken (Norman — signifier).
const PrimaryInput = ({
  label,
  textInputConfig,
  style,
  value,
  isLogin,
  showSoftInputOnFocus,
  editable,
  selectable = false,
  placeholder,
  // `bare` drops the box so the field can carry display-sized type (the amount
  // field on the add-transaction screen); `inputStyle` tweaks just the text.
  bare = false,
  inputStyle,
}) => {
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [focused, setFocused] = useState(false);

  const isPasswordField = !!textInputConfig?.secureTextEntry;
  const multiline = !!textInputConfig?.multiline;
  const readOnly = editable === false;

  return (
    <View style={[styles.container, style]}>
      {!!label && (
        <Text style={[styles.label, isLogin && styles.labelLogin]}>{label}</Text>
      )}

      <View
        style={[
          bare ? styles.fieldBare : styles.field,
          multiline && styles.fieldMultiline,
          !bare && focused && styles.fieldFocused,
          !bare && readOnly && styles.fieldReadOnly,
        ]}
      >
        <TextInput
          {...textInputConfig}
          style={[
            styles.input,
            multiline && styles.inputMultiline,
            bare && styles.inputBare,
            inputStyle,
          ]}
          value={value ? String(value) : ""}
          placeholder={placeholder}
          placeholderTextColor={colors.textMuted}
          secureTextEntry={isPasswordField && !isPasswordVisible}
          showSoftInputOnFocus={showSoftInputOnFocus === "true" ? false : true}
          editable={editable}
          onFocus={(e) => {
            setFocused(true);
            textInputConfig?.onFocus?.(e);
          }}
          onBlur={(e) => {
            setFocused(false);
            textInputConfig?.onBlur?.(e);
          }}
        />

        {isPasswordField && (
          <Pressable
            onPress={() => setIsPasswordVisible((prev) => !prev)}
            hitSlop={10}
            accessibilityRole="button"
            style={styles.trailing}
          >
            <Ionicons
              name={isPasswordVisible ? "eye-off-outline" : "eye-outline"}
              size={20}
              color={colors.textMuted}
            />
          </Pressable>
        )}

        {selectable && !isPasswordField && (
          <View style={styles.trailing} pointerEvents="none">
            <Ionicons
              name="chevron-down"
              size={18}
              color={colors.textMuted}
            />
          </View>
        )}
      </View>
    </View>
  );
};

export default PrimaryInput;

const styles = StyleSheet.create({
  container: {
    marginVertical: spacing[2],
  },
  label: {
    ...type.label,
    color: colors.textMuted,
    marginBottom: spacing[1] + 2,
  },
  labelLogin: {
    color: colors.textBody,
  },
  field: {
    flexDirection: "row",
    alignItems: "center",
    minHeight: 48,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    paddingHorizontal: spacing[3],
  },
  fieldBare: {
    flexDirection: "row",
    alignItems: "center",
  },
  fieldMultiline: {
    alignItems: "flex-start",
    minHeight: 88,
    paddingVertical: spacing[2],
  },
  fieldFocused: {
    borderColor: colors.primary,
    borderWidth: 1.5,
  },
  fieldReadOnly: {
    backgroundColor: colors.surfaceAlt,
  },
  input: {
    flex: 1,
    ...type.body,
    fontSize: 16,
    color: colors.text,
    paddingVertical: spacing[2] + 2,
  },
  inputMultiline: {
    textAlignVertical: "top",
    minHeight: 72,
  },
  inputBare: {
    paddingVertical: 0,
  },
  trailing: {
    paddingLeft: spacing[2],
  },
});
