import { useCallback, useEffect, useState } from "react";
import { View, Text, StyleSheet, FlatList } from "react-native";

import { formatAmount } from "../../util/format";
import { AccountStore } from '../../store/accountContext'
import { ExpenseStore } from "../../store/context";
import { removeAccents } from "../../util/tools";

const TotalTypeIncome = () => {
  const { expenses } = ExpenseStore();
  const {accounts} = AccountStore();
  const [totalType, setTotalType] = useState(accounts);
  const [amountRemain, setAmountRemain] = useState(0);

  useEffect(() => {
    const transfer = expenses.filter(item => item.type === 'transfer');
    const income = expenses.filter(item => item.type === 'income');
    const spend = expenses.filter(item => item.type === 'expense');

    // calc the total amount remaining after reduces the amount spent
    const totalAmountRemain = remainingAmount(income, spend);
    setAmountRemain(totalAmountRemain);

    // reduces amount follow transfer
    const transferTypeObject = hashMap(transfer);
    
    const updateState = totalType.map((item, index) => {
      const spendByName = spend.filter(i => removeAccents(i.account) === removeAccents(item.name)); //filter spent follow account
      const totalAmountSpendByName = calcTotal(spendByName); // get total amount spent follow account name
      const totalAmount = handleFilter(income, item.name); // get total amount income from account name
      let amount = totalAmount - totalAmountSpendByName;
      
      for(let key in transferTypeObject) {
        if(key === item.name) {
          amount += +transferTypeObject[key];
        }
      }

      return {...item, amount}
    })

    setTotalType(updateState);
  }, [accounts, expenses])

  const remainingAmount = (income, spend) => {
    return calcTotal(income) - calcTotal(spend)
  }

  const calcTotal = (data) => {
    return data.reduce((a, b) => a + +b.amount, 0);
  };

  const handleFilter = (arr, type) => {
    let amount = 0;
    arr.filter(i => {
      if(removeAccents(i.account) == removeAccents(type)) {
        amount += +i.amount;
      }
    });
    return amount;
  }

  const hashMap = (data) => {
    let balances = {};
    for(let value of data) {
      balances[value.account] = (balances[value.account] || 0) + +value.amount;
      balances[value.category] = (balances[value.category] || 0) - +value.amount;
    }
    return balances;
  }


  return (
    <View style={styles.container}>
      {totalType.map((item, index) => (
        <View key={index} style={[styles.item, index % 2 == 0 ? styles.even : styles.odd]}>
          <Text>{item.name}:</Text>
          <Text>$ {formatAmount(item.amount)}</Text>
        </View>
      ))}
      <View style={styles.item}>
          <Text>Total:</Text>
          <Text>$ {formatAmount(amountRemain)}</Text>
        </View>
    </View>
  );
};

export default TotalTypeIncome;

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    display: 'flex',
    flexDirection: 'column',
  },
  item: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#fff',
    paddingVertical: 5,
    paddingHorizontal: 5,
    borderRadius: 8
  },
  odd: {
    backgroundColor: '#dce5ee',
  },
  even: {
    backgroundColor: '#ccced2',
  },
})