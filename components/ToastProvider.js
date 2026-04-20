"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { ToastContext } from "../hooks/useToast";

let toastId = 0;
const TOAST_DURATION_MS = 4000;

export default function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);
  const timeoutRef = useRef(new Map());

  useEffect(() => {
    return () => {
      timeoutRef.current.forEach((timeoutId) => clearTimeout(timeoutId));
      timeoutRef.current.clear();
    };
  }, []);

  const removeToast = useCallback((id) => {
    const timeoutId = timeoutRef.current.get(id);
    if (timeoutId) {
      clearTimeout(timeoutId);
      timeoutRef.current.delete(id);
    }

    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  }, []);

  const addToast = useCallback((message, variant = "info") => {
    toastId += 1;
    const id = toastId;
    setToasts((prev) => [...prev, { id, message, variant }]);

    const timeoutId = setTimeout(() => {
      removeToast(id);
    }, TOAST_DURATION_MS);

    timeoutRef.current.set(id, timeoutId);
  }, [removeToast]);

  const value = useMemo(() => ({ addToast }), [addToast]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div
        className="fixed bottom-4 right-4 z-50 flex w-full max-w-sm flex-col gap-2"
        aria-live="polite"
        aria-atomic="false"
      >
        {toasts.map((toast) => (
          <div
            key={toast.id}
            role={toast.variant === "error" ? "alert" : "status"}
            aria-live={toast.variant === "error" ? "assertive" : "polite"}
            aria-atomic="true"
            className={`px-4 py-3 rounded-xl shadow-lg text-sm text-white ${
              toast.variant === "error"
                ? "bg-rose-500"
                : toast.variant === "success"
                ? "bg-emerald-500"
                : "bg-slate-800"
            }`}
          >
            {toast.message}
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}
