import { Image, Pressable, View } from "react-native";

if (__DEV__) {
  const prevHandler = ErrorUtils.getGlobalHandler();
  ErrorUtils.setGlobalHandler((error, isFatal) => {
    console.error(
      `\n🔴 [${isFatal ? "FATAL" : "ERROR"}] ${error.message}\n${error.stack}\n`
    );
    prevHandler(error, isFatal);
  });

  const originalWarn = console.warn;
  console.warn = (...args) => {
    if (typeof args[0] === "string" && args[0].includes("Non-serializable")) return;
    originalWarn(...args);
  };
}

import { StatusBar } from "expo-status-bar";
import { NavigationContainer, useNavigation } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as SplashScreen from "expo-splash-screen";

import ContextProvider from "./store";
import DevErrorBoundary from "./components/ui/DevErrorBoundary";

import ManageExpense from "./screens/ManageExpense";
import AllExpense from "./screens/AllExpense";
import ManageItem from "./screens/ManageItem";
import AddManageItem from "./screens/AddManageItem";
import ExpenseChart from "./screens/ExpenseChart";
import { GlobalStyles } from "./constants/styles";
import IconButton from "./components/ui/IconButton";
import Authentication from "./screens/Authentication";
import { AuthStore } from "./store/authContext";
import { useEffect, useState } from "react";
import { initAccountDB, initCategoryExpense, initCategoryIncomeDB } from "./util/database";

import SelectPicker from "./components/ui/SelectPicker";
import AnualYear from "./screens/AnualYear";

SplashScreen.preventAutoHideAsync();

try {
  require("@react-native-google-signin/google-signin").GoogleSignin.configure({
    webClientId:
      "300384576511-1cfq6psoqtub50pck22es3nr3adtfcai.apps.googleusercontent.com",
  });
} catch {
  // running in Expo Go — native module unavailable
}

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

function LogoutButton() {
  const { logout } = AuthStore();
  const navigation = useNavigation();
  return (
    <Pressable
      onPress={async () => {
        logout();
        try {
          await require("@react-native-google-signin/google-signin").GoogleSignin.signOut();
        } catch {
          // native module unavailable or user didn't sign in with Google
        }
        navigation.navigate("Navigation");
      }}
      style={{ marginRight: 16 }}
    >
      <Ionicons name="exit-outline" color="white" size={24} />
    </Pressable>
  );
}

function UserAvatar() {
  const { user } = AuthStore();
  return (
    <Image
      source={
        user?.photo ? { uri: user?.photo } : require("./assets/account.png")
      }
      style={{ height: 32, width: 32, borderRadius: 16, marginLeft: 16 }}
    />
  );
}

function ExpenseOverview() {
  return (
    <Tab.Navigator
      screenOptions={({ navigation, route }) => ({
        headerStyle: {
          backgroundColor: GlobalStyles.colors.primary500,
        },
        headerTintColor: "#fff",
        tabBarStyle: {
          backgroundColor: GlobalStyles.colors.primary500,
        },
        tabBarActiveTintColor: GlobalStyles.colors.accent500,
        headerLeft: () => <UserAvatar />,
        headerRight: ({ tintColor }) => {
          if (route.name === "AllExpense") {
            return (
              <View style={{ flexDirection: "row", alignItems: "center" }}>
                <IconButton
                  icon="add"
                  size={24}
                  color={tintColor}
                  onPress={() => navigation.navigate("ManageExpense")}
                />
                <LogoutButton />
              </View>
            );
          }
          return (
            <View style={{ flexDirection: "row", alignItems: "center" }}>
              <SelectPicker />
              <LogoutButton />
            </View>
          );
        },
      })}
    >
      <Tab.Screen
        name="AllExpense"
        component={AllExpense}
        options={{
          title: "All Expense",
          tabBarLabel: "Expense",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="hourglass" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="ExpenseChart"
        component={ExpenseChart}
        options={{
          tabBarLabel: "Chart",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="bar-chart" size={size} color={color} />
          ),
        }}
      />
    </Tab.Navigator>
  );
}

function ManageCategoryExpense() {
  return <ManageItem name={"expense_category"} />;
}

function ManageCategoryIncome() {
  return <ManageItem name={"income_category"} />;
}

function ManageAccount() {
  return <ManageItem name={"account"} />;
}

function ManageItemOverview() {
  return (
    <Tab.Navigator
      screenOptions={({ navigation, route }) => ({
        headerStyle: {
          backgroundColor: GlobalStyles.colors.primary500,
        },
        headerTintColor: "#fff",
        tabBarStyle: {
          backgroundColor: GlobalStyles.colors.primary500,
        },
        tabBarActiveTintColor: GlobalStyles.colors.accent500,
        headerRight: ({ tintColor }) => (
          <IconButton
            icon="add"
            size={24}
            color={tintColor}
            onPress={() =>
              navigation.navigate("AddManageItem", { name: route.name })
            }
          />
        ),
      })}
    >
      <Tab.Screen
        name="ManageCategoryExpense"
        component={ManageCategoryExpense}
        options={{
          title: "Manage Expense",
          tabBarLabel: "Expense",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="trending-down" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="ManageCategoryIncome"
        component={ManageCategoryIncome}
        options={{
          title: "Manage Income",
          tabBarLabel: "Income",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="trending-up" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="ManageAccount"
        component={ManageAccount}
        options={{
          title: "Manage Account",
          tabBarLabel: "Account",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="logo-closed-captioning" size={size} color={color} />
          ),
        }}
      />
    </Tab.Navigator>
  );
}

function AuthenticationApp() {
  return (
    <Stack.Navigator>
      <Stack.Screen name="Authentication" component={Authentication} />
    </Stack.Navigator>
  );
}

function Navigation() {
  const { isAuthenticated } = AuthStore();
  return <>{!isAuthenticated ? <AuthenticationApp /> : <ExpenseOverview />}</>;
}

const Root = () => {
  const { login } = AuthStore();
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    const init = async () => {
      try {
        const value = await AsyncStorage.getItem("infoUser");
        if (value) {
          login(JSON.parse(value));
        }
      } catch {
        // failed to load stored session - proceed to login screen
      } finally {
        setIsReady(true);
        SplashScreen.hideAsync();
      }
    };
    init();
  }, []);

  if (!isReady) return null;

  return <Navigation />;
};

export default function App() {
  useEffect(() => {
    initCategoryIncomeDB();
    initCategoryExpense();
    initAccountDB();
  }, []);

  return (
    <DevErrorBoundary>
      <StatusBar style="auto" />
      <ContextProvider>
        <NavigationContainer>
          <Stack.Navigator
            screenOptions={{
              headerStyle: {
                backgroundColor: GlobalStyles.colors.primary500,
              },
              headerTintColor: "#fff",
            }}
          >
            <Stack.Screen
              name="Navigation"
              component={Root}
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
          </Stack.Navigator>
        </NavigationContainer>
      </ContextProvider>
    </DevErrorBoundary>
  );
}
