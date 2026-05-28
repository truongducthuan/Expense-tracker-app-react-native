import * as SQLite from "expo-sqlite";

const categoryExpenseDB = SQLite.openDatabase("categories_expense.db");
const categoryIncomeDB = SQLite.openDatabase("categories_income.db");
const accountDB = SQLite.openDatabase("accounts.db");
const todoDB = SQLite.openDatabase("todoList.db");

// Promisified executeSql: resolves with the SQL result, rejects with the error.
const execute = (db, sql, params = []) =>
  new Promise((resolve, reject) => {
    db.transaction((tx) => {
      tx.executeSql(
        sql,
        params,
        (_, result) => resolve(result),
        (_, err) => reject(err)
      );
    });
  });

const toNamedRows = (result) =>
  result.rows._array.map((row) => ({ name: row.name, id: row.id }));

// Inserts default rows (idempotent thanks to INSERT OR IGNORE on the UNIQUE name).
const seed = (db, table, names) => {
  const placeholders = names.map(() => "(?)").join(", ");
  return execute(
    db,
    `INSERT OR IGNORE INTO ${table} (name) VALUES ${placeholders}`,
    names
  );
};

const createNamedTable = (db, table, seedNames) =>
  execute(
    db,
    `CREATE TABLE IF NOT EXISTS ${table} (
      id INTEGER PRIMARY KEY NOT NULL,
      name TEXT UNIQUE NOT NULL
    )`
  ).then(() => seed(db, table, seedNames).catch((err) => console.error(err)));

// Expense categories
const EXPENSE_CATEGORIES = [
  "Food",
  "Health",
  "Apparel",
  "Transportation",
  "Accommodation",
  "Event",
  "Element",
  "Self-development",
  "Entertainment",
  "Book",
  "Other",
];

export const initCategoryExpense = () =>
  createNamedTable(categoryExpenseDB, "categories_expense", EXPENSE_CATEGORIES);

export const fetchCategoriesExpenseDB = () =>
  execute(
    categoryExpenseDB,
    "SELECT * FROM categories_expense ORDER BY id DESC"
  ).then(toNamedRows);

export const addExpenseCategory = (name) =>
  execute(
    categoryExpenseDB,
    "INSERT INTO categories_expense (name) VALUES (?)",
    [name]
  ).then((res) => res.insertId);

export const updateExpenseCategory = (name, id) =>
  execute(categoryExpenseDB, "UPDATE categories_expense SET name = (?) WHERE id = (?)", [
    name,
    id,
  ]);

export const deleteExpenseCategory = (id) =>
  execute(categoryExpenseDB, "DELETE FROM categories_expense WHERE id = (?)", [id]);

// Income categories
const INCOME_CATEGORIES = ["Salary", "Bonus", "OT", "Interest", "Other"];

export const initCategoryIncomeDB = () =>
  createNamedTable(categoryIncomeDB, "categories_income", INCOME_CATEGORIES);

export const fetchCategoryIncomeDB = () =>
  execute(
    categoryIncomeDB,
    "SELECT * FROM categories_income ORDER BY id DESC"
  ).then(toNamedRows);

export const deleteCategoryIncomeDB = (id) =>
  execute(categoryIncomeDB, "DELETE FROM categories_income WHERE id = (?)", [id]);

export const addIncomeCategory = (name) =>
  execute(categoryIncomeDB, "INSERT INTO categories_income (name) VALUES (?)", [
    name,
  ]).then((res) => res.insertId);

export const updateIncomeCategory = (name, id) =>
  execute(categoryIncomeDB, "UPDATE categories_income SET name = (?) WHERE id = (?)", [
    name,
    id,
  ]);

// Accounts
const ACCOUNTS = ["Cash", "Accounts", "Card", "Other"];

export const initAccountDB = () =>
  createNamedTable(accountDB, "accounts", ACCOUNTS);

export const fetchAccountDB = () =>
  execute(accountDB, "SELECT * FROM accounts ORDER BY id DESC").then(toNamedRows);

export const deleteAccountDB = (id) =>
  execute(accountDB, "DELETE FROM accounts WHERE id = (?)", [id]);

export const addAccountDB = (name) =>
  execute(accountDB, "INSERT INTO accounts (name) VALUES (?)", [name]).then(
    (res) => res.insertId
  );

export const updateAccountDB = (name, id) =>
  execute(accountDB, "UPDATE accounts SET name = (?) WHERE id = (?)", [name, id]);

// Todo list
export const initTodo = () =>
  execute(
    todoDB,
    `CREATE TABLE IF NOT EXISTS todoList (
      id INTEGER PRIMARY KEY NOT NULL,
      name TEXT UNIQUE NOT NULL,
      isDone INTEGER DEFAULT 0
    )`
  );

export const addTodo = (name) =>
  execute(todoDB, "INSERT INTO todoList (name) VALUES (?)", [name]).then(
    (res) => res.insertId
  );

export const updateTodo = (name, isDone, id) =>
  execute(todoDB, "UPDATE todoList SET name = (?), isDone = (?) WHERE id = (?)", [
    name,
    isDone,
    id,
  ]);

export const destroyTodo = (id) =>
  execute(todoDB, "DELETE FROM todoList WHERE id = (?)", [id]);

export const getTodoList = () =>
  execute(todoDB, "SELECT * FROM todoList ORDER BY id DESC").then((result) =>
    result.rows._array.map((row) => ({
      name: row.name,
      id: row.id,
      isDone: row.isDone,
    }))
  );
