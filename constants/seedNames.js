import { normalizeName } from "../util/tools";

// Default category / account names, one list per language.
//
// The lists are POSITIONALLY ALIGNED: en[i] and vi[i] are the same thing in two
// languages ("Cash" ↔ "Tiền mặt"). That alignment is what lets a transaction
// recorded under one language be shown under the other's label, so the defaults
// stay a single wallet rather than turning into two.
//
// Keep every language's list the same length and in the same order.

export const EXPENSE_CATEGORIES = {
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

export const INCOME_CATEGORIES = {
  en: ["Salary", "Bonus", "OT", "Interest", "Other"],
  vi: ["Lương", "Thưởng", "Tăng ca", "Lãi suất", "Khác"],
};

export const ACCOUNTS = {
  en: ["Cash", "Accounts", "Card", "Other"],
  vi: ["Tiền mặt", "Tài khoản", "Thẻ", "Khác"],
};

// Builds `(name, lang) => equivalent name in that language`, or null when the
// name is not a seeded default (i.e. the user typed it, so it has no
// translation and must be left exactly as written).
export const makeSeedTranslator = (seedsByLang) => {
  const positionOf = new Map();

  for (const names of Object.values(seedsByLang)) {
    names.forEach((name, index) => {
      const key = normalizeName(name);
      if (key) positionOf.set(key, index);
    });
  }

  return (name, lang) => {
    const index = positionOf.get(normalizeName(name));
    if (index === undefined) return null;
    return seedsByLang[lang]?.[index] ?? null;
  };
};

// Builds `(name) => key` that is the SAME for a default regardless of which
// language it was recorded in, without needing to know the current language.
//
// Use this for matching (does this transaction belong to this budget?), and
// the translator above for display (what label do we print?).
export const makeSeedKeyer = (seedsByLang) => {
  const positionOf = new Map();

  for (const names of Object.values(seedsByLang)) {
    names.forEach((name, index) => {
      const key = normalizeName(name);
      if (key) positionOf.set(key, index);
    });
  }

  return (name) => {
    const key = normalizeName(name);
    const index = positionOf.get(key);
    // A user-created name is its own key; a default collapses to its position,
    // so "Food" and "Ăn uống" compare equal.
    return index === undefined ? key : `seed:${index}`;
  };
};

export const translateAccountName = makeSeedTranslator(ACCOUNTS);
export const translateExpenseCategory = makeSeedTranslator(EXPENSE_CATEGORIES);
export const translateIncomeCategory = makeSeedTranslator(INCOME_CATEGORIES);

export const expenseCategoryKey = makeSeedKeyer(EXPENSE_CATEGORIES);
