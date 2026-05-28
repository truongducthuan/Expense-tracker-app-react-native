import { Pressable, Text } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";

const IconDrawer = () => {
  const navigation = useNavigation();
  return (
    <Pressable
      onPress={() => navigation.openDrawer()}
      style={{ marginLeft: 24 }}
    >
      <Text>
        <Ionicons name="list" color={"white"} size={24} />
      </Text>
    </Pressable>
  );
};

export default IconDrawer;
