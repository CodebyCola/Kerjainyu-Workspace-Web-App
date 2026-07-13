"use client";

import clsx from "clsx";
import { RefreshCw, TriangleAlert } from "lucide-react";
import { useEffect } from "react";
import Container from "@/components/layout/Container";

/**
 * Route-segment error boundary (Next.js App Router convention: any
 * app/**\/error.tsx catches render-time exceptions thrown by that
 * segment's page/layout, without tearing down RootLayout — Sidebar
 * and Navbar stay mounted and usable, only the page content area
 * is replaced by this fallback).
 *
 * This is the counterpart to the toast system (see ToastContext.tsx):
 * toasts handle "an action failed but the app is fine" — non-blocking,
 * dismissible. This handles "the app broke while rendering" — there's
 * nothing safe to show underneath, so it's necessarily blocking and
 * needs an explicit recovery action instead of auto-dismissing.
 */
export default function ErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // In production this reports to an error-tracking service (Sentry
    // et al.) — logging for now so failures aren't silent during dev.
    console.error(error);
  }, [error]);

  return (
    <Container>
      <div className="flex flex-col items-center text-center gap-4 py-16 px-4 max-w-md mx-auto">
        <span
          className="flex items-center justify-center size-12 rounded-full bg-danger-container text-danger shrink-0"
          aria-hidden="true"
        >
          <TriangleAlert className="size-6" />
        </span>

        <div className="flex flex-col gap-1.5">
          <h1 className="text-lg font-semibold text-text-primary">
            Something went wrong
          </h1>
          <p className="text-sm text-text-secondary leading-relaxed">
            This page ran into a problem loading. Your other data is safe try
            again, or head back and pick up where you left off.
          </p>
        </div>

        <button
          type="button"
          onClick={reset}
          className={clsx(
            "flex items-center gap-2 text-sm font-medium px-4 py-2 rounded-md mt-1",
            "bg-tertiary text-on-tertiary hover:opacity-90 transition-opacity duration-150 ease-in-out cursor-pointer",
          )}
        >
          <RefreshCw className="size-4" aria-hidden="true" />
          Try again
        </button>
      </div>
    </Container>
  );
}
