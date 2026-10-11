import { useCallback, useMemo } from "react";

import { useCurrency } from "../store/currencyContext";
import { formatMoney, formatSigned } from "../util/format";

// Formatters bound to the currency chosen in Settings. Every money figure on
// screen should come from here so one setting change updates the whole app.
//
//   const { money, signed, symbol } = useMoney();
//   money(45000)   -> "45.000 ₫"   (VND)   /  "$45,000.00" (USD)
//   signed(-45000) -> "−45.000 ₫"
export default function useMoney() {
  const { currency, code } = useCurrency();

  const money = useCallback(
    (amount, options) => formatMoney(amount, { ...options, currency }),
    [currency]
  );

  const signed = useCallback(
    (amount, options) => formatSigned(amount, { ...options, currency }),
    [currency]
  );

  // For balances: shows "−" when the figure is negative, but no "+" when it is
  // positive — a wallet holding 592.000 should not read "+592.000". Without
  // this, `money()` strips the sign and an overdrawn account was told apart
  // only by its colour (WCAG 1.4.1).
  const balance = useCallback(
    (amount, options) => {
      const n = Number(amount) || 0;
      return (n < 0 ? "−" : "") + formatMoney(n, { ...options, currency });
    },
    [currency]
  );

  return useMemo(
    () => ({ money, signed, balance, symbol: currency.symbol, currency, code }),
    [money, signed, balance, currency, code]
  );
}
