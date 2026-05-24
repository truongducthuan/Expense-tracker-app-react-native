import { useLayoutEffect, useState } from "react";
import { StyleSheet, View } from "react-native";
import HeaderPopup from "../ui/HeaderPopup";
import ListItem from "./ListItem";
import { CategoryStore } from "../../store/categoryContext";
import { AccountStore } from "../../store/accountContext";
import { CategoryIncomeStore } from "../../store/incomeCategory";

const ManagePopup = ({ setIsPopup, name, titleName }) => {
  const { categories } = CategoryStore();
  const { accounts } = AccountStore();
  const { categoriesIncome } = CategoryIncomeStore();

  const [items, setItems] = useState([]);

  useLayoutEffect(() => {
    const fetchItem = () => {
      if (titleName === "expense") {
        if (name === "category") {
          setItems(categories);
        } else {
          setItems(accounts);
        }
      } else if (titleName === "income") {
        if (name === "category") {
          setItems(categoriesIncome);
        } else {
          setItems(accounts);
        }
      } else {
        setItems(accounts);
      }
    };
    fetchItem();
  }, [titleName, name]);

  if (items.length) {
    return (
      <View style={styles.container}>
        <HeaderPopup
          name={name}
          icon={"create"}
          size={22}
          color={"white"}
          setIsPopup={setIsPopup}
        />
        <ListItem items={items} name={name} setIsPopup={setIsPopup} />
      </View>
    );
  }
};

export default ManagePopup;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    height: "50%",
  },
});
