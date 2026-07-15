"use client";

import clsx from "clsx";
import { LogOut, User } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import Avatar from "@/components/layout/Avatar";
import { useToast } from "@/components/toast/ToastContext";
import { useAuth } from "@/hooks/useAuth";
import { ROUTES } from "@/routes/route";
import { getErrorMessage } from "@/utils/Errors";

/**
 * Profile trigger + dropdown, replacing the old plain avatar Link in
 * Navbar. Click (not hover) opens it — hover-triggered menus are hard
 * to use on touch devices and easy to trigger by accident with a mouse
 * passing through, and this app's other overlays (InviteMemberModal)
 * are click-driven too, so this stays consistent with that.
 *
 * Implemented as a small anchored panel rather than reusing the
 * InviteMemberModal's full-screen dialog pattern: a profile menu is a
 * lightweight, dismiss-on-outside-click affordance anchored to its
 * trigger (standard "account menu" UX — see e.g. GitHub/Linear/Vercel's
 * own top-right profile menus), not a focused task that warrants a
 * centered modal with a backdrop.
 */
export default function ProfileMenu() {
  const { user, logout } = useAuth();
  const toast = useToast();
  const router = useRouter();

  const [open, setOpen] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Close on outside click.
  useEffect(() => {
    if (!open) return;

    function handlePointerDown(event: MouseEvent) {
      if (!containerRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    }

    document.addEventListener("mousedown", handlePointerDown);
    return () => document.removeEventListener("mousedown", handlePointerDown);
  }, [open]);

  // Close on Escape — standard dismiss key for any transient overlay.
  useEffect(() => {
    if (!open) return;

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") setOpen(false);
    }

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [open]);


  async function handleLogout() {
    setLoggingOut(true);
    try {
      // Delegates to AuthProvider's logout (service/auth/auth.provider.tsx),
      // which POSTs to /api/logout to clear the session cookie and resets
      // user/status to logged-out. The (protected) layout's effect then
      // takes care of redirecting once status flips to "unauthenticated",
      // but we push explicitly too so the redirect isn't dependent on
      // this component staying mounted.
      await logout();
      toast.info("Successfully logged out, see you next time.")
      setOpen(false);
      router.replace(ROUTES.LOGIN);
    } catch (err) {
      toast.error({
        title: "Couldn't log out",
        description: getErrorMessage(err),
      });
      setLoggingOut(false);
    }
  }

  return (
    <div className="relative" ref={containerRef}>
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        aria-label="Open profile menu"
        aria-haspopup="menu"
        aria-expanded={open}
        className={clsx(
          "flex items-center justify-center rounded-full cursor-pointer",
          "transition-opacity duration-150 ease-in-out hover:opacity-80",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-tertiary focus-visible:ring-offset-2 focus-visible:ring-offset-surface",
        )}
      >
        <Avatar username={user?.username} size="sm" />
      </button>

      {open && (
        <div
          role="menu"
          aria-label="Profile menu"
          className={clsx(
            "absolute right-0 top-[calc(100%+0.5rem)] z-50 w-56",
            "bg-surface border border-outline-subtle rounded-lg shadow-xl",
            "animate-dropdown-in overflow-hidden",
          )}
        >
          <div className="flex items-center gap-3 px-4 py-3 border-b border-outline-subtle">
            <Avatar username={user?.username} size="md" />
            <div className="min-w-0">
              <p className="text-sm font-semibold text-text-primary truncate">
                {user?.username ?? "Unknown user"}
              </p>
              <p className="text-xs text-text-muted">Signed in</p>
            </div>
          </div>

          <div className="py-1">
            <Link
              href={ROUTES.PROFILE}
              role="menuitem"
              onClick={() => setOpen(false)}
              className={clsx(
                "flex items-center gap-2.5 px-4 py-2.5 text-sm text-text-secondary",
                "hover:bg-surface-container hover:text-text-primary",
                "transition-colors duration-150 ease-in-out",
              )}
            >
              <User className="size-4" aria-hidden="true" />
              View profile
            </Link>
          </div>

          <div className="py-1 border-t border-outline-subtle">
            <button
              type="button"
              role="menuitem"
              disabled={loggingOut}
              onClick={handleLogout}
              className={clsx(
                "flex items-center gap-2.5 w-full px-4 py-2.5 text-sm text-left",
                "text-danger hover:bg-danger-container",
                "transition-colors duration-150 ease-in-out cursor-pointer",
                loggingOut && "opacity-60 cursor-wait",
              )}
            >
              <LogOut className="size-4" aria-hidden="true" />
              {loggingOut ? "Logging out…" : "Log out"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
