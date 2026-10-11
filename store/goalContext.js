import { createContext, useContext, useReducer } from "react";

const Context = createContext({
  goals: [],
  setGoals: (goals) => {},
  addGoal: (goal) => {},
  editGoal: (data, id) => {},
  removeGoal: (id) => {},
});

const reducer = (state, action) => {
  switch (action.type) {
    case "SET":
      return action.payload;
    case "ADD":
      return [action.payload, ...state];
    case "EDIT": {
      const index = state.findIndex((g) => g.id === action.payload.id);
      if (index === -1) return state;
      const next = [...state];
      next[index] = { ...next[index], ...action.payload.data };
      return next;
    }
    case "DELETE":
      return state.filter((g) => g.id !== action.payload);
    default:
      return state;
  }
};

const GoalProvider = ({ children }) => {
  const [goals, dispatch] = useReducer(reducer, []);

  const value = {
    goals,
    setGoals: (data) => dispatch({ type: "SET", payload: data }),
    addGoal: (data) => dispatch({ type: "ADD", payload: data }),
    editGoal: (data, id) => dispatch({ type: "EDIT", payload: { id, data } }),
    removeGoal: (id) => dispatch({ type: "DELETE", payload: id }),
  };

  return <Context.Provider value={value}>{children}</Context.Provider>;
};

export const GoalStore = () => useContext(Context);
export default GoalProvider;
