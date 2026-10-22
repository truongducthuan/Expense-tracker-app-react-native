import { useEffect, useRef } from "react";

import { ExpenseStore } from "../../store/context";
import { BudgetStore } from "../../store/budgetContext";
import { useLanguage } from "../../store/languageContext";
import { useSync } from "../../store/syncContext";
import { fetchBudgetsDB } from "../../util/database";
import { computeBudgetProgress } from "../../util/budget";
import {
  alertLevel,
  alertSignature,
  loadSentAlerts,
  saveSentAlerts,
  sendBudgetAlert,
} from "../../util/budgetAlerts";
import useMoney from "../../hooks/useMoney";

// Sends the budget alerts the user asked for with "Remind me at …%".
//
// Mounted once for the signed-in app (see RootNavigator), not per screen: a
// transaction can be added from several places, and an alert has to go out
// whichever one was used. Renders nothing.
const BudgetAlertWatcher = () => {
  const { expenses } = ExpenseStore();
  const { budgets, setBudgets } = BudgetStore();
  const { t } = useLanguage();
  const { money } = useMoney();
  const { version } = useSync();

  // Loaded once, then kept here, so two quick changes can't both read "not
  // sent yet" from storage and alert twice.
  const sentRef = useRef(null);
  const queueRef = useRef(Promise.resolve());

  // The budget store is otherwise only filled when the Plan tab is opened, and
  // alerts must work without visiting it. `version` bumps when a sync pulled
  // the account's budgets from another device.
  useEffect(() => {
    let active = true;
    fetchBudgetsDB()
      .then((rows) => active && setBudgets(rows))
      .catch((err) => console.error(err));
    return () => {
      active = false;
    };
  }, [version]);

  useEffect(() => {
    // Before transactions have loaded, every budget reads 0% — nothing to say.
    if (!budgets.length || !expenses?.length) return;

    queueRef.current = queueRef.current.then(async () => {
      if (!sentRef.current) sentRef.current = await loadSentAlerts();
      const sent = sentRef.current;
      const now = new Date();
      let changed = false;

      for (const budget of budgets) {
        const progress = computeBudgetProgress(budget, expenses, now);
        const level = alertLevel(progress);
        const signature = alertSignature(budget, now);
        const previous = sent[budget.id]?.signature === signature
          ? sent[budget.id].level
          : 0;
        if (level <= previous) continue;

        const values = { category: budget.category };
        const content =
          level === 2
            ? {
                title: t("budget_alert_over_title", values),
                body: t("budget_alert_over_body", {
                  spent: money(progress.spent),
                  limit: money(progress.limit),
                }),
              }
            : {
                title: t("budget_alert_title", { ...values, percent: progress.percent }),
                body: t("budget_alert_body", {
                  amount: money(progress.remaining),
                  days: progress.daysLeft,
                }),
              };

        const delivered = await sendBudgetAlert({
          ...content,
          channelName: t("budget_alert_channel"),
        });
        if (delivered) {
          sent[budget.id] = { signature, level };
          changed = true;
        }
      }

      if (changed) await saveSentAlerts(sent);
    }).catch((err) => console.error(err));
  }, [budgets, expenses]);

  return null;
};

export default BudgetAlertWatcher;
