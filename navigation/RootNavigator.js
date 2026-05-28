import { useEffect, useState } from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import AsyncStorage from "@react-native-async-storage/async-storage";
import AppLoading from "expo-app-loading";
import * as SplashScreen from "expo-splash-screen";

import { GlobalStyles } from "../constants/styles";
import { AuthStore } from "../store/authContext";

import DrawerNavigator from "./DrawerNavigator";
import ManageItemOverview from "./ManageItemOverview";
import Authentication from "../screens/Authentication";
import ManageExpense from "../screens/ManageExpense";
import AddManageItem from "../screens/AddManageItem";
import AnualYear from "../screens/AnualYear";
import ManagerTodo from "../components/todoList/ManagerTodo";

const Stack = createNativeStackNavigator();
const AuthStack = createNativeStackNavigator();

function AuthenticationApp() {
  return (
    <AuthStack.Navigator>
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

  useEffect(() => {
    const restoreSession = async () => {
      try {
        const stored = await AsyncStorage.getItem("infoUser");
        if (stored) {
          login(JSON.parse(stored));
          await SplashScreen.hideAsync();
        }
        setIsRestoring(false);
      } catch (err) {
        console.error(err);
      }
    };
    restoreSession();
  }, []);

  if (isRestoring) {
    return <AppLoading />;
  }
  return <Navigation />;
}

const RootNavigator = () => (
  <Stack.Navigator
    screenOptions={{
      headerStyle: { backgroundColor: GlobalStyles.colors.primary500 },
      headerTintColor: "#fff",
    }}
  >
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
      options={{ title: "Annual statistical" }}
    />
    <Stack.Screen
      name="ManageItem"
      component={ManageItemOverview}
      options={{ headerShown: false }}
    />
    <Stack.Screen
      name="ManageTodo"
      component={ManagerTodo}
      options={{ title: "Manage Todo" }}
    />
  </Stack.Navigator>
);

export default RootNavigator;
