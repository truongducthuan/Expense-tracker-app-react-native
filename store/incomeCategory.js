import { createContext, useContext, useReducer } from "react";

const Context = createContext();

const reducer = (state, action) => {
  switch (action.type) {
    case "SET":
      // No reordering here: the query already returns rows in the order the
      // user arranged them (ORDER BY position). The old `.reverse()` both
      // flipped that order and mutated the caller's array in place.
      return action.payload;
    case "ADD":
      const newData = [...state, action.payload];
      return newData;
    case "EDIT":
      const findIndexCategory = state.findIndex(
        (e) => e.id === action.payload.id
      );
      const updateCategory = state[findIndexCategory];
      const updateItem = { ...updateCategory, ...action.payload.data };
      const cpState = [...state];
      cpState[findIndexCategory] = updateItem;
      return cpState;
    case "DELETE":
      return state.filter((c) => c.id !== action.payload);
    default:
      return state;
  }
};

const ProviderCategoryIncome = ({ children }) => {
  const [categoriesIncome, dispatch] = useReducer(reducer, []);

  const addCategoriesIncome = (data) => {
    dispatch({ type: "ADD", payload: data });
  };

  const editCategoriesIncome = (data, id) => {
    dispatch({ type: "EDIT", payload: { id, data } });
  };

  const removeCategoriesIncome = (id) => {
    dispatch({ type: "DELETE", payload: id });
  };

  const setCategoriesIncome = (data) => {
    dispatch({ type: "SET", payload: data });
  };

  const value = {
    addCategoriesIncome,
    editCategoriesIncome,
    removeCategoriesIncome,
    setCategoriesIncome,
    categoriesIncome,
  };

  return <Context.Provider value={value}>{children}</Context.Provider>;
};

export const CategoryIncomeStore = () => {
  return useContext(Context);
};

export default ProviderCategoryIncome;
