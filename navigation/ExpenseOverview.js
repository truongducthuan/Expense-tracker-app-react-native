import { Pressable, StyleSheet, View } from "react-native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Ionicons } from "@expo/vector-icons";

import AllExpense from "../screens/AllExpense";
import ExpenseChart from "../screens/ExpenseChart";
import Plan from "../screens/Plan";
import Settings from "../screens/Settings";
import SelectPicker from "../components/ui/SelectPicker";
import IconDrawer from "./IconDrawer";
import { baseTabScreenOptions } from "./navigationTheme";
import { GlobalStyles } from "../constants/styles";
import { useLanguage } from "../store/languageContext";

const { colors, radius } = GlobalStyles;

const Tab = createBottomTabNavigator();

// Raised centre action for "add transaction". Adding is the one thing users do
// several times a day, so it sits in the middle of the thumb arc instead of a
// small header icon (Fitts's law).
const AddButton = ({ onPress, label }) => (
  <View style={styles.fabSlot} pointerEvents="box-none">
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={label}
      style={({ pressed }) => [styles.fab, pressed && styles.fabPressed]}
    >
      <Ionicons name="add" size={30} color={colors.onPrimary} />
    </Pressable>
  </View>
);

// This is main screen include all list transactions and charts

const ExpenseOverview = () => {
  const { t } = useLanguage();

  return (
    <Tab.Navigator
      screenOptions={({ navigation, route }) => ({
        ...baseTabScreenOptions,
        headerLeft: (props) => <IconDrawer {...props} />,
        // The period picker only means something on the chart.
        headerRight: () =>
          route.name === "ExpenseChart" ? <SelectPicker mode="expense" /> : null,
      })}
    >
      <Tab.Screen
        name="AllExpense"
        component={AllExpense}
        options={{
          title: t("all_expense"),
          tabBarLabel: t("transaction"),
          tabBarIcon: ({ color, size, focused }) => (
            <Ionicons
              name={focused ? "list" : "list-outline"}
              size={size}
              color={color}
            />
          ),
        }}
      />

      <Tab.Screen
        name="ExpenseChart"
        component={ExpenseChart}
        options={{
          tabBarLabel: t("chart"),
          tabBarIcon: ({ color, size, focused }) => (
            <Ionicons
              name={focused ? "pie-chart" : "pie-chart-outline"}
              size={size}
              color={color}
            />
          ),
        }}
      />

      {/* Placeholder tab that renders only the centre button: it never becomes
          a screen, it pushes the modal. Declared third of five so the raised
          button lands in the middle of the bar. */}
      <Tab.Screen
        name="AddTransaction"
        component={AllExpense}
        options={({ navigation }) => ({
          tabBarLabel: "",
          tabBarButton: () => (
            <AddButton
              label={t("add_expense")}
              onPress={() => navigation.navigate("ManageExpense")}
            />
          ),
        })}
        listeners={({ navigation }) => ({
          tabPress: (e) => {
            e.preventDefault();
            navigation.navigate("ManageExpense");
          },
        })}
      />

      <Tab.Screen
        name="Plan"
        component={Plan}
        options={{
          title: t("plan"),
          tabBarLabel: t("plan"),
          tabBarIcon: ({ color, size, focused }) => (
            <Ionicons
              name={focused ? "flag" : "flag-outline"}
              size={size}
              color={color}
            />
          ),
        }}
      />

      {/* Settings lives in the tab bar rather than only the drawer: usability
          testing (issue I1 in the report) found people hunting for budget and
          category settings inside a menu they never opened. */}
      <Tab.Screen
        name="Settings"
        component={Settings}
        options={{
          title: t("settings"),
          tabBarLabel: t("settings"),
          tabBarIcon: ({ color, size, focused }) => (
            <Ionicons
              name={focused ? "person" : "person-outline"}
              size={size}
              color={color}
            />
          ),
        }}
      />
    </Tab.Navigator>
  );
};

export default ExpenseOverview;

const styles = StyleSheet.create({
  fabSlot: {
    width: 76,
    alignItems: "center",
    justifyContent: "flex-start",
  },
  fab: {
    position: "absolute",
    top: -22,
    width: 58,
    height: 58,
    borderRadius: radius.full,
    backgroundColor: colors.primary,
    borderWidth: 4,
    borderColor: colors.surface,
    alignItems: "center",
    justifyContent: "center",
    ...GlobalStyles.shadow.lg,
  },
  fabPressed: {
    backgroundColor: colors.primaryDark,
  },
});
