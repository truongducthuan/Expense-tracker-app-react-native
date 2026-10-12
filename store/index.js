import AuthContextProvider from "./authContext";
import ExpenseProvider from "./context";
import ProviderCategory from "./categoryContext";
import ProviderAccount from "./accountContext";
import ProviderCategoryIncome from "./incomeCategory";
import ProviderTodo from "./todo/todoList";
import LanguageProvider from "./languageContext";
import DialogProvider from "./dialogContext";
import CurrencyProvider from "./currencyContext";
import ReminderProvider from "./reminderContext";
import BudgetProvider from "./budgetContext";
import GoalProvider from "./goalContext";

export default function ContextProvider({ children }) {
  return (
    <LanguageProvider>
      <DialogProvider>
        <CurrencyProvider>
          <ReminderProvider>
            <AuthContextProvider>
              <ExpenseProvider>
                <ProviderAccount>
                  <ProviderCategoryIncome>
                    <ProviderTodo>
                      <BudgetProvider>
                        <GoalProvider>
                          <ProviderCategory>{children}</ProviderCategory>
                        </GoalProvider>
                      </BudgetProvider>
                    </ProviderTodo>
                  </ProviderCategoryIncome>
                </ProviderAccount>
              </ExpenseProvider>
            </AuthContextProvider>
          </ReminderProvider>
        </CurrencyProvider>
      </DialogProvider>
    </LanguageProvider>
  );
}
