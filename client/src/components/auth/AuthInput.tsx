"use client";

import clsx from "clsx";
import { forwardRef, type InputHTMLAttributes } from "react";

export interface AuthInputProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
}

export const AuthInput = forwardRef<HTMLInputElement, AuthInputProps>(
  function AuthInput({ label, error, id, className, ...props }, ref) {
    const inputId = id ?? props.name;
    const errorId = error ? `${inputId}-error` : undefined;

    return (
      <div className="flex flex-col gap-1.5">
        <label
          htmlFor={inputId}
          className="text-xs font-medium text-text-secondary"
        >
          {label}
        </label>
        <input
          ref={ref}
          id={inputId}
          aria-invalid={!!error}
          aria-describedby={errorId}
          className={clsx(
            "bg-surface border rounded-md px-3 py-2 text-sm text-text-primary",
            "placeholder:text-text-muted",
            "focus:outline-none transition-colors duration-150 ease-in-out",
            error
              ? "border-danger focus:border-danger"
              : "border-outline-subtle focus:border-tertiary",
            className,
          )}
          {...props}
        />
        {error && (
          <p id={errorId} className="text-xs text-danger">
            {error}
          </p>
        )}
      </div>
    );
  },
);
