// Currency presets for the "đơn vị tiền tệ" setting.
//
// This is a DISPLAY preference only: changing it re-formats the figures, it
// never converts them. Amounts are stored as plain numbers with no currency
// tag, and the app has no exchange-rate source — so converting would either
// need a rates API or would silently corrupt historical records. Switching
// from VND to USD shows the same number with a different symbol.
//
// Formatting is done by hand rather than with Intl.NumberFormat: Hermes ships
// limited ICU locale data, so Intl grouping/symbols are not dependable here.
export const CURRENCIES = {
  VND: {
    code: "VND",
    symbol: "₫",
    position: "suffix",
    decimals: 0,
    group: ".",
    decimal: ",",
    label: "Việt Nam Đồng",
  },
  USD: {
    code: "USD",
    symbol: "$",
    position: "prefix",
    decimals: 2,
    group: ",",
    decimal: ".",
    label: "US Dollar",
  },
  EUR: {
    code: "EUR",
    symbol: "€",
    position: "suffix",
    decimals: 2,
    group: ".",
    decimal: ",",
    label: "Euro",
  },
  JPY: {
    code: "JPY",
    symbol: "¥",
    position: "prefix",
    decimals: 0,
    group: ",",
    decimal: ".",
    label: "Japanese Yen",
  },
  KRW: {
    code: "KRW",
    symbol: "₩",
    position: "prefix",
    decimals: 0,
    group: ",",
    decimal: ".",
    label: "Korean Won",
  },
  GBP: {
    code: "GBP",
    symbol: "£",
    position: "prefix",
    decimals: 2,
    group: ",",
    decimal: ".",
    label: "British Pound",
  },
};

export const CURRENCY_CODES = Object.keys(CURRENCIES);

export const DEFAULT_CURRENCY = "VND";

export const getCurrency = (code) =>
  CURRENCIES[code] || CURRENCIES[DEFAULT_CURRENCY];
