import type { ReactNode } from "react";

export interface AuthCardProps {
  title: string;
  subtitle: string;
  children: ReactNode;
  footer: ReactNode;
  error?: string;
}

export function AuthCard({
  title,
  subtitle,
  children,
  footer,
  error,
}: AuthCardProps) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-neutral px-4">
      <div className="w-full max-w-sm flex flex-col items-center gap-8">
        <div className="flex flex-col items-center gap-2 text-center">
          <p className="text-2xl font-bold text-text-primary">KerjainYu</p>
          <p className="text-sm text-text-secondary max-w-70">
            Assign tasks, track deadlines, and review submissions with your
            project group.
          </p>
        </div>

        <div className="w-full bg-surface border border-outline-subtle rounded-lg p-6 flex flex-col gap-5">
          <div className="flex flex-col gap-1">
            <h1 className="text-lg font-semibold text-text-primary">{title}</h1>
            <p className="text-xs text-text-muted">{subtitle}</p>
          </div>

          {error && (
            <p
              role="alert"
              className="text-sm text-danger bg-danger-container rounded-md px-3 py-2"
            >
              {error}
            </p>
          )}

          {children}
        </div>

        <p className="text-xs text-text-muted">{footer}</p>
      </div>
    </div>
  );
}
