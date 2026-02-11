"use client";

import { createContext, useCallback, useContext, useMemo, useState } from "react";

type ToastType = "success" | "error";

type ToastItem = {
  id: string;
  type: ToastType;
  message: string;
};

type ToastContextValue = {
  success: (message: string) => void;
  error: (message: string) => void;
};

const ToastContext = createContext<ToastContextValue | null>(null);

function ToastViewport({ items, onDismiss }: { items: ToastItem[]; onDismiss: (id: string) => void }) {
  return (
    <div className="fixed right-4 bottom-4 z-[60] flex flex-col gap-2" style={{ paddingBottom: "env(safe-area-inset-bottom)" }}>
      {items.map((t) => (
        <div
          key={t.id}
          className={
            "min-w-[260px] max-w-[360px] rounded-2xl border backdrop-blur-2xl px-4 py-3 shadow-lg " +
            (t.type === "success"
              ? "bg-emerald-500/10 border-emerald-400/30 text-emerald-100 shadow-emerald-500/10"
              : "bg-red-500/10 border-red-400/30 text-red-100 shadow-red-500/10")
          }
          role="status"
        >
          <div className="flex items-start justify-between gap-3">
            <div className="text-sm leading-relaxed">{t.message}</div>
            <button
              type="button"
              onClick={() => onDismiss(t.id)}
              className="text-xs text-zinc-300 hover:text-white"
              aria-label="Dismiss"
            >
              Close
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<ToastItem[]>([]);

  const dismiss = useCallback((id: string) => {
    setItems((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const push = useCallback(
    (type: ToastType, message: string) => {
      const id = `${Date.now()}-${Math.random().toString(16).slice(2)}`;
      const toast: ToastItem = { id, type, message };
      setItems((prev) => [...prev, toast].slice(-3));
      window.setTimeout(() => dismiss(id), 3200);
    },
    [dismiss]
  );

  const value = useMemo<ToastContextValue>(
    () => ({
      success: (m) => push("success", m),
      error: (m) => push("error", m),
    }),
    [push]
  );

  return (
    <ToastContext.Provider value={value}>
      {children}
      <ToastViewport items={items} onDismiss={dismiss} />
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used within ToastProvider");
  return ctx;
}
