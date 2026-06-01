import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Ionicons } from "@expo/vector-icons";

import TodoList from "../screens/TodoList";
import TodoChart from "../screens/TodoChart";
import IconButton from "../components/ui/IconButton";
import SelectPicker from "../components/ui/SelectPicker";
import IconDrawer from "./IconDrawer";
import { baseTabScreenOptions } from "./navigationTheme";
import { useLanguage } from "../store/languageContext";

const Tab = createBottomTabNavigator();

const ManageTodoList = () => {
  const { t } = useLanguage();
  return (
    <Tab.Navigator
      screenOptions={({ navigation, route }) => ({
        ...baseTabScreenOptions,
        headerLeft: (props) => <IconDrawer {...props} />,
        headerRight: ({ tintColor }) =>
          route.name === "TodoList" ? (
            <IconButton
              icon="add-circle"
              size={24}
              color={tintColor}
              onPress={() => navigation.navigate("ManageTodo")}
            />
          ) : (
            <SelectPicker mode="todo" />
          ),
      })}
    >
      <Tab.Screen
        name="TodoList"
        component={TodoList}
        options={{
          tabBarLabel: t("todo_list"),
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="list-circle" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Statistical"
        component={TodoChart}
        options={{
          tabBarLabel: t("statistical"),
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="bar-chart" size={size} color={color} />
          ),
        }}
      />
    </Tab.Navigator>
  );
};

export default ManageTodoList;
