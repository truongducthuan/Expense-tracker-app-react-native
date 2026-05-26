import "react-native-gesture-handler";
import { Image, Pressable, Text, View } from "react-native";
import { StatusBar } from "expo-status-bar";
import { NavigationContainer, useNavigation } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import {
  DrawerContentScrollView,
  DrawerItem,
  DrawerItemList,
  createDrawerNavigator,
} from "@react-navigation/drawer";
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as SplashScreen from "expo-splash-screen";
import { GoogleSignin } from "@react-native-google-signin/google-signin";

import { getHeaderTitle } from "@react-navigation/elements";

import ContextProvider from "./store";

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
import {
  deleteTableExpense,
  deleteTableIncome,
  initAccountDB,
  initCategoryExpense,
  initCategoryIncomeDB,
} from "./util/database";

import SelectPicker from "./components/ui/SelectPicker";
import AnualYear from "./screens/AnualYear";
import User from "./screens/User";

SplashScreen.preventAutoHideAsync();
GoogleSignin.configure({
  webClientId:
    "300384576511-1cfq6psoqtub50pck22es3nr3adtfcai.apps.googleusercontent.com",
});

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();
const Drawer = createDrawerNavigator();

const IconDrawer = () => {
  const navigation = useNavigation();
  return (
    <Pressable
      onPress={() => {
        navigation.openDrawer();
      }}
      style={{ marginLeft: 24 }}
    >
      <Text>
        <Ionicons name="list" color={"white"} size={24} />
      </Text>
    </Pressable>
  );
};

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
        headerLeft: (props) => <IconDrawer {...props} />,
        headerRight: ({ tintColor }) => {
          if (route.name === "AllExpense") {
            return (
              <IconButton
                icon="add"
                size={24}
                color={tintColor}
                onPress={() => {
                  navigation.navigate("ManageExpense");
                }}
              />
            );
          }
          return <SelectPicker />;
        },
      })}
    >
      <Tab.Screen
        name="AllExpense"
        component={AllExpense}
        options={{
          title: "All Expense",
          tabBarLabel: "Expense",
          tabBarIcon: ({ color, size }) => {
            return <Ionicons name="hourglass" size={size} color={color} />;
          },
        }}
      />

      <Tab.Screen
        name="ExpenseChart"
        component={ExpenseChart}
        options={{
          tabBarLabel: "Chart",
          tabBarIcon: ({ color, size }) => {
            return <Ionicons name="bar-chart" size={size} color={color} />;
          },
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
        // headerLeft: (props) => <IconDrawer {...props} />,
        headerRight: ({ tintColor }) => {
          return (
            <IconButton
              icon="add"
              size={24}
              color={tintColor}
              onPress={() => {
                navigation.navigate("AddManageItem", { name: route.name });
              }}
            />
          );
        },
      })}
    >
      <Tab.Screen
        name="ManageCategoryExpense"
        component={ManageCategoryExpense}
        options={{
          title: "Manage Expense",
          tabBarLabel: "Expense",
          tabBarIcon: ({ color, size }) => {
            return <Ionicons name="trending-down" size={size} color={color} />;
          },
        }}
      />

      <Tab.Screen
        name="ManageCategoryIncome"
        component={ManageCategoryIncome}
        options={{
          title: "Manage Income",
          tabBarLabel: "Income",
          tabBarIcon: ({ color, size }) => {
            return <Ionicons name="trending-up" size={size} color={color} />;
          },
        }}
      />
      <Tab.Screen
        name="ManageAccount"
        component={ManageAccount}
        options={{
          title: "Manage Account",
          tabBarLabel: "Account",
          tabBarIcon: ({ color, size }) => {
            return (
              <Ionicons
                name="logo-closed-captioning"
                size={size}
                color={color}
              />
            );
          },
        }}
      />
    </Tab.Navigator>
  );
}

// customer drawer
function CustomerDrawerContent(props) {
  const { user } = AuthStore();
  const navigation = useNavigation();
  const { logout } = AuthStore();

  return (
    <DrawerContentScrollView {...props}>
      <View
        style={{
          paddingHorizontal: 12,
        }}
      >
        <Image
          source={
            user?.photo ? { uri: user?.photo } : require("./assets/account.png")
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
      ></Text>
      <DrawerItemList {...props} />
      <DrawerItem
        label={"Logout"}
        onPress={async () => {
          logout();
          await GoogleSignin.signOut();
          navigation.navigate("Navigation");
        }}
        labelStyle={{ color: GlobalStyles.colors.error500 }}
        icon={({ focused, color, size }) => (
          <Ionicons
            color={GlobalStyles.colors.error500}
            size={24}
            name={!focused && "exit"}
          />
        )}
      />
    </DrawerContentScrollView>
  );
}

function DrawNavigation() {
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
        drawerItemStyle: {
          fontSize: 80,
          color: "red",
        },
      }}
      drawerContent={(props) => <CustomerDrawerContent {...props} />}
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
        name="Settings"
        component={ExpenseOverview}
        options={{
          title: "Settings",
          headerShown: false,
          drawerIcon: ({ color, size }) => (
            <Ionicons name="settings" color={color} size={size} />
          ),
        }}
      />
    </Drawer.Navigator>
  );
}

function AuthenticationApp() {
  return (
    <Stack.Navigator>
      <Stack.Screen
        name="Authentication"
        component={Authentication}
        options={
          {
            // headerShown: false,
          }
        }
      />
    </Stack.Navigator>
  );
}

function Navigation() {
  const { isAuthenticated } = AuthStore();

  return <>{!isAuthenticated ? <AuthenticationApp /> : <DrawNavigation />}</>;
}

const Root = () => {
  const { login } = AuthStore();
  const [isLogin, setIsLogin] = useState(true);
  useEffect(() => {
    const getToken = async () => {
      try {
        const value = await AsyncStorage.getItem("infoUser");
        if (value) {
          const res = JSON.parse(value);
          login(res);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setIsLogin(false);
        await SplashScreen.hideAsync();
      }
    };
    getToken();
  }, []);
  if (isLogin) {
    return null;
  }

  return <Navigation />;
};

export default function App() {
  useEffect(() => {
    // deleteTableExpense();
    // deleteTableIncome();
    initCategoryIncomeDB();
    initCategoryExpense();
    initAccountDB();
  }, []);

  return (
    <>
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
              options={{
                headerShown: false,
              }}
            />
            <Stack.Screen
              name="DrawNavigation"
              component={DrawNavigation}
              options={{
                headerShown: false,
              }}
            />
            <Stack.Screen
              name="ManageExpense"
              component={ManageExpense}
              options={{
                // title: "Manage Expense",
                presentation: "modal", //2 task add and edit
              }}
            />
            <Stack.Screen
              name="AddManageItem"
              component={AddManageItem}
              options={{
                presentation: "modal",
              }}
            />
            <Stack.Screen
              name="AnnualYear"
              component={AnualYear}
              options={{
                title: "Annual statistical",
              }}
            />
            <Stack.Screen
              name="ManageItem"
              component={ManageItemOverview}
              options={{
                headerShown: false,
                drawerIcon: ({ color, size }) => (
                  <Ionicons name="create" color={color} size={size} />
                ),
              }}
            />
          </Stack.Navigator>
        </NavigationContainer>
      </ContextProvider>
    </>
  );
}
