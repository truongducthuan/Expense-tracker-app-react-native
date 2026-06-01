import { createDrawerNavigator } from "@react-navigation/drawer";
import { Ionicons } from "@expo/vector-icons";

import { GlobalStyles } from "../constants/styles";
import { useLanguage } from "../store/languageContext";
import ExpenseOverview from "./ExpenseOverview";
import CustomDrawerContent from "./CustomDrawerContent";
import Settings from "../screens/Settings";
// Todo drawer entry is hidden for now; uncomment to restore.
// import ManageTodoList from "./ManageTodoList";

const Drawer = createDrawerNavigator();

const DrawerNavigator = () => {
  const { t } = useLanguage();

  return (
    <Drawer.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: "#351401" },
        headerTintColor: "#fff",
        sceneContainerStyle: { backgroundColor: "#3f2f25" },
        drawerContentStyle: { backgroundColor: "#351401" },
        drawerInactiveTintColor: GlobalStyles.colors.primary500,
        drawerActiveTintColor: "#351401",
        drawerActiveBackgroundColor: "#e4baa1",
        drawerHideStatusBarOnOpen: false,
      }}
      drawerContent={(props) => <CustomDrawerContent {...props} />}
    >
      <Drawer.Screen
        name="ExpenseOverview"
        component={ExpenseOverview}
        options={{
          title: t("home"),
          headerShown: false,
          drawerIcon: ({ color, size }) => (
            <Ionicons name="home" color={color} size={size} />
          ),
        }}
      />
      {/* <Drawer.Screen
        name="Todo"
        component={ManageTodoList}
        options={{
          title: "Todo",
          headerShown: false,
          drawerIcon: ({ color, size }) => (
            <Ionicons name="person-sharp" color={color} size={size} />
          ),
        }}
      /> */}
      <Drawer.Screen
        name="Settings"
        component={Settings}
        options={{
          title: t("settings"),
          drawerIcon: ({ color, size }) => (
            <Ionicons name="settings-outline" color={color} size={size} />
          ),
        }}
      />
    </Drawer.Navigator>
  );
};

export default DrawerNavigator;
