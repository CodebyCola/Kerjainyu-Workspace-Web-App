"use client";

import clsx from "clsx";
import {
  Archive,
  Calendar,
  CircleQuestionMark,
  ClipboardList,
  ExternalLink,
  FolderOpen,
  Handshake,
  LayoutGrid,
  Paperclip,
  UserRoundPlus,
  Users,
  X,
} from "lucide-react";
import Link from "next/link";
import { useParams, usePathname } from "next/navigation";
import { useState } from "react";
import Container from "@/components/layout/Container";
import { useSidebar } from "@/components/layout/SidebarContext";
import {
  InviteMemberModal,
  type ProjectOption,
} from "@/components/team/InviteMemberModal";
import { ROUTES } from "@/routes/route";

const userProjects: ProjectOption[] = [
  { id: 1, title: "Website Redesign Sprint" },
  { id: 2, title: "Mobile App Launch" },
];

const navItems = [
  { href: ROUTES.PROJECTS, label: "Projects", icon: FolderOpen },
  { href: ROUTES.MYTASK, label: "My Tasks", icon: ClipboardList },
];

const secondaryItems = [
  { href: ROUTES.HELP_CENTER, label: "Help Center", icon: CircleQuestionMark },
  { href: ROUTES.ARCHIVE, label: "Archive", icon: Archive },
];

function BrandMark({
  expanded,
  onNavigate,
}: {
  expanded: boolean;
  onNavigate?: () => void;
}) {
  return (
    <Link
      href={ROUTES.PROJECTS}
      onClick={onNavigate}
      className={clsx(
        "h-16 flex items-center border-b border-outline-subtle shrink-0",
        expanded ? "gap-2 px-3 py-2" : "justify-center px-2 py-2",
      )}
    >
      <div className="border border-outline-subtle rounded-b-full items-center justify-center flex shrink-0">
        <Handshake />
      </div>
      {expanded && (
        <div>
          <p className="text-text-primary font-bold font-sans text-lg">
            KerjainYu
          </p>
          <p className="text-text-secondary font-sans">Workspace</p>
        </div>
      )}
    </Link>
  );
}

