import { createContext, useContext, useEffect, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

import { translations } from "../constants/translations";

const STORAGE_KEY = "appLang";
const DEFAULT_LANG = "en";

const LanguageContext = createContext({
  lang: DEFAULT_LANG,
  setLang: () => {},
  t: (key) => key,
});

const LanguageProvider = ({ children }) => {
  const [lang, setLangState] = useState(DEFAULT_LANG);

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY)
      .then((stored) => {
        if (stored === "vi" || stored === "en") setLangState(stored);
      })
      .catch((err) => console.error(err));
  }, []);

  const setLang = (next) => {
    setLangState(next);
    AsyncStorage.setItem(STORAGE_KEY, next).catch((err) => console.error(err));
  };

  // t("some_key") returns the localized string, falling back to the key if
  // missing so a missing translation is visible rather than rendering blank.
  const t = (key) => translations[lang]?.[key] ?? key;

  return (
    <LanguageContext.Provider value={{ lang, setLang, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => useContext(LanguageContext);
export default LanguageProvider;
