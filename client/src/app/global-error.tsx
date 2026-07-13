"use client";

import { useEffect } from "react";

/**
 * Root-level error boundary (Next.js App Router convention). Only
 * fires when RootLayout itself throws — i.e. Sidebar, Navbar, or
 * ToastProvider crash, not just a page. Since the layout is gone,
 * this has to supply its own <html>/<body> and can't lean on
 * globals.css design tokens rendering correctly, so it's kept
 * deliberately plain rather than trying to match the app's styling —
 * this is the one place where "definitely renders no matter what"
 * outranks "on-brand."
 */
export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <html lang="en">
      <body
        style={{
          margin: 0,
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "#1a1613",
          color: "#f2ede4",
          fontFamily:
            "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
        }}
      >
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            textAlign: "center",
            gap: "16px",
            maxWidth: "380px",
            padding: "24px",
          }}
        >
          <h1 style={{ fontSize: "18px", fontWeight: 600, margin: 0 }}>
            KerjainYu hit a snag
          </h1>
          <p
            style={{
              fontSize: "14px",
              color: "#b5aa9a",
              lineHeight: 1.6,
              margin: 0,
            }}
          >
            The app failed to load. Reloading usually fixes this if it keeps
            happening, let us know through Help Center once you're back in.
          </p>
          <button
            type="button"
            onClick={reset}
            style={{
              marginTop: "4px",
              padding: "8px 16px",
              borderRadius: "6px",
              border: "none",
              backgroundColor: "#e3b98a",
              color: "#241f16",
              fontSize: "14px",
              fontWeight: 500,
              cursor: "pointer",
            }}
          >
            Reload
          </button>
        </div>
      </body>
    </html>
  );
}
