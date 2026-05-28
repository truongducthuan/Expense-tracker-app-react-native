import { useEffect, useState } from "react";
import ExpenseOutput from "../components/expenses/ExpenseOutput";
import { ExpenseStore } from "../store/context";
import useRefresh from "../hooks/useRefresh";
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

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const getExpenses = async () => {
    try {
      await refreshExpenses(user.email);
    } catch (err) {
      setError("Could not fetch expenses!");
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
      const category = await fetchCategoriesExpenseDB();
      storeCategory.setCategories(category);
    } catch (err) {
      console.error(err);
    }
  };
  const fetchIncome = async () => {
    try {
      const income = await fetchCategoryIncomeDB();
      setCategoriesIncome(income);
    } catch (err) {
      console.error(err);
    }
  };
  const fetAccount = async () => {
    try {
      const account = await fetchAccountDB();
      setAccount(account);
    } catch (err) {
      console.error(err);
    }
  };
  useEffect(() => {
    fetCategory();
    fetAccount();
    fetchIncome();
  }, []);

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
      fallBack={"No expense register"}
      onRefresh={handleRefresh}
      refreshing={refreshing}
    />
  );
};

export default AllExpense;
