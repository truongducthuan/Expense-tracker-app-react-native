import { normalizeName } from "./tools";

// Finds the transactions that still refer to an account or category by name.
//
// Names are stored on each transaction as plain text, not as a foreign key, so
// deleting the row in the list leaves those references behind. Knowing which
// ones are affected is what lets the UI say "3 transactions use this wallet"
// before anything is removed, and move them somewhere else afterwards.
//
// Transfers are the awkward case: `account` is the destination wallet and
// `category` is the SOURCE wallet, so an account can be referenced by either
// field and both have to be checked and patched.
export const findAccountUsage = (expenses = [], accountName) => {
  const target = normalizeName(accountName);
  if (!target) return [];

  const hits = [];
  for (const item of expenses) {
    const fields = [];
    if (normalizeName(item.account) === target) fields.push("account");
    // Only a transfer puts an account name in `category`.
    if (item.type === "transfer" && normalizeName(item.category) === target) {
      fields.push("category");
    }
    if (fields.length) hits.push({ id: item.id, fields, item });
  }
  return hits;
};

// Categories only ever live in the `category` field, and never on a transfer
// (where that field holds the source wallet instead).
export const findCategoryUsage = (expenses = [], categoryName, type) => {
  const target = normalizeName(categoryName);
  if (!target) return [];

  return expenses
    .filter(
      (item) =>
        item.type !== "transfer" &&
        (!type || item.type === type) &&
        normalizeName(item.category) === target
    )
    .map((item) => ({ id: item.id, fields: ["category"], item }));
};
