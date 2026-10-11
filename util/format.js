export const formatAmount = (amount) => {
  if(amount) {
    return amount.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  }
  return 0;
};

export const formatInput = (e) => {
  let result;
    let input = e.replace(/\./g, '');
    input = input.replace(/\D/g, '')
    if (input.length > 3) {
      let formattedInput = input.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
      result = formattedInput;
  } else {
    result = input;
  };
  return result;
}

// Currency display rules from the design system:
//  - grouped thousands, the symbol placed per the active currency
//  - negatives use the minus sign `−`, never parentheses (too easy to misread)
//  - the sign is always paired with a text label elsewhere in the row, so the
//    expense/income distinction is never carried by colour alone (WCAG 1.4.1)
//
// Prefer the `useMoney()` hook in components — it binds these to the currency
// the user picked in Settings. These raw functions default to VND so modules
// without React context (and older call sites) still format sensibly.
export const CURRENCY_SYMBOL = "₫";

const groupDigits = (digits, separator) =>
  digits.replace(/\B(?=(\d{3})+(?!\d))/g, separator);

export const formatMoney = (amount, options = {}) => {
  const { symbol = true, currency } = options;
  const c = currency || {
    symbol: CURRENCY_SYMBOL,
    position: "suffix",
    decimals: 0,
    group: ".",
    decimal: ",",
  };

  const n = Math.abs(Number(amount) || 0);
  const fixed = n.toFixed(c.decimals);
  const [whole, fraction] = fixed.split(".");
  let out = groupDigits(whole, c.group);
  if (fraction) out += c.decimal + fraction;

  if (!symbol) return out;
  return c.position === "prefix" ? `${c.symbol}${out}` : `${out} ${c.symbol}`;
};

export const formatSigned = (amount, options) => {
  const n = Number(amount) || 0;
  const sign = n < 0 ? "−" : "+";
  return `${sign}${formatMoney(n, options)}`;
};

export const checkFormat = (data) => {
  if(data >= 10) {
    return data
  } else {
    return `0${data}`
  }
}
