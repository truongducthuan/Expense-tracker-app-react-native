import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Ionicons } from "@expo/vector-icons";

import ManageItem from "../screens/ManageItem";
import IconButton from "../components/ui/IconButton";
import { baseTabScreenOptions } from "./navigationTheme";
import { useLanguage } from "../store/languageContext";

const Tab = createBottomTabNavigator();

const ManageCategoryExpense = () => <ManageItem name={"expense_category"} />;
const ManageCategoryIncome = () => <ManageItem name={"income_category"} />;
const ManageAccount = () => <ManageItem name={"account"} />;

const ManageItemOverview = () => {
  const { t } = useLanguage();
  return (
    <Tab.Navigator
      screenOptions={({ navigation, route }) => ({
        ...baseTabScreenOptions,
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
          title: t("manage_expense"),
          tabBarLabel: t("expense"),
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="trending-down" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="ManageCategoryIncome"
        component={ManageCategoryIncome}
        options={{
          title: t("manage_income"),
          tabBarLabel: t("income"),
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="trending-up" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="ManageAccount"
        component={ManageAccount}
        options={{
          title: t("manage_account"),
          tabBarLabel: t("account"),
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="logo-closed-captioning" size={size} color={color} />
          ),
        }}
      />
    </Tab.Navigator>
  );
};

export default ManageItemOverview;
