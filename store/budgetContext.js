import { createContext, useContext, useReducer } from "react";

const Context = createContext({
  budgets: [],
  setBudgets: (budgets) => {},
  addBudget: (budget) => {},
  editBudget: (data, id) => {},
  removeBudget: (id) => {},
});

const reducer = (state, action) => {
  switch (action.type) {
    case "SET":
      return action.payload;
    case "ADD":
      return [action.payload, ...state];
    case "EDIT": {
      const index = state.findIndex((b) => b.id === action.payload.id);
      if (index === -1) return state;
      const next = [...state];
      next[index] = { ...next[index], ...action.payload.data };
      return next;
    }
    case "DELETE":
      return state.filter((b) => b.id !== action.payload);
    default:
      return state;
  }
};

const BudgetProvider = ({ children }) => {
  const [budgets, dispatch] = useReducer(reducer, []);

  const value = {
    budgets,
    setBudgets: (data) => dispatch({ type: "SET", payload: data }),
    addBudget: (data) => dispatch({ type: "ADD", payload: data }),
    editBudget: (data, id) => dispatch({ type: "EDIT", payload: { id, data } }),
    removeBudget: (id) => dispatch({ type: "DELETE", payload: id }),
  };

  return <Context.Provider value={value}>{children}</Context.Provider>;
};

export const BudgetStore = () => useContext(Context);
export default BudgetProvider;
