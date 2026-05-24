import { createContext, useContext, useReducer, useState } from "react";

const ExpenseContext = createContext();

const expenseReducer = (state, action) => {
  switch (action.type) {
    case "SET": {
      return action.payload.reverse();
    }
    case "ADD": {
      return [...state, action.payload];
    }
    case "DELETE": {
      return state.filter((e) => e.id !== action.payload);
    }
    case "UPDATE": {
      const findExpenseIndex = state.findIndex(
        (e) => e.id === action.payload.id
      );
      const updateExpense = state[findExpenseIndex];
      const updateItem = { ...updateExpense, ...action.payload.data };
      const updateExpenses = [...state];
      updateExpenses[findExpenseIndex] = updateItem;
      return updateExpenses;
    }
    default:
      return state;
  }
};

const ExpenseProvider = ({ children }) => {
  const [expenses, dispatch] = useReducer(expenseReducer, []);
  const [valueInputCategory, setValueInputCategory] = useState("");
  const [valueInputAccount, setValueInputAccount] = useState("");
  const [valueSelectChart, setValueSelectChart] = useState("Monthly");

  const addExpense = (expense) => {
    dispatch({ type: "ADD", payload: expense });
  };
  const updateExpense = (id, expense) => {
    dispatch({ type: "UPDATE", payload: { id, data: expense } });
  };
  const deleteExpense = (id) => {
    dispatch({ type: "DELETE", payload: id });
  };

  const setExpense = (expenses) => {
    dispatch({ type: "SET", payload: expenses });
  };

  // console.log({ expenses });
  const values = {
    addExpense,
    updateExpense,
    deleteExpense,
    expenses,
    setExpense,
    valueInputCategory,
    setValueInputCategory,
    valueInputAccount,
    setValueInputAccount,
    valueSelectChart,
    setValueSelectChart,
  };

  return (
    <ExpenseContext.Provider value={values}>{children}</ExpenseContext.Provider>
  );
};

export const ExpenseStore = () => {
  return useContext(ExpenseContext);
};

export default ExpenseProvider;
