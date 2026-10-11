import { Image, StyleSheet, Text, View } from "react-native";
import { useNavigation } from "@react-navigation/native";
import {
  DrawerContentScrollView,
  DrawerItem,
  DrawerItemList,
} from "@react-navigation/drawer";
import { Ionicons } from "@expo/vector-icons";

import { GlobalStyles } from "../constants/styles";
import { AuthStore } from "../store/authContext";
import { useLanguage } from "../store/languageContext";

const { colors, spacing, radius, type } = GlobalStyles;

const CustomDrawerContent = (props) => {
  const { user, logout } = AuthStore();
  const navigation = useNavigation();
  const { t } = useLanguage();

  const handleLogout = () => {
    logout();
    navigation.navigate("Navigation");
  };

  return (
    <DrawerContentScrollView
      {...props}
      contentContainerStyle={styles.scrollContent}
    >
      {/* Teal account header: avatar, name, email — the identity block the old
          drawer rendered as a bare 100×100 square image. */}
      <View style={styles.header}>
        <Image
          source={
            user?.photo ? { uri: user.photo } : require("../assets/account.png")
          }
          style={styles.avatar}
        />
        <View style={styles.identity}>
          {!!user?.name && (
            <Text style={styles.name} numberOfLines={1}>
              {user.name}
            </Text>
          )}
          <Text style={styles.email} numberOfLines={1}>
            {user?.email}
          </Text>
        </View>
      </View>

      <View style={styles.items}>
        <DrawerItemList {...props} />
      </View>

      <View style={styles.footer}>
        <DrawerItem
          label={t("logout")}
          onPress={handleLogout}
          labelStyle={styles.logoutLabel}
          icon={({ size }) => (
            <Ionicons
              color={colors.expense}
              size={size ?? 22}
              name="log-out-outline"
            />
          )}
        />
      </View>
    </DrawerContentScrollView>
  );
};

export default CustomDrawerContent;

const styles = StyleSheet.create({
  scrollContent: {
    paddingTop: 0,
  },
  header: {
    backgroundColor: colors.primary,
    paddingTop: spacing[6] + spacing[4],
    paddingBottom: spacing[5],
    paddingHorizontal: spacing[4],
    alignItems: "center",
    gap: spacing[3],
  },
  avatar: {
    width: 68,
    height: 68,
    borderRadius: radius.full,
    backgroundColor: colors.primarySurface,
  },
  identity: {
    alignItems: "center",
    gap: 2,
  },
  name: {
    ...type.h3,
    color: colors.onPrimary,
  },
  email: {
    ...type.caption,
    color: colors.primary100,
  },
  items: {
    paddingTop: spacing[3],
  },
  footer: {
    marginTop: spacing[3],
    paddingTop: spacing[2],
    borderTopWidth: 1,
    borderTopColor: colors.n100,
  },
  logoutLabel: {
    ...type.body,
    fontWeight: "500",
    color: colors.expenseText,
  },
});
