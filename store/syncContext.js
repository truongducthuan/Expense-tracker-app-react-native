import { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";

import { pushTable, syncUserData } from "../api/sync";
import { AuthStore } from "./authContext";

const SyncContext = createContext({
  isSyncing: false,
  lastResult: null,
  // Bumped after a sync pulls new rows into SQLite. Screens list it among
  // their effect dependencies so they re-read instead of showing what was on
  // screen before the account's data arrived.
  version: 0,
  syncNow: async () => {},
  publish: () => {},
});

// Keeps the account's lists in step with this device.
//
// Runs once whenever a user becomes signed in — including the session restored
// at launch — and then after each change. Screens never wait on it: they read
// SQLite as they always did, so the app still works offline and starts at the
// same speed.
const SyncProvider = ({ children }) => {
  const { user, isAuthenticated } = AuthStore();
  const [isSyncing, setIsSyncing] = useState(false);
  const [lastResult, setLastResult] = useState(null);
  const [version, setVersion] = useState(0);
  const syncedFor = useRef(null);

  const syncNow = useCallback(async () => {
    if (!user?.email) return null;
    setIsSyncing(true);
    try {
      const result = await syncUserData(user.email);
      setLastResult(result);
      if (result?.direction === "downloaded") setVersion((n) => n + 1);
      return result;
    } finally {
      setIsSyncing(false);
    }
  }, [user?.email]);

  useEffect(() => {
    if (!isAuthenticated || !user?.email) {
      syncedFor.current = null;
      return;
    }
    // Once per signed-in account, not on every re-render.
    if (syncedFor.current === user.email) return;
    syncedFor.current = user.email;
    syncNow();
  }, [isAuthenticated, user?.email, syncNow]);

  // Fire-and-forget upload of one table after a local change. Failures are
  // logged rather than surfaced: the write already succeeded locally, and the
  // next sync will carry it up.
  const publish = useCallback(
    (table) => {
      if (!user?.email) return;
      pushTable(user.email, table).catch((err) =>
        console.error(`could not publish ${table}:`, err?.message || err)
      );
    },
    [user?.email]
  );

  return (
    <SyncContext.Provider value={{ isSyncing, lastResult, version, syncNow, publish }}>
      {children}
    </SyncContext.Provider>
  );
};

export const useSync = () => useContext(SyncContext);
export default SyncProvider;