/** Primary nav list. Shared between the rail (icon-only) and full sidebar. */
function PrimaryNav({
  expanded,
  pathname,
  onNavigate,
}: {
  expanded: boolean;
  pathname: string;
  onNavigate?: () => void;
}) {
  return (
    <nav aria-label="Main" className="border-b border-outline-subtle py-2">
      <ul className={clsx("flex flex-col gap-3", !expanded && "items-center")}>
        {navItems.map(({ href, label, icon: Icon }) => {
          const isActive = pathname === href;
          return (
            <li key={href} className={expanded ? undefined : "w-full"}>
              <Link
                href={href}
                onClick={onNavigate}
                aria-current={isActive ? "page" : undefined}
                aria-label={expanded ? undefined : label}
                title={expanded ? undefined : label}
                className={clsx(
                  "relative flex items-center rounded-md text-lg overflow-hidden",
                  expanded
                    ? "gap-2 px-3 py-2"
                    : "mx-auto justify-center size-11",
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
                <Icon className="relative z-10 shrink-0" />
                {expanded && <span className="relative z-10">{label}</span>}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

const PROJECT_NAV_ITEMS = [
  {
    key: "taskboard",
    label: "Task Board",
    icon: LayoutGrid,
    route: ROUTES.PROJECT_TASKBOARD,
  },
  { key: "team", label: "Team", icon: Users, route: ROUTES.PROJECT_TEAM },
  {
    key: "calendar",
    label: "Calendar",
    icon: Calendar,
    route: ROUTES.PROJECT_CALENDAR,
  },
  {
    key: "files",
    label: "Files",
    icon: Paperclip,
    route: ROUTES.PROJECT_FILES,
  },
  {
    key: "resources",
    label: "Resources",
    icon: ExternalLink,
    route: ROUTES.PROJECT_RESOURCES,
  },
] as const;

const PROJECT_TITLES: Record<string, string> = {
  "1": "Website Redesign Sprint",
  "2": "Mobile App Launch",
};

function ProjectNav({
  expanded,
  projectId,
  pathname,
  onNavigate,
}: {
  expanded: boolean;
  projectId: string;
  pathname: string;
  onNavigate?: () => void;
}) {
  const projectTitle = PROJECT_TITLES[projectId] ?? "Project";

  if (!expanded) {
    return null;
  }

  return (
    <div className="border-b border-outline-subtle py-3 px-2">
      <p className="px-3 pb-2 text-xs font-semibold text-text-muted truncate">
        {projectTitle}
      </p>
      <ul className="flex flex-col gap-1">
        {PROJECT_NAV_ITEMS.map(({ key, label, icon: Icon, route }) => {
          const href = route(projectId);
          const isActive = pathname === href;
          return (
            <li key={key}>
              <Link
                href={href}
                onClick={onNavigate}
                aria-current={isActive ? "page" : undefined}
                className={clsx(
                  "relative flex items-center gap-2 pl-6 pr-3 py-1.5 rounded-md text-sm overflow-hidden",
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
                <Icon className="relative z-10 shrink-0 size-4" />
                <span className="relative z-10">{label}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

/** Secondary nav list (Help Center, Archive). `compact` renders icon-only for the rail. */
function SecondaryNav({
  compact = false,
  onNavigate,
}: {
  compact?: boolean;
  onNavigate?: () => void;
}) {
  return (
    <nav aria-label="Secondary" className="mt-3 px-2">
      <ul className={clsx("flex flex-col gap-3", compact && "items-center")}>
        {secondaryItems.map(({ href, label, icon: Icon }) => (
          <li key={label} className={compact ? "w-full" : undefined}>
            <Link
              href={href}
              onClick={onNavigate}
              aria-label={compact ? label : undefined}
              title={compact ? label : undefined}
              className={clsx(
                "flex items-center rounded-md text-lg",
                compact ? "mx-auto justify-center size-11" : "gap-2 px-3 py-2",
                "text-text-secondary hover:text-text-primary",
                "transition-colors duration-200 ease-in-out",
              )}
            >
              <Icon className="size-5 shrink-0" />
              {!compact && <span>{label}</span>}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}

function InviteButton({
  compact,
  onClick,
}: {
  compact: boolean;
  onClick: () => void;
}) {
  return (
    <div className={clsx("mt-3", compact ? "px-2" : "px-4")}>
      <button
        type="button"
        onClick={onClick}
        aria-label="Invite Member"
        title={compact ? "Invite Member" : undefined}
        className={clsx(
          "group flex items-center justify-center gap-2 w-full h-10 rounded-md border border-outline",
          "bg-surface-container text-text-primary cursor-pointer",
          "transition-colors duration-200 ease-in-out",
          "hover:border-tertiary hover:text-tertiary-foreground",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-tertiary focus-visible:ring-offset-2",
        )}
      >
        <UserRoundPlus className="size-4 shrink-0 transition-colors duration-200 ease-in-out text-secondary group-hover:text-primary" />
        {!compact && (
          <span className="text-sm transition-colors duration-200 ease-in-out font-medium font-sans text-secondary group-hover:text-primary">
            Invite Member
          </span>
        )}
      </button>
    </div>
  );
}

/** Full labeled sidebar body — reused by the desktop rail and the mobile/tablet drawer. */
function SidebarBody({
  pathname,
  projectId,
  onNavigate,
}: {
  pathname: string;
  projectId?: string;
  onNavigate?: () => void;
}) {
  const [inviteOpen, setInviteOpen] = useState(false);

  const currentProject = projectId
    ? { id: Number(projectId), title: PROJECT_TITLES[projectId] ?? "Project" }
    : undefined;

  return (
    <div className="flex flex-col h-full min-h-0">
      <div className="px-2">
        <BrandMark expanded onNavigate={onNavigate} />
        <Container>
          <PrimaryNav expanded pathname={pathname} onNavigate={onNavigate} />
        </Container>
      </div>

      {projectId && (
        <ProjectNav
          expanded
          projectId={projectId}
          pathname={pathname}
          onNavigate={onNavigate}
        />
      )}

      <div className="flex-1" />

      <InviteButton compact={false} onClick={() => setInviteOpen(true)} />

      <SecondaryNav onNavigate={onNavigate} />

      <InviteMemberModal
        open={inviteOpen}
        onClose={() => setInviteOpen(false)}
        currentProject={currentProject}
        projects={userProjects}
      />
    </div>
  );
}

function RailBody({
  pathname,
  projectId,
}: {
  pathname: string;
  projectId?: string;
}) {
  const [inviteOpen, setInviteOpen] = useState(false);

  const currentProject = projectId
    ? { id: Number(projectId), title: PROJECT_TITLES[projectId] ?? "Project" }
    : undefined;

  return (
    <div className="flex flex-col h-full min-h-0">
      <BrandMark expanded={false} />
      <PrimaryNav expanded={false} pathname={pathname} />

      <div className="flex-1" />

      <InviteButton compact onClick={() => setInviteOpen(true)} />
      <SecondaryNav compact />

      <InviteMemberModal
        open={inviteOpen}
        onClose={() => setInviteOpen(false)}
        currentProject={currentProject}
        projects={userProjects}
      />
    </div>
  );
}

export default function Sidebar() {
  const pathname = usePathname();
  const params = useParams<{ projectId?: string }>();
  const projectId =
    typeof params?.projectId === "string" ? params.projectId : undefined;
  const { isOpen, close } = useSidebar();

  return (
    <>
      <aside
        className={clsx(
          "hidden lg:flex lg:flex-col",
          "fixed inset-y-0 left-0 z-30 w-60 overflow-y-auto",
          "bg-surface border-r border-outline",
        )}
      >
        <SidebarBody pathname={pathname} projectId={projectId} />
      </aside>

      {/* icon rail */}
      <aside
        aria-label="Sidebar (collapsed)"
        className={clsx(
          "hidden md:flex lg:hidden flex-col",
          "fixed inset-y-0 left-0 z-30 w-16 overflow-y-auto",
          "bg-surface border-r border-outline",
        )}
      >
        <RailBody pathname={pathname} projectId={projectId} />
      </aside>

     {/* hamburger menu */}
      <div
        aria-hidden={!isOpen}
        className={clsx(
          "fixed inset-0 z-40 lg:hidden",
          isOpen ? "pointer-events-auto" : "pointer-events-none",
        )}
      >
        <button
          type="button"
          aria-label="Close menu"
          onClick={close}
          className={clsx(
            "absolute inset-0 bg-neutral/70 transition-opacity duration-200 ease-in-out",
            isOpen ? "opacity-100" : "opacity-0",
          )}
        />

        <aside
          aria-label="Sidebar"
          className={clsx(
            "absolute inset-y-0 left-0 flex w-72 max-w-[85vw] flex-col overflow-y-auto",
            "bg-surface border-r border-outline",
            "transition-transform duration-300 ease-out",
            isOpen ? "translate-x-0" : "-translate-x-full",
          )}
        >
          <div className="flex items-center justify-end px-2 pt-2">
            <button
              type="button"
              onClick={close}
              aria-label="Close menu"
              className={clsx(
                "flex items-center justify-center size-9 rounded-md text-text-secondary",
                "hover:text-text-primary transition-colors duration-150 ease-in-out cursor-pointer",
              )}
            >
              <X className="size-5" />
            </button>
          </div>
          <SidebarBody
            pathname={pathname}
            projectId={projectId}
            onNavigate={close}
          />
        </aside>
      </div>
    </>
  );
}
