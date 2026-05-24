import { createContext, useContext, useReducer } from "react";

const Context = createContext({
  accounts: [],
  addAccount: (name) => {},
  removeAccount: (id) => {},
  editAccount: (name, id) => {},
  setAccount: (data) => {},
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
      const findIndexData = state.findIndex((e) => e.id === action.payload.id);
      const updateData = state[findIndexData];
      const updateItem = { ...updateData, ...action.payload.data };
      const cpState = [...state];
      cpState[findIndexData] = updateItem;
      return cpState;
    }
    case "DELETE": {
      return state.filter((c) => c.id !== action.payload);
    }
    default:
      return state;
  }
};

const ProviderAccount = ({ children }) => {
  const [accounts, dispatch] = useReducer(reducer, []);

  const addAccount = (data) => {
    dispatch({ type: "ADD", payload: data });
  };

  const editAccount = (data, id) => {
    dispatch({ type: "EDIT", payload: { id, data } });
  };

  const removeAccount = (id) => {
    dispatch({ type: "DELETE", payload: id });
  };

  const setAccount = (data) => {
    dispatch({ type: "SET", payload: data });
  };

  const value = {
    addAccount,
    editAccount,
    removeAccount,
    setAccount,
    accounts,
  };

  return <Context.Provider value={value}>{children}</Context.Provider>;
};

export const AccountStore = () => {
  return useContext(Context);
};

export default ProviderAccount;
