/**
 * Shared helper for turning a caught error into a toast-ready message.
 * Pairs with useToast() (components/toast/ToastContext.tsx) — every
 * call site that does `try { await fetch(...) } catch { toast.error(...) }`
 * can use this instead of writing its own fallback string, so the
 * "invalid server response" case looks the same everywhere.
 *
 * Matches the API's error shape: every failed request responds with
 * `{ error: string, details?: unknown }` regardless of status code.
 * There's no separate "success" flag to check on failure — a non-2xx
 * status + that body IS the failure signal.
 */

const FALLBACK_MESSAGE = "Something went wrong on our end. Please try again.";

interface ApiErrorBody {
  error?: string;
  details?: unknown;
}

/**
 * Best-effort extraction of a human-readable message from whatever a
 * failed `fetch` call produced — a parsed API error body, a thrown
 * Error (network failure, JSON parse failure), or something unknown.
 * Never throws; always returns a displayable string.
 */
export function getErrorMessage(err: unknown): string {
  if (isApiErrorBody(err) && err.error) {
    return err.error;
  }
  if (err instanceof Error && err.message) {
    return err.message;
  }
  if (typeof err === "string" && err.trim()) {
    return err;
  }
  return FALLBACK_MESSAGE;
}

function isApiErrorBody(value: unknown): value is ApiErrorBody {
  return typeof value === "object" && value !== null && "error" in value;
}

/**
 * Parses a fetch Response into the app's standard error shape. Use in
 * the non-ok branch of an API call:
 *
 *   const res = await fetch(url, options);
 *   if (!res.ok) {
 *     const message = await parseApiError(res);
 *     toast.error({ title: "Couldn't save changes", description: message });
 *     return;
 *   }
 *
 * Falls back to the generic message if the body isn't valid JSON —
 * e.g. the server is down and something in front of it (a proxy, the
 * platform) returned an HTML error page instead of the app's JSON.
 */
export async function parseApiError(response: Response): Promise<string> {
  try {
    const body: unknown = await response.json();
    return getErrorMessage(body);
  } catch {
    return FALLBACK_MESSAGE;
  }
}
