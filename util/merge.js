import { normalizeName } from "./tools";

// Decides what one account's lists look like when two devices disagree.
//
// The first version of sync let whichever side had synced first win outright:
// the device uploaded if the account had never synced, and was overwritten if
// it had. That loses data in the ordinary case — signing in on a new phone
// uploads its empty plan, and the next sync from the old phone then wipes the
// budgets and goals that only ever existed there.
//
// So both sides are kept. A row is matched by what the user would call the
// same thing (its name, not its id), and a deletion travels as a tombstone
// rather than as an absence, because an absence is also what a device that
// has never seen the row looks like.

const TOMBSTONE_OF = {
  categories_expense: "categories_expense_removed",
  categories_income: "categories_income_removed",
  accounts: "accounts_removed",
};

// Ids are per device — SQLite hands out its own — so the same wallet is id 3
// here and id 7 there. Identity is the name instead, compared the way the rest
// of the app compares names (diacritics and case folded).
const KEY = {
  budgets: (row) => `${normalizeName(row.category)}|${row.period || "monthly"}`,
};

const keyOf = (table, row) =>
  (KEY[table] || ((r) => normalizeName(r.name)))(row);

const rowsOf = (value) =>
  Array.isArray(value)
    ? value.filter((row) => row && typeof row === "object")
    : [];

// On overlap the account's copy wins, so an icon or amount edited on another
// device arrives here. A goal's `saved` is the exception: it only ever grows,
// and taking the larger figure means a deposit made on either device survives
// instead of being rounded back down.
const resolve = (table, mine, theirs) =>
  table === "goals"
    ? {
        ...theirs,
        saved: Math.max(Number(mine.saved) || 0, Number(theirs.saved) || 0),
      }
    : theirs;

export const mergeRows = (table, local, remote) => {
  const merged = new Map();
  for (const row of rowsOf(local)) merged.set(keyOf(table, row), row);
  for (const row of rowsOf(remote)) {
    const key = keyOf(table, row);
    const mine = merged.get(key);
    merged.set(key, mine ? resolve(table, mine, row) : row);
  }
  return [...merged.values()];
};

// Two different rows that happen to share an id would overwrite each other on
// insert, so the merged set is renumbered — in an order both devices compute
// identically from the rows themselves, or they would push conflicting
// numbering back and forth forever.
const renumber = (table, rows) => {
  const sorted = [...rows].sort((a, b) => {
    const byPosition = (Number(a.position) || 0) - (Number(b.position) || 0);
    if (byPosition) return byPosition;
    const byId = (Number(a.id) || 0) - (Number(b.id) || 0);
    if (byId) return byId;
    return keyOf(table, a) < keyOf(table, b) ? -1 : 1;
  });

  return sorted.map((row, index) => ({
    ...row,
    ...("id" in row ? { id: index + 1 } : null),
    // Only the drag-ordered lists carry one; leaving it off elsewhere keeps
    // the row the shape its table expects.
    ...(row.position === undefined ? null : { position: index + 1 }),
  }));
};

export const mergeSnapshot = (local = {}, remote = {}) => {
  const tables = [
    ...new Set([...Object.keys(local), ...Object.keys(remote)]),
  ];
  const merged = {};
  for (const table of tables) {
    merged[table] = mergeRows(table, local[table], remote[table]);
  }

  // A name in the merged tombstones was deleted on one device and not put
  // back there — every add clears its own tombstone first. Dropping it from
  // the list is what makes a delete stick: otherwise the other device hands
  // the row straight back and the deletion looks like it failed.
  for (const [table, grave] of Object.entries(TOMBSTONE_OF)) {
    if (!merged[table] || !merged[grave]) continue;
    const gone = new Set(merged[grave].map((row) => normalizeName(row.name)));
    merged[table] = merged[table].filter(
      (row) => !gone.has(normalizeName(row.name))
    );
  }

  for (const table of tables) merged[table] = renumber(table, merged[table]);
  return merged;
};

// Whether a merge actually changes this device. Ids are left out: they are
// renumbered on every sync by design, and treating that as a change would
// make each sync look like news and send every screen back to the database.
export const fingerprint = (table, rows) =>
  JSON.stringify(
    [...rowsOf(rows)]
      .map(({ id, ...rest }) => rest)
      .sort((a, b) => (keyOf(table, a) < keyOf(table, b) ? -1 : 1))
  );
