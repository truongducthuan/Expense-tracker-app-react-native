import { View, Text, Image } from "react-native";
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

const CustomDrawerContent = (props) => {
  const { user, logout } = AuthStore();
  const navigation = useNavigation();
  const { t } = useLanguage();

  const handleLogout = () => {
    logout();
    navigation.navigate("Navigation");
  };

  return (
    <DrawerContentScrollView {...props}>
      <View style={{ paddingHorizontal: 12 }}>
        <Image
          source={
            user?.photo
              ? { uri: user.photo }
              : require("../assets/account.png")
          }
          style={{ height: 100, width: 100 }}
        />
        <View>
          {user?.name && <Text style={{ marginTop: 2 }}>{user.name}</Text>}
          <Text style={{ marginTop: 2 }}>{user.email}</Text>
        </View>
      </View>
      <Text
        style={{
          borderBottomColor: GlobalStyles.colors.primary50,
          borderBottomWidth: 1,
          marginBottom: 20,
        }}
      />
      <DrawerItemList {...props} />
      <DrawerItem
        label={t("logout")}
        onPress={handleLogout}
        labelStyle={{ color: GlobalStyles.colors.error500 }}
        icon={({ focused }) => (
          <Ionicons
            color={GlobalStyles.colors.error500}
            size={24}
            name={!focused && "exit"}
          />
        )}
      />
    </DrawerContentScrollView>
  );
};

export default CustomDrawerContent;
