import { useEffect, useState } from "react";
import ExpenseOutput from "../components/expenses/ExpenseOutput";
import { ExpenseStore } from "../store/context";
import useRefresh from "../hooks/useRefresh";
import { useLanguage } from "../store/languageContext";
import Loading from "../components/ui/Loading";
import ErrorOverlay from "../components/ui/ErrorOverlay";
import { CategoryStore } from "../store/categoryContext";
import { AccountStore } from "../store/accountContext";
import {
  fetchAccountDB,
  fetchCategoriesExpenseDB,
  fetchCategoryIncomeDB,
} from "../util/database";
import { CategoryIncomeStore } from "../store/incomeCategory";
import { AuthStore } from "../store/authContext";

const AllExpense = () => {
  const { refreshExpenses } = ExpenseStore();
  const storeCategory = CategoryStore();
  const { setAccount } = AccountStore();
  const { setCategoriesIncome } = CategoryIncomeStore();
  const { user, isAuthenticated } = AuthStore();
  const { t, lang } = useLanguage();

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const getExpenses = async () => {
    try {
      await refreshExpenses(user.email);
    } catch (err) {
      setError(t("could_not_fetch"));
    }
  };

  useEffect(() => {
    if (!isAuthenticated) return;
    (async () => {
      setIsLoading(true);
      await getExpenses();
      setIsLoading(false);
    })();
  }, []);

  const fetCategory = async () => {
    try {
      const category = await fetchCategoriesExpenseDB(lang);
      storeCategory.setCategories(category);
    } catch (err) {
      console.error(err);
    }
  };
  const fetchIncome = async () => {
    try {
      const income = await fetchCategoryIncomeDB(lang);
      setCategoriesIncome(income);
    } catch (err) {
      console.error(err);
    }
  };
  const fetAccount = async () => {
    try {
      const account = await fetchAccountDB(lang);
      setAccount(account);
    } catch (err) {
      console.error(err);
    }
  };
  useEffect(() => {
    fetCategory();
    fetAccount();
    fetchIncome();
  }, [lang]);

  const { refreshing, handleRefresh } = useRefresh(() =>
    Promise.all([getExpenses(), fetCategory(), fetAccount(), fetchIncome()])
  );

  const handleError = () => {
    setError(null);
  };

  if (error) {
    return <ErrorOverlay message={error} onPress={handleError} />;
  }

  if (isLoading) {
    return <Loading />;
  }

  return (
    <ExpenseOutput
      fallBack={t("no_expense")}
      onRefresh={handleRefresh}
      refreshing={refreshing}
    />
  );
};

export default AllExpense;
