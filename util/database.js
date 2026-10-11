import * as SQLite from "expo-sqlite";

import {
  ACCOUNTS,
  EXPENSE_CATEGORIES,
  INCOME_CATEGORIES,
} from "../constants/seedNames";

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
  result.rows._array.map((row) => ({
    name: row.name,
    id: row.id,
    icon: row.icon || null,
  }));

// Language tag meaning "show in every language".
//
// The seeded defaults are translated, so they are stored per language ("Cash"
// vs "Tiền mặt"). Anything the USER types has no translation, so scoping it to
// a language made it disappear the moment they switched — it was still in the
// table, just filtered out by `WHERE lang = ?`. User rows carry this sentinel
// instead. NULL cannot be used: the column is NOT NULL.
export const ALL_LANGS = "*";

// Reads must not overtake the migrations.
//
// init*() is fire-and-forget from App.js while screens fetch on mount, so a
// SELECT could win the race and hand the UI pre-migration rows — the table was
// already fixed up, but nothing re-read it. Every fetch now waits on this gate.
let markReady;
export const dbReady = new Promise((resolve) => {
  markReady = resolve;
  // Safety net: a missing initDatabases() call must never hang every read.
  setTimeout(resolve, 5000);
});

// Adds the `lang` column to legacy tables that pre-date i18n. Errors are
// swallowed because re-running on a table that already has the column throws.
const ensureLangColumn = (db, table) =>
  execute(
    db,
    `ALTER TABLE ${table} ADD COLUMN lang TEXT NOT NULL DEFAULT 'en'`
  ).catch(() => {});

// Inserts default rows tagged with the given language. Idempotent thanks to
// INSERT OR IGNORE on the UNIQUE(name) constraint.
// Adds the `icon` column to tables created before icons were selectable.
// Like ensureLangColumn, re-running on a table that already has it throws, so
// the error is swallowed.
const ensureIconColumn = (db, table) =>
  execute(db, `ALTER TABLE ${table} ADD COLUMN icon TEXT`).catch(() => {});

// Recovers rows the user created before ALL_LANGS existed: anything whose name
// is not one of the seeded defaults was typed by the user, so it is promoted to
// "every language" and becomes visible again. Idempotent and non-destructive —
// it only ever rewrites the `lang` tag, never names, icons or ids.
const promoteUserRows = (db, table, seedsByLang) => {
  const seeded = Object.values(seedsByLang).flat();
  const placeholders = seeded.map(() => "?").join(", ");
  return execute(
    db,
    `UPDATE ${table} SET lang = ?
     WHERE lang <> ? AND name NOT IN (${placeholders})`,
    [ALL_LANGS, ALL_LANGS, ...seeded]
  ).catch((err) => console.error(err));
};

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
    .then(() => ensureIconColumn(db, table))
    .then(() => promoteUserRows(db, table, seedsByLang))
    .then(() =>
      Promise.all(
        Object.entries(seedsByLang).map(([lang, names]) =>
          seed(db, table, names, lang).catch((err) => console.error(err))
        )
      )
    );

export const initCategoryExpense = () =>
  createNamedTable(categoryExpenseDB, "categories_expense", EXPENSE_CATEGORIES);

export const fetchCategoriesExpenseDB = (lang = "en") =>
  dbReady.then(() =>
  execute(
    categoryExpenseDB,
    "SELECT * FROM categories_expense WHERE lang IN (?, ?) ORDER BY id DESC",
    [lang, ALL_LANGS]
  ).then(toNamedRows));

// `lang` is accepted for call-site symmetry but deliberately not stored: a
// category the user typed shows in every language (see ALL_LANGS).
export const addExpenseCategory = (name, lang = "en", icon = null) =>
  execute(
    categoryExpenseDB,
    "INSERT INTO categories_expense (name, lang, icon) VALUES (?, ?, ?)",
    [name, ALL_LANGS, icon]
  ).then((res) => res.insertId);

export const updateExpenseCategory = (name, id, icon = null) =>
  execute(
    categoryExpenseDB,
    "UPDATE categories_expense SET name = (?), icon = (?) WHERE id = (?)",
    [name, icon, id]
  );

