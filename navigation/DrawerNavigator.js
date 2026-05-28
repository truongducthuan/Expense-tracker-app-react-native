import { createDrawerNavigator } from "@react-navigation/drawer";
import { Ionicons } from "@expo/vector-icons";

import { GlobalStyles } from "../constants/styles";
import ExpenseOverview from "./ExpenseOverview";
import ManageTodoList from "./ManageTodoList";
import CustomDrawerContent from "./CustomDrawerContent";

const Drawer = createDrawerNavigator();

const DrawerNavigator = () => (
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
        title: "Home",
        headerShown: false,
        drawerIcon: ({ color, size }) => (
          <Ionicons name="home" color={color} size={size} />
        ),
      }}
    />
    <Drawer.Screen
      name="Todo"
      component={ManageTodoList}
      options={{
        title: "Todo",
        headerShown: false,
        drawerIcon: ({ color, size }) => (
          <Ionicons name="person-sharp" color={color} size={size} />
        ),
      }}
    />
  </Drawer.Navigator>
);

export default DrawerNavigator;
