"use client";

import clsx from "clsx";
import { Plus, Search } from "lucide-react";
import { use, useMemo, useState } from "react";
import Container from "@/components/layout/Container";
import {
  AddResourceModal,
  type ResourceCategory,
} from "@/Components/resources/AddResourceLinkModal";
import { ResourceRow } from "@/components/resources/ResourceRow";

// Demo lookup, same shape as the other project-scoped pages.
const PROJECT_TITLES: Record<string, string> = {
  "1": "Website Redesign Sprint",
  "2": "Mobile App Launch",
};

const CATEGORY_LABELS: Record<ResourceCategory, string> = {
  design: "Design",
  development: "Development",
  docs: "Docs & references",
  other: "Other",
};

// Demo data shaped like project_links rows (server/src/database/types.ts):
// label, url, category, added_by — unlike Files, resources aren't tied
// to a specific task, so they're grouped by category instead of by task
// status. See the Resources-vs-Files design note: resources are a
// standing collection of references, not a record of submitted work.
interface Resource {
  id: string;
  label: string;
  url: string;
  domain: string;
  category: ResourceCategory;
  addedBy: string;
}

const resources: Resource[] = [
  {
    id: "r1",
    label: "Design system tokens (Figma)",
    url: "https://figma.com",
    domain: "figma.com",
    category: "design",
    addedBy: "Maya Kartika",
  },
  {
    id: "r2",
    label: "Color contrast checker",
    url: "https://webaim.org/resources/contrastchecker",
    domain: "webaim.org",
    category: "design",
    addedBy: "Julian D.",
  },
  {
    id: "r3",
    label: "Tailwind CSS documentation",
    url: "https://tailwindcss.com/docs",
    domain: "tailwindcss.com",
    category: "development",
    addedBy: "Dimas P.",
  },
  {
    id: "r4",
    label: "Next.js App Router guide",
    url: "https://nextjs.org/docs",
    domain: "nextjs.org",
    category: "development",
    addedBy: "Maya Kartika",
  },
  {
    id: "r5",
    label: "Project brief (Google Docs)",
    url: "https://docs.google.com",
    domain: "docs.google.com",
    category: "docs",
    addedBy: "Maya Kartika",
  },
];

const CATEGORY_ORDER: ResourceCategory[] = [
  "design",
  "development",
  "docs",
  "other",
];

export default function Resources({
  params,
}: {
  params: Promise<{ projectId: string }>;
}) {
  const { projectId } = use(params);
  const projectTitle = PROJECT_TITLES[projectId] ?? "Unknown project";
  const [query, setQuery] = useState("");
  const [items, setItems] = useState<Resource[]>(resources);
  const [addOpen, setAddOpen] = useState(false);

  const filteredGroups = useMemo(() => {
    const q = query.trim().toLowerCase();
    const matches = items.filter(
      (resource) =>
        !q ||
        resource.label.toLowerCase().includes(q) ||
        resource.domain.toLowerCase().includes(q),
    );

    return CATEGORY_ORDER.map((category) => ({
      category,
      resources: matches.filter((r) => r.category === category),
    })).filter((group) => group.resources.length > 0);
  }, [items, query]);

  async function handleAddResource(values: {
    label: string;
    url: string;
    category: ResourceCategory;
  }) {
    // Demo: this stands in for POST /projects/:projectId/links (see
    // server/src/routes/project-link.routes.ts). The server enforces a
    // unique label per project and throws a 409 on duplicates — mirrored
    // here so the form's error state is exercised the same way.
    const isDuplicate = items.some(
      (r) => r.label.toLowerCase() === values.label.toLowerCase(),
    );
    if (isDuplicate) {
      return { ok: false as const, error: "This resource already exists." };
    }

    const newResource: Resource = {
      id: crypto.randomUUID(),
      label: values.label,
      url: values.url,
      domain: new URL(values.url).hostname,
      category: values.category,
      addedBy: "You",
    };
    setItems((prev) => [...prev, newResource]);
    return { ok: true as const };
  }

  return (
    <Container>
      <div className="flex flex-wrap items-start justify-between gap-4 mb-6 px-1">
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl font-bold text-text-primary">Resources</h1>
          <span className="text-sm text-text-secondary">{projectTitle}</span>
        </div>

        <div className="flex items-center gap-3">
          <div className="relative">
            <Search
              className="absolute left-2.5 top-1/2 -translate-y-1/2 size-3.5 text-text-muted"
              aria-hidden="true"
            />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search resources..."
              className="bg-surface border border-outline-subtle rounded-md pl-8 pr-3 py-1.5 text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:border-tertiary"
            />
          </div>

          <button
            type="button"
            onClick={() => setAddOpen(true)}
            className={clsx(
              "flex items-center gap-2 text-sm font-medium px-4 py-2 rounded-md shrink-0",
              "bg-tertiary text-on-tertiary hover:opacity-90 transition-opacity duration-150 ease-in-out cursor-pointer",
            )}
          >
            <Plus className="size-4" aria-hidden="true" />
            Add resource
          </button>
        </div>
      </div>

      <AddResourceModal
        open={addOpen}
        onClose={() => setAddOpen(false)}
        onSubmit={handleAddResource}
      />

      <div className="flex flex-col gap-6">
        {filteredGroups.length === 0 ? (
          <p className="text-sm text-text-muted px-1">
            No resources match your search.
          </p>
        ) : (
          filteredGroups.map((group) => (
            <div key={group.category} className="flex flex-col">
              <p className="text-sm font-semibold text-text-primary mb-1 px-1">
                {CATEGORY_LABELS[group.category]}
              </p>

              <div className="bg-surface border border-outline-subtle rounded-lg divide-y divide-outline-subtle px-3">
                {group.resources.map((resource) => (
                  <ResourceRow
                    key={resource.id}
                    title={resource.label}
                    url={resource.url}
                    domain={resource.domain}
                    addedBy={resource.addedBy}
                  />
                ))}
              </div>
            </div>
          ))
        )}
      </div>
    </Container>
  );
}
