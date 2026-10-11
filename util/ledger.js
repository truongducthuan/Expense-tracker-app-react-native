import { normalizeName } from "./tools";
import { translateAccountName } from "../constants/seedNames";

// Per-account ledger over every transaction.
//
//   income    credits  `account`
//   expense   debits   `account`
//   transfer  credits  `account` and debits `category` (the source wallet)
//
// Because a transfer touches both sides, the ledger always sums to
// Σincome − Σexpense — the same figure the balance card shows.
//
// `lang` relabels the seeded defaults: a row recorded as "Tiền mặt" folds into
// "Cash" when reading in English, because they are the same wallet with two
// labels. Names the user typed have no translation and are left untouched.
export const buildAccountLedger = (transactions = [], lang) => {
  const map = new Map(); // normalised name -> { label, amount }

  const canonical = (name) =>
    (lang && translateAccountName(name, lang)) || name;

  const apply = (rawName, delta) => {
    const name = canonical(rawName);
    const key = normalizeName(name);
    if (!key) return;
    const entry = map.get(key) || { label: name, amount: 0 };
    entry.amount += delta;
    map.set(key, entry);
  };

  for (const item of transactions) {
    const amount = Number(item.amount || 0);
    if (!amount) continue;

    if (item.type === "income") apply(item.account, amount);
    else if (item.type === "expense") apply(item.account, -amount);
    else if (item.type === "transfer") {
      apply(item.account, amount);
      apply(item.category, -amount);
    }
  }

  return map;
};

// Joins the ledger to the account list shown in the UI.
//
// Account names are stored on each transaction as free text. Seeded defaults
// are translated first (see buildAccountLedger), so money recorded under the
// other language's label lands on the right row instead of looking like a
// stray wallet.
//
// What is left in `unlisted` is therefore only ever a name the USER created
// that no longer has a row — typically an account deleted while its
// transactions kept referencing it. Those are the only ones worth offering to
// restore; a seeded default must never be offered, or the list would end up
// showing both labels of the same wallet.
//
// `total` is the sum of what is actually displayed, so the rows and the total
// can never disagree.
export const buildAccountBalances = (
  accounts = [],
  transactions = [],
  lang
) => {
  const ledger = buildAccountLedger(transactions, lang);
  const claimed = new Set();

  const rows = accounts.map((account) => {
    const key = normalizeName(account.name);
    claimed.add(key);
    return {
      id: account.id,
      name: account.name,
      icon: account.icon || null,
      amount: ledger.get(key)?.amount || 0,
    };
  });

  const leftovers = [...ledger.entries()]
    .filter(([key]) => !claimed.has(key))
    .map(([, entry]) => entry)
    .filter((entry) => entry.amount !== 0)
    .sort((a, b) => Math.abs(b.amount) - Math.abs(a.amount));

  const unlistedTotal = leftovers.reduce((sum, e) => sum + e.amount, 0);

  return {
    rows,
    unlisted: leftovers,
    unlistedTotal,
    total:
      rows.reduce((sum, r) => sum + r.amount, 0) + unlistedTotal,
  };
};
