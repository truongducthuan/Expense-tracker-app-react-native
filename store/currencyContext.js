import { createContext, useContext, useEffect, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

import {
  CURRENCIES,
  DEFAULT_CURRENCY,
  getCurrency,
} from "../constants/currencies";

const STORAGE_KEY = "appCurrency";

const CurrencyContext = createContext({
  code: DEFAULT_CURRENCY,
  currency: CURRENCIES[DEFAULT_CURRENCY],
  setCurrency: () => {},
});

// Holds the display currency. Persisted the same way as the language setting
// so the choice survives a restart.
const CurrencyProvider = ({ children }) => {
  const [code, setCode] = useState(DEFAULT_CURRENCY);

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY)
      .then((stored) => {
        if (stored && CURRENCIES[stored]) setCode(stored);
      })
      .catch((err) => console.error(err));
  }, []);

  const setCurrency = (next) => {
    if (!CURRENCIES[next]) return;
    setCode(next);
    AsyncStorage.setItem(STORAGE_KEY, next).catch((err) => console.error(err));
  };

  return (
    <CurrencyContext.Provider
      value={{ code, currency: getCurrency(code), setCurrency }}
    >
      {children}
    </CurrencyContext.Provider>
  );
};

export const useCurrency = () => useContext(CurrencyContext);
export default CurrencyProvider;
