import * as SQLite from "expo-sqlite";

import {
  ACCOUNTS,
  EXPENSE_CATEGORIES,
  INCOME_CATEGORIES,
  translateAccountName,
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

// Adds the `position` column used for the user's own ordering.
const ensurePositionColumn = (db, table) =>
  execute(db, `ALTER TABLE ${table} ADD COLUMN position INTEGER`).catch(() => {});

// Gives rows that have never been ordered a position matching the order they
// are already displayed in, so turning the feature on does not shuffle anyone's
// list. Rows were shown oldest-first, which is `id` ascending.
const backfillPositions = (db, table) =>
  execute(
    db,
    `UPDATE ${table} SET position = id WHERE position IS NULL`
  ).catch((err) => console.error("position backfill failed:", err));

// Keeps the `lang` tag of every row consistent with what the row actually is.
// Runs on every start, in both directions, so the table is self-healing:
//
//   • a SEEDED default is forced back to its own language. An earlier build
//     wrongly offered "add back" on defaults, which tagged them ALL_LANGS and
//     made the list show both "Cash" and "Tiền mặt" — two labels for one
//     wallet. Preventing the button does not undo rows already tagged, so this
//     repairs them.
//   • anything NOT seeded was typed by the user, has no translation, and is
//     tagged ALL_LANGS so it shows whichever language is being read.
//
// Idempotent and non-destructive: only the `lang` column is ever written.
const reconcileLangTags = (db, table, seedsByLang) => {
  const seeded = Object.values(seedsByLang).flat();
  const allPlaceholders = seeded.map(() => "?").join(", ");

  // Defaults -> their own language.
  const perLanguage = Object.entries(seedsByLang).map(([lang, names]) => {
    const placeholders = names.map(() => "?").join(", ");
    return execute(
      db,
      `UPDATE ${table} SET lang = ?
       WHERE lang <> ? AND name IN (${placeholders})`,
      [lang, lang, ...names]
    );
  });

  // User-created rows -> every language.
  const userRows = execute(
    db,
    `UPDATE ${table} SET lang = ?
     WHERE lang <> ? AND name NOT IN (${allPlaceholders})`,
    [ALL_LANGS, ALL_LANGS, ...seeded]
  );

  return Promise.all([...perLanguage, userRows]).catch((err) =>
    console.error("lang reconcile failed:", err)
  );
};

// Seeded defaults are re-inserted on every start, so deleting one brought it
// straight back on the next launch — and at the bottom of the list, with a new
// id. This records the names the user removed deliberately so seeding can skip
// them. Kept per table, in the same database, so it travels with the data.
const ensureTombstones = (db, table) =>
  execute(
    db,
    `CREATE TABLE IF NOT EXISTS ${table}_removed (
      name TEXT PRIMARY KEY NOT NULL
    )`
  ).catch((err) => console.error("tombstone table failed:", err));

const rememberRemoved = (db, table, name) =>
  execute(db, `INSERT OR IGNORE INTO ${table}_removed (name) VALUES (?)`, [name]);

const forgetRemoved = (db, table, name) =>
  execute(db, `DELETE FROM ${table}_removed WHERE name = ?`, [name]);

// Deletes by id and records the name, so a seeded default stays deleted.
// Non-seeded names are never re-seeded, so recording them is harmless.
const deleteAndRemember = (db, table, id) =>
  execute(db, `SELECT name FROM ${table} WHERE id = ?`, [id])
    .then((res) => res.rows._array[0]?.name)
    .then((name) =>
      execute(db, `DELETE FROM ${table} WHERE id = (?)`, [id]).then(() =>
        name ? rememberRemoved(db, table, name) : null
      )
    );

const removedNames = (db, table) =>
  execute(db, `SELECT name FROM ${table}_removed`)
    .then((res) => res.rows._array.map((row) => row.name))
    .catch(() => []);

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
    .then(() => ensurePositionColumn(db, table))
    .then(() => reconcileLangTags(db, table, seedsByLang))
    .then(() => ensureTombstones(db, table))
    .then(() => removedNames(db, table))
    .then((removed) =>
      Promise.all(
        Object.entries(seedsByLang).map(([lang, names]) => {
          const keep = names.filter((n) => !removed.includes(n));
          if (!keep.length) return Promise.resolve();
          return seed(db, table, keep, lang).catch((err) => console.error(err));
        })
      )
    )
    // Freshly seeded rows arrive without one.
    .then(() => backfillPositions(db, table));

export const initCategoryExpense = () =>
  createNamedTable(categoryExpenseDB, "categories_expense", EXPENSE_CATEGORIES);

export const fetchCategoriesExpenseDB = (lang = "en") =>
  dbReady.then(() =>
  execute(
    categoryExpenseDB,
    "SELECT * FROM categories_expense WHERE lang IN (?, ?) ORDER BY position ASC, id ASC",
    [lang, ALL_LANGS]
  ).then(toNamedRows));

// `lang` is accepted for call-site symmetry but deliberately not stored: a
// category the user typed shows in every language (see ALL_LANGS).
export const addExpenseCategory = (name, lang = "en", icon = null) =>
  forgetRemoved(categoryExpenseDB, "categories_expense", name).then(() =>
  execute(
    categoryExpenseDB,
    `INSERT INTO categories_expense (name, lang, icon, position)
       VALUES (?, ?, ?, (SELECT IFNULL(MAX(position), 0) + 1 FROM categories_expense))`,
    [name, ALL_LANGS, icon]
  )).then((res) => res.insertId);

export const updateExpenseCategory = (name, id, icon = null) =>
  execute(
    categoryExpenseDB,
    "UPDATE categories_expense SET name = (?), icon = (?) WHERE id = (?)",
    [name, icon, id]
  );

export const deleteExpenseCategory = (id) =>
  deleteAndRemember(categoryExpenseDB, "categories_expense", id);

export const initCategoryIncomeDB = () =>
  createNamedTable(categoryIncomeDB, "categories_income", INCOME_CATEGORIES);

export const fetchCategoryIncomeDB = (lang = "en") =>
  dbReady.then(() =>
  execute(
    categoryIncomeDB,
    "SELECT * FROM categories_income WHERE lang IN (?, ?) ORDER BY position ASC, id ASC",
    [lang, ALL_LANGS]
  ).then(toNamedRows));

export const deleteCategoryIncomeDB = (id) =>
  deleteAndRemember(categoryIncomeDB, "categories_income", id);

// `lang` is accepted for call-site symmetry but deliberately not stored: a
// category the user typed shows in every language (see ALL_LANGS).
export const addIncomeCategory = (name, lang = "en", icon = null) =>
  forgetRemoved(categoryIncomeDB, "categories_income", name).then(() =>
  execute(
    categoryIncomeDB,
    `INSERT INTO categories_income (name, lang, icon, position)
       VALUES (?, ?, ?, (SELECT IFNULL(MAX(position), 0) + 1 FROM categories_income))`,
    [name, ALL_LANGS, icon]
  )).then((res) => res.insertId);

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
      "SELECT * FROM accounts WHERE lang IN (?, ?) ORDER BY position ASC, id ASC",
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
    .then(() => {
      // A seeded default must never become language-agnostic: it already has a
      // translation, and tagging it ALL_LANGS is exactly what put both "Cash"
      // and "Tiền mặt" in the same list. The UI no longer offers it, and this
      // refuses it outright so no future call can reintroduce the problem.
      if (translateAccountName(name, "en")) {
        return Promise.reject(
          new Error(`"${name}" is a default account and cannot be restored`)
        );
      }
      return forgetRemoved(accountDB, "accounts", name).then(() =>
        execute(accountDB, "UPDATE accounts SET lang = ? WHERE name = ?", [
          ALL_LANGS,
          name,
        ])
      );
    })
    .then((res) =>
      res.rowsAffected > 0
        ? null
        : execute(
            accountDB,
            `INSERT INTO accounts (name, lang, icon, position)
       VALUES (?, ?, ?, (SELECT IFNULL(MAX(position), 0) + 1 FROM accounts))`,
            [name, ALL_LANGS, icon]
          )
    );

export const deleteAccountDB = (id) =>
  deleteAndRemember(accountDB, "accounts", id);

// As above: user-created accounts are not language-scoped.
export const addAccountDB = (name, lang = "en", icon = null) =>
  forgetRemoved(accountDB, "accounts", name).then(() =>
  execute(accountDB, `INSERT INTO accounts (name, lang, icon, position)
       VALUES (?, ?, ?, (SELECT IFNULL(MAX(position), 0) + 1 FROM accounts))`, [
    name,
    ALL_LANGS,
    icon,
  ])).then((res) => res.insertId);

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
    account: row.account || null,
  }));

