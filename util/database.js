import * as SQLite from "expo-sqlite";

// openDatabaseSync replaces the deprecated openDatabase() from SDK 49
const categoryExpenseDB = SQLite.openDatabaseSync("categories_expense.db");
const categoryIncomeDB = SQLite.openDatabaseSync("categories_income.db");
const accountDB = SQLite.openDatabaseSync("accounts.db");

const EXPENSE_CATEGORIES = [
  "Food", "Health", "Apparel", "Transportation", "Accommodation",
  "Event", "Element", "Self-development", "Entertainment", "Book", "Other",
];

const INCOME_CATEGORIES = ["Salary", "Bonus", "OT", "Interest", "Other"];

const INITIAL_ACCOUNTS = ["Cash", "Accounts", "Card", "Other"];

// --- Expense Categories ---

export const initCategoryExpense = () => {
  categoryExpenseDB.runSync(`
    CREATE TABLE IF NOT EXISTS categories_expense (
      id INTEGER PRIMARY KEY NOT NULL,
      name TEXT UNIQUE NOT NULL
    )
  `);
  const placeholders = EXPENSE_CATEGORIES.map(() => "(?)").join(", ");
  categoryExpenseDB.runSync(
    `INSERT OR IGNORE INTO categories_expense (name) VALUES ${placeholders}`,
    EXPENSE_CATEGORIES
  );
};

export const fetchCategoriesExpenseDB = () => {
  return categoryExpenseDB.getAllSync(
    "SELECT * FROM categories_expense ORDER BY id DESC"
  );
};

export const addExpenseCategory = (name) => {
  const result = categoryExpenseDB.runSync(
    "INSERT INTO categories_expense (name) VALUES (?)",
    [name]
  );
  return result.lastInsertRowId;
};

export const updateExpenseCategory = (name, id) => {
  categoryExpenseDB.runSync(
    "UPDATE categories_expense SET name = ? WHERE id = ?",
    [name, id]
  );
};

export const deleteExpenseCategory = (id) => {
  categoryExpenseDB.runSync(
    "DELETE FROM categories_expense WHERE id = ?",
    [id]
  );
};

// --- Income Categories ---

export const initCategoryIncomeDB = () => {
  categoryIncomeDB.runSync(`
    CREATE TABLE IF NOT EXISTS categories_income (
      id INTEGER PRIMARY KEY NOT NULL,
      name TEXT UNIQUE NOT NULL
    )
  `);
  const placeholders = INCOME_CATEGORIES.map(() => "(?)").join(", ");
  categoryIncomeDB.runSync(
    `INSERT OR IGNORE INTO categories_income (name) VALUES ${placeholders}`,
    INCOME_CATEGORIES
  );
};

export const fetchCategoryIncomeDB = () => {
  return categoryIncomeDB.getAllSync(
    "SELECT * FROM categories_income ORDER BY id DESC"
  );
};

export const addIncomeCategory = (name) => {
  const result = categoryIncomeDB.runSync(
    "INSERT INTO categories_income (name) VALUES (?)",
    [name]
  );
  return result.lastInsertRowId;
};

export const updateIncomeCategory = (name, id) => {
  categoryIncomeDB.runSync(
    "UPDATE categories_income SET name = ? WHERE id = ?",
    [name, id]
  );
};

export const deleteCategoryIncomeDB = (id) => {
  categoryIncomeDB.runSync(
    "DELETE FROM categories_income WHERE id = ?",
    [id]
  );
};

// --- Accounts ---

export const initAccountDB = () => {
  accountDB.runSync(`
    CREATE TABLE IF NOT EXISTS accounts (
      id INTEGER PRIMARY KEY NOT NULL,
      name TEXT UNIQUE NOT NULL
    )
  `);
  const placeholders = INITIAL_ACCOUNTS.map(() => "(?)").join(", ");
  accountDB.runSync(
    `INSERT OR IGNORE INTO accounts (name) VALUES ${placeholders}`,
    INITIAL_ACCOUNTS
  );
};

export const fetchAccountDB = () => {
  return accountDB.getAllSync("SELECT * FROM accounts ORDER BY id DESC");
};

export const addAccountDB = (name) => {
  const result = accountDB.runSync(
    "INSERT INTO accounts (name) VALUES (?)",
    [name]
  );
  return result.lastInsertRowId;
};

export const updateAccountDB = (name, id) => {
  accountDB.runSync(
    "UPDATE accounts SET name = ? WHERE id = ?",
    [name, id]
  );
};

export const deleteAccountDB = (id) => {
  accountDB.runSync("DELETE FROM accounts WHERE id = ?", [id]);
};
