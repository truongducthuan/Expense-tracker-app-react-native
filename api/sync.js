import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";

import { FIREBASE_DB_URL as URL } from "./config";
import {
  SYNCED_TABLES,
  exportTable,
  initDatabases,
  replaceTable,
} from "../util/database";
import { fingerprint, mergeSnapshot } from "../util/merge";

// Budgets, goals, categories and wallets used to live only in SQLite, so they
// stayed on whichever device created them: signing in elsewhere showed the
// transactions (those were always in Firebase) next to an empty plan.
//
// They are now stored per user and cached in SQLite, which keeps every existing
// read path — and offline use — working unchanged.

// Realtime Database keys cannot contain . # $ [ ] or /, and an email contains
// at least one dot. No uid is captured at sign-in (neither the password nor
// the Google path stores one), so the address is the only stable identifier.
export const userKey = (email) =>
  String(email || "")
    .trim()
    .toLowerCase()
    .replace(/[.#$[\]/]/g, "_");

const base = (email) => `${URL}/users/${userKey(email)}`;

// Which account this device's lists belong to.
//
// Merging is only right when they are the SAME account's. If someone else signs
// in on this phone, their account must not inherit the previous user's budgets,
// so the device is brought in line with theirs instead of merged into it.
//
// Nothing stored means the lists pre-date sync — the upgrade case — and those
// are the user's own, so they are merged rather than thrown away.
const LAST_ACCOUNT_KEY = "sync:lastAccount";

const readLastAccount = () =>
  AsyncStorage.getItem(LAST_ACCOUNT_KEY).catch(() => null);

const writeLastAccount = (email) =>
  AsyncStorage.setItem(LAST_ACCOUNT_KEY, userKey(email)).catch(() => {});

// Not read as a decision any more — the merge no longer needs to know whether
// the account has synced before — but kept as a record of when it last did.
const writeMeta = (email) =>
  axios.put(`${base(email)}/meta.json`, { syncedAt: new Date().toISOString() });

const pull = async (email, table) => {
  const { data } = await axios.get(`${base(email)}/${table}.json`);
  if (data === null || data === undefined) return [];
  // Rows are stored as an array; Firebase hands back an object when keys are
  // sparse, so normalise either shape.
  return Array.isArray(data) ? data.filter(Boolean) : Object.values(data);
};

const push = (email, table, rows) =>
  axios.put(`${base(email)}/${table}.json`, rows);

// Uploads one of this device's lists, after a change to it.
export const pushTable = async (email, table) => {
  if (!email) return;
  const rows = await exportTable(table);
  await push(email, table, rows);
};

// Brings the device and the account into line with each other.
//
// Both sides are read first, merged, and the result written to both. Nothing is
// decided from an absence: a row missing from the account is a row the account
// has not seen, while a row the user deleted travels as a tombstone, so the two
// are no longer confused.
//
// Any failed request aborts the whole thing before SQLite is touched, and
// replaceTable refuses anything that is not an array, so a network error can
// never read as "you have nothing".
export const syncUserData = async (email) => {
  if (!email) return { ok: false, direction: "none" };

  try {
    const local = {};
    const remote = {};
    for (const table of SYNCED_TABLES) {
      local[table] = await exportTable(table);
      remote[table] = await pull(email, table);
    }

    // A device that was last synced by a different account has no claim on
    // what it is holding, so its lists are not merged upwards.
    const lastAccount = await readLastAccount();
    const borrowed = !!lastAccount && lastAccount !== userKey(email);
    const merged = mergeSnapshot(borrowed ? {} : local, remote);

    let changed = false;
    for (const table of SYNCED_TABLES) {
      if (fingerprint(table, merged[table]) === fingerprint(table, local[table])) {
        continue;
      }
      await replaceTable(table, merged[table]);
      changed = true;
    }

    // Re-seed after a download. An account with nothing stored would otherwise
    // leave this device with no categories at all until the next launch, and
    // seeding is itself gated by the tombstones that just arrived, so a default
    // the user deleted stays deleted.
    if (changed) await initDatabases();

    // Pushed from SQLite rather than from `merged`, so what the account holds
    // is exactly what this device ended up with.
    for (const table of SYNCED_TABLES) await pushTable(email, table);
    await writeMeta(email);
    await writeLastAccount(email);

    // Only a merge that brought something down needs the screens to re-read.
    return { ok: true, direction: changed ? "downloaded" : "uploaded" };
  } catch (err) {
    console.error("sync failed:", err?.message || err);
    return { ok: false, direction: "none", error: err };
  }
};
