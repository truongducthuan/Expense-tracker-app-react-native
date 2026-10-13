import { createContext, useCallback, useContext, useRef, useState } from "react";

import AppDialog from "../components/ui/AppDialog";
import { useLanguage } from "./languageContext";

const DialogContext = createContext({
  alert: async () => {},
  confirm: async () => false,
});

// Hosts the one dialog instance and hands screens a promise-based API.
//
// Alert.alert takes callbacks and renders the OS widget; this keeps the call
// sites shorter *and* on the design system:
//
//   await alert({ title, message });
//   if (await confirm({ title, message, destructive: true })) { ... }
//
// Only one dialog can be open at a time, which is the same guarantee Alert
// gives and avoids stacked modals on iOS.
const DialogProvider = ({ children }) => {
  const { t } = useLanguage();
  const [config, setConfig] = useState(null);
  const resolver = useRef(null);

  const settle = useCallback((result) => {
    setConfig(null);
    const resolve = resolver.current;
    resolver.current = null;
    resolve?.(result);
  }, []);

  const open = useCallback((next) => {
    // A second call while one is open resolves the first as cancelled rather
    // than leaving its promise pending forever.
    resolver.current?.(false);
    return new Promise((resolve) => {
      resolver.current = resolve;
      setConfig(next);
    });
  }, []);

  const alert = useCallback(
    ({ title, message, tone = "info", confirmLabel } = {}) =>
      open({
        title,
        message,
        tone,
        confirmLabel: confirmLabel || t("okay"),
        cancelLabel: null,
      }),
    [open, t]
  );

  const confirm = useCallback(
    ({
      title,
      message,
      tone = "warning",
      confirmLabel,
      cancelLabel,
      destructive = false,
    } = {}) =>
      open({
        title,
        message,
        tone,
        destructive,
        confirmLabel: confirmLabel || t("okay"),
        cancelLabel: cancelLabel || t("cancel"),
      }),
    [open, t]
  );

  return (
    <DialogContext.Provider value={{ alert, confirm }}>
      {children}
      <AppDialog
        visible={!!config}
        {...(config || {})}
        onConfirm={() => settle(true)}
        onCancel={() => settle(false)}
      />
    </DialogContext.Provider>
  );
};

export const useDialog = () => useContext(DialogContext);
export default DialogProvider;
