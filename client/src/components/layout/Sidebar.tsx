"use client";

import clsx from "clsx";
import Container from "@/Components/layout/Container";
import {
  Handshake,
  FolderOpen,
  ExternalLink,
  UserRoundPlus,
  CircleQuestionMark,
  Archive,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ROUTES } from "@/Routes/route";

const navItems = [
  { href: ROUTES.PROJECTS, label: "Projects", icon: FolderOpen },
  { href: ROUTES.RESOURCES, label: "Resources", icon: ExternalLink },
];

const secondaryItems = [
  { href: "#", label: "Help Center", icon: CircleQuestionMark },
  { href: "#", label: "Archive", icon: Archive },
];

export default function Sidebar({ className }: { className?: string }) {
  const pathname = usePathname();

  return (
    <aside
      className={clsx(
        "w-60 overflow-y-auto bg-surface border border-outline",
        className,
      )}
    >
      <div className="px-2">
        <Link
          href={ROUTES.PROJECTS}
          className="h-16 flex items-center px-3 py-2 gap-2 border-b border-outline-subtle"
        >
          <div className="border border-outline-subtle rounded-b-full items-center justify-center flex">
            <Handshake />
          </div>
          <div className="">
            <p className="text-text-primary font-bold font-sans text-lg">
              KerjainYu
            </p>
            <p className="text-text-secondary font-sans">Workspace</p>
          </div>
        </Link>

        <Container>
          <nav
            aria-label="Main"
            className="min-h-115 border-b border-outline-subtle max-h-140"
          >
            <ul className="flex flex-col gap-3">
              {navItems.map(({ href, label, icon: Icon }) => {
                const isActive = pathname === href;
                return (
                  <li key={href}>
                    <Link
                      href={href}
                      aria-current={isActive ? "page" : undefined}
                      className={clsx(
                        "relative flex items-center gap-2 px-3 py-2 rounded-md text-lg overflow-hidden",
                        isActive
                          ? "text-text-primary"
                          : "text-text-secondary hover:text-text-primary",
                      )}
                    >
                      <span
                        aria-hidden="true"
                        className={clsx(
                          "absolute inset-0 bg-tertiary/10 rounded-md",
                          "origin-left transition-transform duration-300 ease-out",
                          isActive ? "scale-x-100" : "scale-x-0",
                        )}
                      />
                      <Icon className="relative z-10" />
                      <span className="relative z-10">{label}</span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>
        </Container>
      </div>

      <div className="mt-3 px-4">
        <Link
          href="#"
          className={clsx(
            "group flex items-center justify-center gap-2 w-full h-10 rounded-md border border-outline",
            "bg-surface-container text-text-primary",
            "transition-colors duration-200 ease-in-out",
            "hover:border-tertiary hover:text-tertiary-foreground",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-tertiary focus-visible:ring-offset-2",
          )}
        >
          <UserRoundPlus className="size-4 transition-colors duration-200 ease-in-out text-secondary group-hover:text-primary" />
          <span className="text-sm transition-colors duration-200 ease-in-out font-medium font-sans text-secondary group-hover:text-primary">
            Invite Member
          </span>
        </Link>
      </div>

      {/* This button for quick shortcut, so if the user is currently in a project and then the invite work to the current project. but if the user not choose the project yet, *the button add 1 project selector into the invite form* */}
      <nav aria-label="Secondary" className="mt-3 px-2">
        <ul className="flex flex-col gap-3">
          {secondaryItems.map(({ href, label, icon: Icon }) => (
            <li key={label}>
              <Link
                href={href}
                className={clsx(
                  "flex items-center gap-2 px-3 py-2 rounded-md text-lg",
                  "text-text-secondary hover:text-text-primary",
                  "transition-colors duration-200 ease-in-out",
                )}
              >
                <Icon className="size-5" />
                <span>{label}</span>
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </aside>
  );
}
