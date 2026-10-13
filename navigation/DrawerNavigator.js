import { createDrawerNavigator } from "@react-navigation/drawer";
import { Ionicons } from "@expo/vector-icons";

import { GlobalStyles } from "../constants/styles";
import { baseHeaderOptions } from "./navigationTheme";
import { useLanguage } from "../store/languageContext";
import ExpenseOverview from "./ExpenseOverview";
import CustomDrawerContent from "./CustomDrawerContent";
// Todo drawer entry is hidden for now; uncomment to restore.
// import ManageTodoList from "./ManageTodoList";

const Drawer = createDrawerNavigator();

// This is Nab (left nab)

const DrawerNavigator = () => {
  const { t } = useLanguage();

  return (
    <Drawer.Navigator
      screenOptions={{
        ...baseHeaderOptions,
        sceneStyle: { backgroundColor: GlobalStyles.colors.screen },
        drawerContentStyle: { backgroundColor: GlobalStyles.colors.surface },
        drawerInactiveTintColor: GlobalStyles.colors.textBody,
        drawerActiveTintColor: GlobalStyles.colors.primary,
        drawerActiveBackgroundColor: GlobalStyles.colors.primarySurface,
        drawerItemStyle: { borderRadius: GlobalStyles.radius.md },
        drawerLabelStyle: { ...GlobalStyles.type.body, fontWeight: "500" },
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
          drawerIcon: ({ color, size, focused }) => (
            <Ionicons
              name={focused ? "home" : "home-outline"}
              color={color}
              size={size}
            />
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
      {/* Settings moved into the tab bar (see ExpenseOverview) so it is
          reachable without opening the drawer; the drawer keeps the account
          header and sign-out. */}
    </Drawer.Navigator>
  );
};

export default DrawerNavigator;
