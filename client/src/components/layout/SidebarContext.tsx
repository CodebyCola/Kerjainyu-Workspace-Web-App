"use client";

import { usePathname } from "next/navigation";
import {
  createContext,
  type ReactNode,
  useContext,
  useEffect,
  useState,
} from "react";

interface SidebarContextValue {
  /** Whether the mobile/tablet off-canvas drawer is open. */
  isOpen: boolean;
  open: () => void;
  close: () => void;
  toggle: () => void;
}

const SidebarContext = createContext<SidebarContextValue | null>(null);

/**
 * Shares drawer open/close state between Navbar (which renders the
 * hamburger trigger) and Sidebar (which renders the drawer content).
 * They're siblings under RootLayout, so this is the simplest way to
 * connect them without prop-drilling through the server-rendered
 * layout shell.
 */
export function SidebarProvider({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();

  // Close the drawer automatically on navigation so a route change
  // from within the drawer doesn't leave it open over the new page.
  // `pathname` is intentionally the effect's re-run trigger, not a
  // value read inside the callback — biome's exhaustive-deps check
  // can't tell the difference, so it's suppressed for this line
  // rather than dropping the dependency (which would break the
  // auto-close behavior).
  // biome-ignore lint/correctness/useExhaustiveDependencies: pathname triggers re-run intentionally, not read in body
  useEffect(() => {
    setIsOpen(false);
  }, [pathname]);

  return (
    <SidebarContext.Provider
      value={{
        isOpen,
        open: () => setIsOpen(true),
        close: () => setIsOpen(false),
        toggle: () => setIsOpen((prev) => !prev),
      }}
    >
      {children}
    </SidebarContext.Provider>
  );
}

export function useSidebar() {
  const ctx = useContext(SidebarContext);
  if (!ctx) {
    throw new Error("useSidebar must be used within a SidebarProvider");
  }
  return ctx;
}