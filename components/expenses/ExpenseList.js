import { View, FlatList, Text, RefreshControl, StyleSheet } from "react-native";
import ExpenseItem from "./ExpenseItem";
import { GlobalStyles } from "../../constants/styles";

const ExpenseList = ({ items, fallBack, onRefresh, refreshing }) => {
  return (
    <View style={styles.container}>
      <FlatList
        data={items}
        renderItem={({ item }) => <ExpenseItem {...item} />}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.content}
        ListEmptyComponent={
          fallBack ? <Text style={styles.infoText}>{fallBack}</Text> : null
        }
        refreshControl={
          onRefresh ? (
            <RefreshControl
              refreshing={!!refreshing}
              onRefresh={onRefresh}
              tintColor={GlobalStyles.colors.primary100}
              colors={[GlobalStyles.colors.primary500]}
            />
          ) : undefined
        }
      />
    </View>
  );
};

export default ExpenseList;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    marginBottom: 50,
  },
  content: {
    flexGrow: 1,
  },
  infoText: {
    color: "#fff",
    fontSize: 16,
    textAlign: "center",
    marginTop: 32,
  },
});
