import { StyleSheet, View } from "react-native";

import { GlobalStyles } from "../../constants/styles";

// Surface container used for every grouped block (Gestalt — Common Region).
// `padded={false}` is for lists that need rows to span the full card width.
const Card = ({ children, style, padded = true, elevated = false }) => (
  <View
    style={[
      styles.card,
      padded && styles.padded,
      elevated && GlobalStyles.shadow.sm,
      style,
    ]}
  >
    {children}
  </View>
);

export default Card;

const styles = StyleSheet.create({
  card: {
    backgroundColor: GlobalStyles.colors.surface,
    borderRadius: GlobalStyles.radius.lg,
    borderWidth: 1,
    borderColor: GlobalStyles.colors.border,
    overflow: "hidden",
  },
  padded: {
    padding: GlobalStyles.spacing[4],
  },
});