export const deleteExpenseCategory = (id) =>
  execute(categoryExpenseDB, "DELETE FROM categories_expense WHERE id = (?)", [id]);

export const initCategoryIncomeDB = () =>
  createNamedTable(categoryIncomeDB, "categories_income", INCOME_CATEGORIES);

export const fetchCategoryIncomeDB = (lang = "en") =>
  dbReady.then(() =>
  execute(
    categoryIncomeDB,
    "SELECT * FROM categories_income WHERE lang IN (?, ?) ORDER BY id DESC",
    [lang, ALL_LANGS]
  ).then(toNamedRows));

export const deleteCategoryIncomeDB = (id) =>
  execute(categoryIncomeDB, "DELETE FROM categories_income WHERE id = (?)", [id]);

// `lang` is accepted for call-site symmetry but deliberately not stored: a
// category the user typed shows in every language (see ALL_LANGS).
export const addIncomeCategory = (name, lang = "en", icon = null) =>
  execute(
    categoryIncomeDB,
    "INSERT INTO categories_income (name, lang, icon) VALUES (?, ?, ?)",
    [name, ALL_LANGS, icon]
  ).then((res) => res.insertId);

export const updateIncomeCategory = (name, id, icon = null) =>
  execute(
    categoryIncomeDB,
    "UPDATE categories_income SET name = (?), icon = (?) WHERE id = (?)",
    [name, icon, id]
  );

export const initAccountDB = () =>
  createNamedTable(accountDB, "accounts", ACCOUNTS);

export const fetchAccountDB = (lang = "en") =>
  dbReady.then(() =>
    execute(
      accountDB,
      "SELECT * FROM accounts WHERE lang IN (?, ?) ORDER BY id DESC",
      [lang, ALL_LANGS]
    ).then(toNamedRows)
  );

// Brings an account name used by transactions back into the account list.
//
// Two cases, both reachable from the "not in your account list" row:
//   • the name exists but is tagged with the other language (a seeded default)
//     -> promote it to ALL_LANGS so it shows either way
//   • the name has no row at all (the account was deleted while its
//     transactions kept referencing it by name) -> insert it
//
// Done as update-then-insert because `name` is UNIQUE across the whole table,
// so a blind insert would fail on the first case.
export const restoreAccountDB = (name, icon = null) =>
  dbReady
    .then(() =>
      execute(accountDB, "UPDATE accounts SET lang = ? WHERE name = ?", [
        ALL_LANGS,
        name,
      ])
    )
    .then((res) =>
      res.rowsAffected > 0
        ? null
        : execute(
            accountDB,
            "INSERT INTO accounts (name, lang, icon) VALUES (?, ?, ?)",
            [name, ALL_LANGS, icon]
          )
    );

export const deleteAccountDB = (id) =>
  execute(accountDB, "DELETE FROM accounts WHERE id = (?)", [id]);

// As above: user-created accounts are not language-scoped.
export const addAccountDB = (name, lang = "en", icon = null) =>
  execute(accountDB, "INSERT INTO accounts (name, lang, icon) VALUES (?, ?, ?)", [
    name,
    ALL_LANGS,
    icon,
  ]).then((res) => res.insertId);

export const updateAccountDB = (name, id, icon = null) =>
  execute(accountDB, "UPDATE accounts SET name = (?), icon = (?) WHERE id = (?)", [
    name,
    icon,
    id,
  ]);

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

// ---------------------------------------------------------------------------
// Budgets (F12) — a spending limit per category for a repeating period.
// ---------------------------------------------------------------------------
// `threshold` is the percentage at which the user wants to be warned (70/90/100).
// UNIQUE(category, period) keeps one budget per category per period type, so
// re-adding the same pair updates rather than silently duplicating.

const budgetDB = SQLite.openDatabase("budgets.db");

const toBudgetRows = (result) =>
  result.rows._array.map((row) => ({
    id: row.id,
    category: row.category,
    amount: Number(row.amount),
    period: row.period,
    threshold: Number(row.threshold),
  }));

export const initBudgetDB = () =>
  execute(
    budgetDB,
    `CREATE TABLE IF NOT EXISTS budgets (
      id INTEGER PRIMARY KEY NOT NULL,
      category TEXT NOT NULL,
      amount REAL NOT NULL,
      period TEXT NOT NULL DEFAULT 'monthly',
      threshold INTEGER NOT NULL DEFAULT 80,
      UNIQUE(category, period)
    )`
  );

