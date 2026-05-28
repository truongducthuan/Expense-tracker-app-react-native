import "react-native-gesture-handler";
import { useEffect } from "react";
import { StatusBar } from "expo-status-bar";
import { NavigationContainer } from "@react-navigation/native";
import * as SplashScreen from "expo-splash-screen";

import ContextProvider from "./store";
import RootNavigator from "./navigation/RootNavigator";
import {
  initAccountDB,
  initCategoryExpense,
  initCategoryIncomeDB,
  initTodo,
} from "./util/database";

SplashScreen.preventAutoHideAsync();

export default function App() {
  useEffect(() => {
    initCategoryIncomeDB();
    initCategoryExpense();
    initAccountDB();
    initTodo();
  }, []);

  return (
    <>
      <StatusBar style="auto" />
      <ContextProvider>
        <NavigationContainer>
          <RootNavigator />
        </NavigationContainer>
      </ContextProvider>
    </>
  );
}
