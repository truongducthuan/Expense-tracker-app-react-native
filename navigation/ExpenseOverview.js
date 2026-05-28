import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Ionicons } from "@expo/vector-icons";

import AllExpense from "../screens/AllExpense";
import ExpenseChart from "../screens/ExpenseChart";
import IconButton from "../components/ui/IconButton";
import SelectPicker from "../components/ui/SelectPicker";
import IconDrawer from "./IconDrawer";
import { baseTabScreenOptions } from "./navigationTheme";

const Tab = createBottomTabNavigator();

const ExpenseOverview = () => (
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
        title: "All Expense",
        tabBarLabel: "Transaction",
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

export default ExpenseOverview;
