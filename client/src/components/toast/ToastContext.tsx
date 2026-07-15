"use client";

import {
  createContext,
  type ReactNode,
  useCallback,
  useContext,
  useMemo,
  useRef,
  useState,
} from "react";
import { ToastViewport } from "@/components/toast/ToastViewPort";

export type ToastVariant = "error" | "success" | "warning" | "info";

export interface ToastItem {
  id: string;
  variant: ToastVariant;
  title: string;
  description?: string;
  duration: number;
}

type ShowToastInput = {
  title: string;
  description?: string;
  duration?: number;
};

interface ToastContextValue {
  error: (input: ShowToastInput | string) => string;
  success: (input: ShowToastInput | string) => string;
  warning: (input: ShowToastInput | string) => string;
  info: (input: ShowToastInput | string) => string;
  dismiss: (id: string) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

const DEFAULT_DURATION = 3000;

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const timers = useRef<Map<string, ReturnType<typeof setTimeout>>>(new Map());

  const dismiss = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
    const timer = timers.current.get(id);
    if (timer) {
      clearTimeout(timer);
      timers.current.delete(id);
    }
  }, []);

  const show = useCallback(
    (variant: ToastVariant, input: ShowToastInput | string) => {
      const normalized: ShowToastInput =
        typeof input === "string" ? { title: input } : input;
      const id = crypto.randomUUID();
      const duration = normalized.duration ?? DEFAULT_DURATION;

      setToasts((prev) => [
        ...prev,
        {
          id,
          variant,
          title: normalized.title,
          description: normalized.description,
          duration,
        },
      ]);

      if (duration > 0) {
        const timer = setTimeout(() => dismiss(id), duration);
        timers.current.set(id, timer);
      }

      return id;
    },
    [dismiss],
  );

  const value = useMemo<ToastContextValue>(
    () => ({
      error: (input) => show("error", input),
      success: (input) => show("success", input),
      warning: (input) => show("warning", input),
      info: (input) => show("info", input),
      dismiss,
    }),
    [show, dismiss],
  );

  return (
    <ToastContext.Provider value={value}>
      {children}
      <ToastViewport toasts={toasts} onDismiss={dismiss} />
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) {
    throw new Error("useToast must be used within a ToastProvider");
  }
  return ctx;
}
