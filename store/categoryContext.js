import { createContext, useContext, useReducer } from "react";

const Context = createContext({
  categories: [],
  addCategory: (name) => {},
  removeCategory: (categoryId) => {},
  editCategory: (name, categoryId) => {},
  setCategories: (categories) => {},
});

const reducer = (state, action) => {
  switch (action.type) {
    case "SET": {
      return action.payload.reverse();
    }
    case "ADD": {
      return [...state, action.payload];
    }
    case "EDIT": {
      const findIndexCategory = state.findIndex(
        (e) => e.id === action.payload.id
      );
      const updateCategory = state[findIndexCategory];
      const updateItem = { ...updateCategory, ...action.payload.data };
      const cpState = [...state];
      cpState[findIndexCategory] = updateItem;
      return cpState;
    }
    case "DELETE": {
      return state.filter((c) => c.id !== action.payload);
    }
    default:
      return state;
  }
};

const ProviderCategory = ({ children }) => {
  const [categories, dispatch] = useReducer(reducer, []);

  const addCategory = (data) => {
    dispatch({ type: "ADD", payload: data });
  };

  const editCategory = (data, id) => {
    dispatch({ type: "EDIT", payload: { id, data } });
  };

  const removeCategory = (id) => {
    dispatch({ type: "DELETE", payload: id });
  };

  const setCategories = (data) => {
    dispatch({ type: "SET", payload: data });
  };

  const value = {
    addCategory,
    editCategory,
    removeCategory,
    setCategories,
    categories,
  };

  return <Context.Provider value={value}>{children}</Context.Provider>;
};

export const CategoryStore = () => {
  return useContext(Context);
};

export default ProviderCategory;
