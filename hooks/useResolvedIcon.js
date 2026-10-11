import { useMemo } from "react";

import { CategoryStore } from "../store/categoryContext";
import { CategoryIncomeStore } from "../store/incomeCategory";
import { AccountStore } from "../store/accountContext";
import { normalizeName } from "../util/tools";

// Module-level memo keyed by the three store arrays' identities.
//
// The hook runs once per avatar, and a transaction list renders dozens of
// them; building the lookup inside each one would be O(rows × items) on every
// render. The store arrays are only replaced when their data actually changes,
// so comparing references is enough to rebuild exactly when needed.
let cache = { deps: null, map: null };

const buildLookup = (categories, categoriesIncome, accounts) => {
  const map = new Map();
  for (const list of [categories, categoriesIncome, accounts]) {
    for (const item of list || []) {
      if (!item?.icon) continue;
      const key = normalizeName(item.name);
      if (key && !map.has(key)) map.set(key, item.icon);
    }
  }
  return map;
};

const getLookup = (categories, categoriesIncome, accounts) => {
  const deps = cache.deps;
  if (
    deps &&
    deps[0] === categories &&
    deps[1] === categoriesIncome &&
    deps[2] === accounts
  ) {
    return cache.map;
  }
  const map = buildLookup(categories, categoriesIncome, accounts);
  cache = { deps: [categories, categoriesIncome, accounts], map };
  return map;
};

// Looks up the icon a user picked for a category or account.
//
// Transactions store the category and account as plain text, not as an id, so
// the icon has to be resolved by name. The three lists are merged into one
// lookup; a name present in more than one list keeps the first match, which is
// harmless because the icon is cosmetic.
export default function useResolvedIcon(name) {
  const { categories } = CategoryStore();
  const { categoriesIncome } = CategoryIncomeStore();
  const { accounts } = AccountStore();

  const lookup = getLookup(categories, categoriesIncome, accounts);

  return useMemo(() => {
    const key = normalizeName(name);
    return key ? lookup.get(key) || null : null;
  }, [lookup, name]);
}
