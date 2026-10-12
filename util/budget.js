import { filterByPeriod } from "./date";
import { getStatusLevel } from "../constants/styles";
import { expenseCategoryKey } from "../constants/seedNames";

// Days left in the budget's current period, used to turn "80% used" into
// something actionable like "600K left across 23 days".
export const daysLeftInPeriod = (period, now = new Date()) => {
  const end = new Date(now);
  if (period === "weekly") {
    // Week runs Monday..Sunday, matching getStartOfWeek in util/date.
    const day = now.getDay();
    const toSunday = day === 0 ? 0 : 7 - day;
    end.setDate(now.getDate() + toSunday);
  } else if (period === "yearly") {
    end.setMonth(11, 31);
  } else {
    end.setMonth(now.getMonth() + 1, 0);
  }
  end.setHours(23, 59, 59, 999);
  return Math.max(1, Math.ceil((end - now) / 86400000));
};

// The period value filterByPeriod expects alongside the period name.
const currentPeriodValue = (period, now = new Date()) => {
  if (period === "monthly") return now.getMonth() + 1;
  if (period === "yearly") return now.getFullYear();
  return 0; // weekly ignores the value and uses the current week
};

// Joins a budget to what has actually been spent against it this period.
//
// Only `expense` rows count: income and transfers are not spending, and
// counting them would make a budget look blown by a salary deposit.
export const computeBudgetProgress = (budget, expenses, now = new Date()) => {
  const inPeriod = filterByPeriod(
    expenses,
    budget.period,
    currentPeriodValue(budget.period, now)
  );

  // Match on the language-independent key, not the raw string: a budget set on
  // "Food" must still count spending recorded as "Ăn uống" — they are the same
  // default category under two labels.
  const budgetKey = expenseCategoryKey(budget.category);

  const spent = inPeriod
    .filter(
      (e) => e.type === "expense" && expenseCategoryKey(e.category) === budgetKey
    )
    .reduce((sum, e) => sum + Number(e.amount || 0), 0);

  const limit = Number(budget.amount) || 0;
  const ratio = limit > 0 ? spent / limit : 0;
  const remaining = limit - spent;

  return {
    ...budget,
    spent,
    limit,
    ratio,
    remaining,
    status: getStatusLevel(ratio),
    percent: Math.round(ratio * 100),
    daysLeft: daysLeftInPeriod(budget.period, now),
    perDay: remaining > 0 ? remaining / daysLeftInPeriod(budget.period, now) : 0,
  };
};

// Picks the message key + values for a budget row.
//
// Wording follows the report's UX-writing rule (Insight B): state the fact,
// convert it into something the user can act on, and never scold. "Còn 600K
// cho 23 ngày" beats "Bạn đã dùng 80% ngân sách!".
export const budgetMessage = (progress) => {
  if (progress.status === "over") {
    return { key: "budget_over", values: { amount: -progress.remaining } };
  }
  if (progress.status === "nearly") {
    return {
      key: "budget_nearly",
      values: { amount: progress.remaining, days: progress.daysLeft },
    };
  }
  return {
    key: "budget_on_track",
    values: {
      amount: progress.remaining,
      days: progress.daysLeft,
      perDay: progress.perDay,
    },
  };
};

// Savings-goal progress, plus the projected finish date the report asks for:
// pace is measured from the goal's creation, so the estimate reflects what the
// user has actually been putting aside rather than an assumed monthly figure.
//
// A goal can be LINKED to a wallet. Its progress is then the wallet's balance
// rather than a manually kept figure: moving money into that wallet is the
// act of saving, and the goal completes when the wallet reaches the target.
// `linkedBalance` is that balance, supplied by the caller which already has the
// ledger. Goals created before linking existed keep `account` null and go on
// using their own `saved` column.
export const computeGoalProgress = (goal, now = new Date(), linkedBalance) => {
  const target = Number(goal.target) || 0;
  const linked = !!goal.account;
  // A wallet can be overdrawn; a goal is never less than empty.
  const saved = linked
    ? Math.max(0, Number(linkedBalance) || 0)
    : Number(goal.saved) || 0;
  const ratio = target > 0 ? Math.min(saved / target, 1) : 0;
  const remaining = Math.max(0, target - saved);

  let projected = null;
  if (remaining > 0 && saved > 0 && goal.createdAt) {
    const days = Math.max(1, (now - new Date(goal.createdAt)) / 86400000);
    const perDay = saved / days;
    if (perDay > 0) {
      const daysNeeded = remaining / perDay;
      // Beyond ~10 years the projection stops being meaningful.
      if (daysNeeded < 3650) {
        projected = new Date(now.getTime() + daysNeeded * 86400000);
      }
    }
  }

  return {
    ...goal,
    target,
    saved,
    linked,
    ratio,
    remaining,
    percent: Math.round(ratio * 100),
    complete: remaining === 0 && target > 0,
    projected,
  };
};
