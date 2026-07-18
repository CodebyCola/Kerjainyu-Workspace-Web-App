"use client";

import clsx from "clsx";
import { Plus, Search } from "lucide-react";
import { use, useCallback, useEffect, useMemo, useState } from "react";
import Container from "@/components/layout/Container";
import {
  AddResourceModal,
  type AddResourceValues,
} from "@/components/resources/AddResourceLinkModal";
import { ResourceRow } from "@/components/resources/ResourceRow";
import {
  getProjectById,
  type Project,
} from "@/service/project/project.service";
import {
  createProjectLink,
  getProjectLinks,
  type ResourceLink,
} from "@/service/resources/resources.service";
import type { ResourceCategory } from "@/service/resources/resources.validator";
import { getErrorMessage } from "@/utils/Errors";

const CATEGORY_LABELS: Record<ResourceCategory, string> = {
  design: "Design",
  development: "Development",
  docs: "Docs & references",
  other: "Other",
};

const CATEGORY_ORDER: ResourceCategory[] = [
  "design",
  "development",
  "docs",
  "other",
];

type LoadStatus = "loading" | "error" | "ready";

function hostnameOf(url: string): string {
  try {
    return new URL(url).hostname;
  } catch {
    return url;
  }
}

export default function Resources({
  params,
}: {
  params: Promise<{ projectId: string }>;
}) {
  const { projectId } = use(params);

  const [project, setProject] = useState<Project | null>(null);
  const [links, setLinks] = useState<ResourceLink[]>([]);
  const [status, setStatus] = useState<LoadStatus>("loading");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [addOpen, setAddOpen] = useState(false);

  const loadData = useCallback(async () => {
    setStatus("loading");
    setErrorMessage(null);
    try {
      const [projectData, linksData] = await Promise.all([
        getProjectById(projectId),
        getProjectLinks(projectId),
      ]);
      setProject(projectData);
      setLinks(linksData);
      setStatus("ready");
    } catch (err) {
      setErrorMessage(getErrorMessage(err));
      setStatus("error");
    }
  }, [projectId]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const filteredGroups = useMemo(() => {
    const q = query.trim().toLowerCase();
    const matches = links.filter(
      (link) =>
        !q ||
        link.label.toLowerCase().includes(q) ||
        hostnameOf(link.url).toLowerCase().includes(q),
    );

    return CATEGORY_ORDER.map((category) => ({
      category,
      links: matches.filter((link) => link.category === category),
    })).filter((group) => group.links.length > 0);
  }, [links, query]);

  async function handleAddResource(values: AddResourceValues) {
    try {
      const link = await createProjectLink(projectId, values);
      setLinks((prev) => [link, ...prev]);
      return { ok: true as const };
    } catch (err) {
      return { ok: false as const, error: getErrorMessage(err) };
    }
  }

  return (
    <Container>
      <div className="flex flex-wrap items-start justify-between gap-4 mb-6 px-1">
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl font-bold text-text-primary">Resources</h1>
          <span className="text-sm text-text-secondary">
            {project?.title ?? (status === "loading" ? "Loading..." : "")}
          </span>
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

      {status === "loading" && (
        <p className="text-sm text-text-muted px-1">Loading resources...</p>
      )}

      {status === "error" && (
        <div className="flex flex-col items-start gap-2 px-1">
          <p className="text-sm text-danger">
            {errorMessage ?? "Could not load resources."}
          </p>
          <button
            type="button"
            onClick={loadData}
            className="text-xs font-medium text-tertiary hover:opacity-80 transition-opacity duration-150 ease-in-out cursor-pointer"
          >
            Try again
          </button>
        </div>
      )}

      {status === "ready" && (
        <div className="flex flex-col gap-6">
          {filteredGroups.length === 0 ? (
            <p className="text-sm text-text-muted px-1">
              {links.length === 0
                ? "No resources yet. Add the first one above."
                : "No resources match your search."}
            </p>
          ) : (
            filteredGroups.map((group) => (
              <div key={group.category} className="flex flex-col">
                <p className="text-sm font-semibold text-text-primary mb-1 px-1">
                  {CATEGORY_LABELS[group.category]}
                </p>

                <div className="bg-surface border border-outline-subtle rounded-lg divide-y divide-outline-subtle px-3">
                  {group.links.map((link) => (
                    <ResourceRow
                      key={link.id}
                      title={link.label}
                      url={link.url}
                      domain={hostnameOf(link.url)}
                      addedBy={link.addedByUsername ?? "Unknown"}
                    />
                  ))}
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </Container>
  );
}
