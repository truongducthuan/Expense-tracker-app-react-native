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

// Adds the `lang` column to legacy tables that pre-date i18n. Errors are
// swallowed because re-running on a table that already has the column throws.
const ensureLangColumn = (db, table) =>
  execute(
    db,
    `ALTER TABLE ${table} ADD COLUMN lang TEXT NOT NULL DEFAULT 'en'`
  ).catch(() => {});

// Inserts default rows tagged with the given language. Idempotent thanks to
// INSERT OR IGNORE on the UNIQUE(name) constraint.
const seed = (db, table, names, lang) => {
  const placeholders = names.map(() => "(?, ?)").join(", ");
  const params = names.flatMap((n) => [n, lang]);
  return execute(
    db,
    `INSERT OR IGNORE INTO ${table} (name, lang) VALUES ${placeholders}`,
    params
  );
};

const createNamedTable = (db, table, seedsByLang) =>
  execute(
    db,
    `CREATE TABLE IF NOT EXISTS ${table} (
      id INTEGER PRIMARY KEY NOT NULL,
      name TEXT UNIQUE NOT NULL
    )`
  )
    .then(() => ensureLangColumn(db, table))
    .then(() =>
      Promise.all(
        Object.entries(seedsByLang).map(([lang, names]) =>
          seed(db, table, names, lang).catch((err) => console.error(err))
        )
      )
    );

// Expense categories
const EXPENSE_CATEGORIES = {
  en: [
    "Food",
    "Health",
    "Apparel",
    "Transportation",
    "Accommodation",
    "Event",
    "Tools",
    "Self-development",
    "Entertainment",
    "Book",
    "Other",
  ],
  vi: [
    "Ăn uống",
    "Sức khoẻ",
    "Trang phục",
    "Di chuyển",
    "Nhà ở",
    "Sự kiện",
    "Thiết bị",
    "Phát triển bản thân",
    "Giải trí",
    "Sách",
    "Khác",
  ],
};

export const initCategoryExpense = () =>
  createNamedTable(categoryExpenseDB, "categories_expense", EXPENSE_CATEGORIES);

export const fetchCategoriesExpenseDB = (lang = "en") =>
  execute(
    categoryExpenseDB,
    "SELECT * FROM categories_expense WHERE lang = ? ORDER BY id DESC",
    [lang]
  ).then(toNamedRows);

export const addExpenseCategory = (name, lang = "en") =>
  execute(
    categoryExpenseDB,
    "INSERT INTO categories_expense (name, lang) VALUES (?, ?)",
    [name, lang]
  ).then((res) => res.insertId);

export const updateExpenseCategory = (name, id) =>
  execute(categoryExpenseDB, "UPDATE categories_expense SET name = (?) WHERE id = (?)", [
    name,
    id,
  ]);

export const deleteExpenseCategory = (id) =>
  execute(categoryExpenseDB, "DELETE FROM categories_expense WHERE id = (?)", [id]);

// Income categories
const INCOME_CATEGORIES = {
  en: ["Salary", "Bonus", "OT", "Interest", "Other"],
  vi: ["Lương", "Thưởng", "Tăng ca", "Lãi suất", "Khác"],
};

export const initCategoryIncomeDB = () =>
  createNamedTable(categoryIncomeDB, "categories_income", INCOME_CATEGORIES);

export const fetchCategoryIncomeDB = (lang = "en") =>
  execute(
    categoryIncomeDB,
    "SELECT * FROM categories_income WHERE lang = ? ORDER BY id DESC",
    [lang]
  ).then(toNamedRows);

export const deleteCategoryIncomeDB = (id) =>
  execute(categoryIncomeDB, "DELETE FROM categories_income WHERE id = (?)", [id]);

export const addIncomeCategory = (name, lang = "en") =>
  execute(
    categoryIncomeDB,
    "INSERT INTO categories_income (name, lang) VALUES (?, ?)",
    [name, lang]
  ).then((res) => res.insertId);

export const updateIncomeCategory = (name, id) =>
  execute(categoryIncomeDB, "UPDATE categories_income SET name = (?) WHERE id = (?)", [
    name,
    id,
  ]);

// Accounts
const ACCOUNTS = {
  en: ["Cash", "Accounts", "Card", "Other"],
  vi: ["Tiền mặt", "Tài khoản", "Thẻ", "Khác"],
};

export const initAccountDB = () =>
  createNamedTable(accountDB, "accounts", ACCOUNTS);

export const fetchAccountDB = (lang = "en") =>
  execute(accountDB, "SELECT * FROM accounts WHERE lang = ? ORDER BY id DESC", [
    lang,
  ]).then(toNamedRows);

export const deleteAccountDB = (id) =>
  execute(accountDB, "DELETE FROM accounts WHERE id = (?)", [id]);

export const addAccountDB = (name, lang = "en") =>
  execute(accountDB, "INSERT INTO accounts (name, lang) VALUES (?, ?)", [
    name,
    lang,
  ]).then((res) => res.insertId);

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
