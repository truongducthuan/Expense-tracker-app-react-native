import { useEffect, useState } from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as SplashScreen from "expo-splash-screen";

import { baseHeaderOptions } from "./navigationTheme";
import { AuthStore } from "../store/authContext";
import { useLanguage } from "../store/languageContext";

import DrawerNavigator from "./DrawerNavigator";
import ManageItemOverview from "./ManageItemOverview";
import Authentication from "../screens/Authentication";
import ManageExpense from "../screens/ManageExpense";
import AddManageItem from "../screens/AddManageItem";
import AnualYear from "../screens/AnualYear";
import ManageBudget from "../screens/ManageBudget";
import ManageGoal from "../screens/ManageGoal";
import ManagerTodo from "../components/todoList/ManagerTodo";

const Stack = createNativeStackNavigator();
const AuthStack = createNativeStackNavigator();

function AuthenticationApp() {
  return (
    <AuthStack.Navigator screenOptions={{ headerShown: false }}>
      <AuthStack.Screen name="Authentication" component={Authentication} />
    </AuthStack.Navigator>
  );
}

function Navigation() {
  const { isAuthenticated } = AuthStore();
  return isAuthenticated ? <DrawerNavigator /> : <AuthenticationApp />;
}

function Root() {
  const { login } = AuthStore();
  const [isRestoring, setIsRestoring] = useState(true);

  // The splash screen is held open by App.js until this finishes, so hiding it
  // has to happen on every path out of here. It used to be hidden only when a
  // stored session was found: a first-time user, or anyone whose storage read
  // threw, was left looking at the splash with the app running underneath it.
  useEffect(() => {
    const restoreSession = async () => {
      try {
        const stored = await AsyncStorage.getItem("infoUser");
        if (stored) login(JSON.parse(stored));
      } catch (err) {
        console.error(err);
      } finally {
        setIsRestoring(false);
        SplashScreen.hideAsync().catch(() => {});
      }
    };
    restoreSession();
  }, []);

  // expo-app-loading was removed from the SDK. Keeping the native splash up
  // is what it did anyway, and it avoids a blank frame between the two.
  if (isRestoring) {
    return null;
  }
  return <Navigation />;
}

const RootNavigator = () => {
  const { t } = useLanguage();
  return (
    <Stack.Navigator screenOptions={baseHeaderOptions}>
      <Stack.Screen
        name="Navigation"
        component={Root}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="DrawNavigation"
        component={DrawerNavigator}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="ManageExpense"
        component={ManageExpense}
        options={{ presentation: "modal" }}
      />
      <Stack.Screen
        name="AddManageItem"
        component={AddManageItem}
        options={{ presentation: "modal" }}
      />
      <Stack.Screen
        name="AnnualYear"
        component={AnualYear}
        options={{ title: t("annual_statistical") }}
      />
      <Stack.Screen
        name="ManageBudget"
        component={ManageBudget}
        options={{ presentation: "modal" }}
      />
      <Stack.Screen
        name="ManageGoal"
        component={ManageGoal}
        options={{ presentation: "modal" }}
      />
      <Stack.Screen
        name="ManageItem"
        component={ManageItemOverview}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="ManageTodo"
        component={ManagerTodo}
        options={{ title: t("manage_todo") }}
      />
    </Stack.Navigator>
  );
};

export default RootNavigator;
