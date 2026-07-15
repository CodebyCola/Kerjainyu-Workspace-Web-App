"use client";

import { Toast } from "@/components/toast/Toast";
import type { ToastItem } from "@/components/toast/ToastContext";

export interface ToastViewportProps {
  toasts: ToastItem[];
  onDismiss: (id: string) => void;
}

/**
 * Bottom-right stack, above the sidebar/drawer overlay (z-50 matches
 * the modal layer — toasts and modals don't currently appear at the
 * same time, but if they do, the toast should still be readable on
 * top). Newest toast at the bottom of the stack, so new items don't
 * shove already-being-read ones around.
 */
export function ToastViewport({ toasts, onDismiss }: ToastViewportProps) {
  if (toasts.length === 0) return null;

  return (
    <section
      aria-label="Notifications"
      className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 pointer-events-none"
    >
      {toasts.map((toast) => (
        <div key={toast.id} className="pointer-events-auto">
          <Toast toast={toast} onDismiss={onDismiss} />
        </div>
      ))}
    </section>
  );
}
