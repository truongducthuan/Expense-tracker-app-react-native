import axios from "axios";

import { FIREBASE_DB_URL as URL } from "./config";
import { IDENTITY_TOOLKIT_KEY } from "./auth";
import { userKey } from "./sync";

// Deleting an account, end to end.
//
// Both stores require this: an app that lets you create an account has to let
// you delete it from inside the app, not by emailing someone. It is also the
// only honest reading of "delete my account" — the sign-in disappearing while
// the transactions stay on the server is not a deletion.

// Firebase rejects a token older than an hour, and this is the one operation
// where a stale token would be reported as a failure after the data was
// already gone. Signing in again right before deleting gets a fresh one and
// doubles as the "are you really the owner" check.
export const reauthenticate = async (email, password) => {
  const { data } = await axios.post(
    `https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${IDENTITY_TOOLKIT_KEY}`,
    { email, password, returnSecureToken: true }
  );
  return data.idToken;
};

// Every transaction lives in one flat collection with a `user` field — the
// same list the app already fetches whole — so the ones to remove are found
// here rather than with a server-side query that would need an index.
const deleteTransactions = async (email) => {
  const { data } = await axios.get(`${URL}/expenses.json`);
  if (!data) return 0;

  const mine = Object.keys(data).filter((id) => data[id]?.user === email);
  for (const id of mine) await axios.delete(`${URL}/expenses/${id}.json`);
  return mine.length;
};

// The synced lists: budgets, goals, categories, wallets and their tombstones.
const deleteSyncedData = (email) =>
  axios.delete(`${URL}/users/${userKey(email)}.json`);

export const deleteAuthAccount = (idToken) =>
  axios.post(
    `https://identitytoolkit.googleapis.com/v1/accounts:delete?key=${IDENTITY_TOOLKIT_KEY}`,
    { idToken }
  );

// Data first, sign-in last. If the sign-in went first and a later request
// failed, the account would be unreachable and its data stranded with no way
// left to ask for it to be removed.
export const deleteAccount = async ({ email, idToken }) => {
  const transactions = await deleteTransactions(email);
  await deleteSyncedData(email);
  if (idToken) await deleteAuthAccount(idToken);
  return { transactions };
};
