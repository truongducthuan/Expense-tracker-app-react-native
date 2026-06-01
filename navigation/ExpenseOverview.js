import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Ionicons } from "@expo/vector-icons";

import AllExpense from "../screens/AllExpense";
import ExpenseChart from "../screens/ExpenseChart";
import IconButton from "../components/ui/IconButton";
import SelectPicker from "../components/ui/SelectPicker";
import IconDrawer from "./IconDrawer";
import { baseTabScreenOptions } from "./navigationTheme";
import { useLanguage } from "../store/languageContext";

const Tab = createBottomTabNavigator();

const ExpenseOverview = () => {
  const { t } = useLanguage();
  return (
    <Tab.Navigator
      screenOptions={({ navigation, route }) => ({
        ...baseTabScreenOptions,
        headerLeft: (props) => <IconDrawer {...props} />,
        headerRight: ({ tintColor }) =>
          route.name === "AllExpense" ? (
            <IconButton
              icon="add"
              size={24}
              color={tintColor}
              onPress={() => navigation.navigate("ManageExpense")}
            />
          ) : (
            <SelectPicker mode="expense" />
          ),
      })}
    >
      <Tab.Screen
        name="AllExpense"
        component={AllExpense}
        options={{
          title: t("all_expense"),
          tabBarLabel: t("transaction"),
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="hourglass" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="ExpenseChart"
        component={ExpenseChart}
        options={{
          tabBarLabel: t("chart"),
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="bar-chart" size={size} color={color} />
          ),
        }}
      />
    </Tab.Navigator>
  );
};

export default ExpenseOverview;