export const fetchBudgetsDB = () =>
  execute(budgetDB, "SELECT * FROM budgets ORDER BY id DESC").then(toBudgetRows);

export const addBudgetDB = (category, amount, period, threshold) =>
  execute(
    budgetDB,
    "INSERT INTO budgets (category, amount, period, threshold) VALUES (?, ?, ?, ?)",
    [category, amount, period, threshold]
  ).then((res) => res.insertId);

export const updateBudgetDB = (id, category, amount, period, threshold) =>
  execute(
    budgetDB,
    "UPDATE budgets SET category = (?), amount = (?), period = (?), threshold = (?) WHERE id = (?)",
    [category, amount, period, threshold, id]
  );

export const deleteBudgetDB = (id) =>
  execute(budgetDB, "DELETE FROM budgets WHERE id = (?)", [id]);

// ---------------------------------------------------------------------------
// Savings goals (F14) — a target amount the user puts money aside towards.
// ---------------------------------------------------------------------------
// `saved` is updated by deposits rather than kept as a ledger of its own: the
// goal only ever needs its running total, and a separate deposits table would
// have to be reconciled with the expense list to mean anything.

const goalDB = SQLite.openDatabase("goals.db");

const toGoalRows = (result) =>
  result.rows._array.map((row) => ({
    id: row.id,
    name: row.name,
    target: Number(row.target),
    saved: Number(row.saved),
    deadline: row.deadline || null,
    createdAt: row.createdAt,
  }));

export const initGoalDB = () =>
  execute(
    goalDB,
    `CREATE TABLE IF NOT EXISTS goals (
      id INTEGER PRIMARY KEY NOT NULL,
      name TEXT NOT NULL,
      target REAL NOT NULL,
      saved REAL NOT NULL DEFAULT 0,
      deadline TEXT,
      createdAt TEXT NOT NULL
    )`
  );

export const fetchGoalsDB = () =>
  execute(goalDB, "SELECT * FROM goals ORDER BY id DESC").then(toGoalRows);

export const addGoalDB = (name, target, deadline) =>
  execute(
    goalDB,
    "INSERT INTO goals (name, target, saved, deadline, createdAt) VALUES (?, ?, 0, ?, ?)",
    [name, target, deadline || null, new Date().toISOString()]
  ).then((res) => res.insertId);

export const updateGoalDB = (id, name, target, deadline) =>
  execute(
    goalDB,
    "UPDATE goals SET name = (?), target = (?), deadline = (?) WHERE id = (?)",
    [name, target, deadline || null, id]
  );

// Deposits clamp at zero so a withdrawal can never drive the goal negative.
export const depositGoalDB = (id, delta) =>
  execute(goalDB, "UPDATE goals SET saved = MAX(0, saved + (?)) WHERE id = (?)", [
    delta,
    id,
  ]);

export const deleteGoalDB = (id) =>
  execute(goalDB, "DELETE FROM goals WHERE id = (?)", [id]);


// ---------------------------------------------------------------------------
// Startup
// ---------------------------------------------------------------------------

// Runs every table's create + migration step, then releases `dbReady` so the
// screens' fetches can proceed against the migrated tables.
export const initDatabases = () =>
  Promise.all([
    initCategoryIncomeDB(),
    initCategoryExpense(),
    initAccountDB(),
    initTodo(),
    initBudgetDB(),
    initGoalDB(),
  ])
    .catch((err) => console.error("DB init failed:", err))
    .finally(() => {
      markReady();
      if (__DEV__) logAccountState();
    });

// Dev-only: prints what is actually stored, so a "my item disappeared" report
// can be checked against the table instead of guessed at.
const logAccountState = () =>
  execute(accountDB, "SELECT id, name, lang, icon FROM accounts ORDER BY id")
    .then((res) =>
      console.log(
        "[accounts]",
        res.rows._array
          .map((r) => `${r.id}:${r.name}[${r.lang}]${r.icon ? " " + r.icon : ""}`)
          .join("  ")
      )
    )
    .catch((err) => console.error("account dump failed:", err));
