"use client";

import clsx from "clsx";
import { LifeBuoy, Mail, Search } from "lucide-react";
import { useMemo, useState } from "react";
import { FaqItem } from "@/components/help/FaqItem";
import Container from "@/components/layout/Container";

// Demo content. In production this would come from a help_articles
// table (or a static CMS export) grouped by category, the same shape
// AttachmentGroup uses to group files by task in app/files/page.tsx.
interface FaqEntry {
  id: string;
  question: string;
  answer: string;
}

interface FaqGroup {
  category: string;
  entries: FaqEntry[];
}

const faqGroups: FaqGroup[] = [
  {
    category: "Getting started",
    entries: [
      {
        id: "q1",
        question: "How do I create a new project?",
        answer:
          'Go to Projects in the sidebar and click "New project". You\'ll be set as the project leader automatically, and can invite members right after.',
      },
      {
        id: "q2",
        question: "What's the difference between a leader and a member?",
        answer:
          "Leaders can edit project settings, archive or delete the project, and manage members. Members can claim tasks, submit work, and comment, but can't change project-level settings.",
      },
    ],
  },
  {
    category: "Tasks & submissions",
    entries: [
      {
        id: "q3",
        question: "How do I claim a task?",
        answer:
          'Open the Task Board, find a task marked "Unclaimed", and click it to claim it. Once claimed, it moves to your ownership and shows up under My Tasks.',
      },
      {
        id: "q4",
        question: "Can I resubmit after a task is sent back for revision?",
        answer:
          'Yes. If a submission is marked "In revision", you can attach updated files or links and resubmit from the same task — your previous submission stays visible in its history.',
      },
      {
        id: "q5",
        question: "Where do my uploaded files go?",
        answer:
          "Every attachment you submit on a task shows up grouped by task under Files, so you and your teammates can find submitted work without digging through comments.",
      },
    ],
  },
  {
    category: "Team & invites",
    entries: [
      {
        id: "q6",
        question: "How do I invite someone to a project?",
        answer:
          'Use the "Invite member" button in the sidebar or on the Team page. You can invite by username directly, or generate a shareable invite link with an optional expiry.',
      },
      {
        id: "q7",
        question: "An invited member isn't showing as active — why?",
        answer:
          'They show as "Invited" until they accept. You can resend the invite from their row on the Team page if it\'s been a while.',
      },
    ],
  },
];

export default function HelpCenter() {
  const [query, setQuery] = useState("");
  const [openId, setOpenId] = useState<string | null>(null);

  const filteredGroups = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return faqGroups;

    return faqGroups
      .map((group) => ({
        ...group,
        entries: group.entries.filter(
          (entry) =>
            entry.question.toLowerCase().includes(q) ||
            entry.answer.toLowerCase().includes(q),
        ),
      }))
      .filter((group) => group.entries.length > 0);
  }, [query]);

  return (
    <Container>
      <div className="flex flex-wrap items-start justify-between gap-4 mb-6 px-1">
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl font-bold text-text-primary">Help Center</h1>
          <span className="text-sm text-text-secondary">
            Answers, guides, and how KerjainYu works
          </span>
        </div>

        <div className="relative">
          <Search
            className="absolute left-2.5 top-1/2 -translate-y-1/2 size-3.5 text-text-muted"
            aria-hidden="true"
          />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search help articles..."
            className="bg-surface border border-outline-subtle rounded-md pl-8 pr-3 py-1.5 text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:border-tertiary w-full sm:w-64"
          />
        </div>
      </div>

      <div className="flex flex-col gap-6">
        {filteredGroups.length === 0 ? (
          <p className="text-sm text-text-muted px-1">
            No articles match your search.
          </p>
        ) : (
          filteredGroups.map((group) => (
            <div key={group.category} className="flex flex-col">
              <p className="text-sm font-semibold text-text-primary mb-1 px-1">
                {group.category}
              </p>

              <div className="bg-surface border border-outline-subtle rounded-lg divide-y divide-outline-subtle px-3">
                {group.entries.map((entry) => (
                  <FaqItem
                    key={entry.id}
                    question={entry.question}
                    answer={entry.answer}
                    isOpen={openId === entry.id}
                    onToggle={() =>
                      setOpenId((prev) => (prev === entry.id ? null : entry.id))
                    }
                  />
                ))}
              </div>
            </div>
          ))
        )}
      </div>

      <div
        className={clsx(
          "mt-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4",
          "bg-surface-container border border-outline-subtle rounded-lg px-5 py-4",
        )}
      >
        <div className="flex items-center gap-3">
          <span
            className="flex items-center justify-center size-9 rounded-md bg-tertiary/10 text-tertiary shrink-0"
            aria-hidden="true"
          >
            <LifeBuoy className="size-4.5" />
          </span>
          <div className="flex flex-col gap-0.5">
            <p className="text-sm font-semibold text-text-primary">
              Still stuck?
            </p>
            <p className="text-xs text-text-muted">
              Can't find what you're looking for? Reach out to support.
            </p>
          </div>
        </div>

        <a
          href="mailto:support@kerjainyu.app"
          className={clsx(
            "flex items-center gap-2 text-sm font-medium px-4 py-2 rounded-md shrink-0",
            "bg-tertiary text-on-tertiary hover:opacity-90 transition-opacity duration-150 ease-in-out cursor-pointer",
          )}
        >
          <Mail className="size-4" aria-hidden="true" />
          Contact support
        </a>
      </div>
    </Container>
  );
}
