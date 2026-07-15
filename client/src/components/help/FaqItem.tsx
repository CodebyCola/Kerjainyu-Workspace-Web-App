"use client";

import clsx from "clsx";
import { ChevronDown } from "lucide-react";

export interface FaqItemProps {
  question: string;
  answer: string;
  isOpen: boolean;
  onToggle: () => void;
  className?: string;
}

export function FaqItem({
  question,
  answer,
  isOpen,
  onToggle,
  className,
}: FaqItemProps) {
  return (
    <div className={clsx("py-1", className)}>
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={isOpen}
        className={clsx(
          "group flex w-full items-center justify-between gap-3 py-3 px-1 text-left cursor-pointer",
        )}
      >
        <span
          className={clsx(
            "text-sm font-medium transition-colors duration-150 ease-in-out",
            isOpen
              ? "text-text-primary"
              : "text-text-secondary group-hover:text-text-primary",
          )}
        >
          {question}
        </span>
        <ChevronDown
          aria-hidden="true"
          className={clsx(
            "size-4 shrink-0 text-text-muted transition-transform duration-200 ease-in-out",
            isOpen && "rotate-180 text-tertiary",
          )}
        />
      </button>

      <div
        className={clsx(
          "grid transition-all duration-200 ease-in-out",
          isOpen ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0",
        )}
      >
        <div className="overflow-hidden">
          <p className="text-sm text-text-secondary leading-relaxed px-1 pb-3 pr-7">
            {answer}
          </p>
        </div>
      </div>
    </div>
  );
}