// Links a goal to a wallet. Existing goals keep `account` NULL and go on
// working off manual deposits, so nothing breaks on upgrade.
const ensureGoalAccountColumn = () =>
  execute(goalDB, "ALTER TABLE goals ADD COLUMN account TEXT").catch(() => {});

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
  ).then(ensureGoalAccountColumn);

export const fetchGoalsDB = () =>
  execute(goalDB, "SELECT * FROM goals ORDER BY id DESC").then(toGoalRows);

export const addGoalDB = (name, target, deadline, account = null) =>
  execute(
    goalDB,
    `INSERT INTO goals (name, target, saved, deadline, createdAt, account)
     VALUES (?, ?, 0, ?, ?, ?)`,
    [name, target, deadline || null, new Date().toISOString(), account]
  ).then((res) => res.insertId);

export const updateGoalDB = (id, name, target, deadline, account = null) =>
  execute(
    goalDB,
    `UPDATE goals SET name = (?), target = (?), deadline = (?), account = (?)
     WHERE id = (?)`,
    [name, target, deadline || null, account, id]
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
// Ordering
// ---------------------------------------------------------------------------

// Writes the user's chosen order. `orderedIds` is the list exactly as shown,
// so every visible row gets a fresh 0..n-1 position and the sequence can never
// drift or collide.
const reorderRows = (db, table, orderedIds = []) =>
  dbReady.then(() =>
    Promise.all(
      orderedIds.map((id, index) =>
        execute(db, `UPDATE ${table} SET position = ? WHERE id = ?`, [index, id])
      )
    )
  );

export const reorderExpenseCategories = (ids) =>
  reorderRows(categoryExpenseDB, "categories_expense", ids);

export const reorderIncomeCategories = (ids) =>
  reorderRows(categoryIncomeDB, "categories_income", ids);

export const reorderAccounts = (ids) =>
  reorderRows(accountDB, "accounts", ids);

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
