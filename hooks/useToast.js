"use client";

import { createContext, useContext } from "react";

export const ToastContext = createContext({
  addToast: () => {},
});

export function useToast() {
  return useContext(ToastContext);
}
