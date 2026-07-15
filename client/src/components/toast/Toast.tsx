"use client";

import clsx from "clsx";
import { AlertTriangle, CheckCircle2, Info, X, XCircle } from "lucide-react";
import type { ToastItem, ToastVariant } from "@/components/toast/ToastContext";

/**
 * Same left-border-stripe + muted status-color convention as
 * TaskCard's STATUS_STYLES — one accent (tertiary) reserved for
 * interactive/brand moments, status colors stay desaturated per
 * DESIGN.md rather than full-saturation red/green.
 */
const VARIANT_STYLES: Record<
  ToastVariant,
  { icon: typeof XCircle; border: string; iconColor: string }
> = {
  error: {
    icon: XCircle,
    border: "border-l-danger",
    iconColor: "text-danger",
  },
  success: {
    icon: CheckCircle2,
    border: "border-l-success",
    iconColor: "text-success",
  },
  warning: {
    icon: AlertTriangle,
    border: "border-l-warning",
    iconColor: "text-warning",
  },
  info: {
    icon: Info,
    border: "border-l-tertiary",
    iconColor: "text-tertiary",
  },
};

export interface ToastProps {
  toast: ToastItem;
  onDismiss: (id: string) => void;
}

export function Toast({ toast, onDismiss }: ToastProps) {
  const style = VARIANT_STYLES[toast.variant];
  const Icon = style.icon;

  return (
    <div
      role={toast.variant === "error" ? "alert" : "status"}
      aria-live={toast.variant === "error" ? "assertive" : "polite"}
      className={clsx(
        "flex items-start gap-3 w-80 max-w-[calc(100vw-2rem)] p-3 rounded-lg",
        "bg-surface border border-outline-subtle border-l-4 shadow-lg",
        "animate-toast-in",
        style.border,
      )}
    >
      <Icon
        className={clsx("size-5 shrink-0 mt-0.5", style.iconColor)}
        aria-hidden="true"
      />

      <div className="min-w-0 flex-1">
        <p className="text-sm font-medium text-text-primary leading-snug">
          {toast.title}
        </p>
        {toast.description && (
          <p className="text-xs text-text-muted mt-0.5 leading-snug">
            {toast.description}
          </p>
        )}
      </div>

      <button
        type="button"
        onClick={() => onDismiss(toast.id)}
        aria-label="Dismiss"
        className="flex items-center justify-center size-6 -m-1 rounded text-text-muted hover:text-text-primary transition-colors duration-150 ease-in-out cursor-pointer shrink-0"
      >
        <X className="size-4" />
      </button>
    </div>
  );
}
