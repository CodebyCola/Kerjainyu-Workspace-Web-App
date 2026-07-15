const FALLBACK_MESSAGE = "Something went wrong on our end. Please try again.";

interface ApiErrorBody {
  error?: string;
  details?: unknown;
}

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

export async function parseApiError(response: Response): Promise<string> {
  try {
    const body: unknown = await response.json();
    return getErrorMessage(body);
  } catch {
    return FALLBACK_MESSAGE;
  }
}
