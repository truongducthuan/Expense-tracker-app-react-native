import { ActivityIndicator, StyleSheet, Text, View } from "react-native";

import { GlobalStyles } from "../../constants/styles";

const { colors, spacing, type } = GlobalStyles;

// Full-screen busy state. `message` says what is happening rather than leaving
// a bare spinner (Nielsen #1 — visibility of system status).
const Loading = ({ message }) => (
  <View style={styles.container}>
    <ActivityIndicator size="large" color={colors.primary} />
    {!!message && <Text style={styles.message}>{message}</Text>}
  </View>
);

export default Loading;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: spacing[5],
    gap: spacing[3],
    backgroundColor: colors.screen,
  },
  message: {
    ...type.body,
    color: colors.textMuted,
    textAlign: "center",
  },
});
