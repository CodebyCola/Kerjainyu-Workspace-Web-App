"use client";

import { Link2, Plus } from "lucide-react";
import { useState } from "react";
import Container from "@/components/layout/Container";
import { AddResourceLinkModal } from "@/components/resources/AddResourceLinkModal";
import { ResourceLinkRow } from "@/components/resources/ResourceLinkRow";

interface ResourceLink {
  id: string;
  label: string;
  url: string;
  addedBy: string;
  addedByInitials: string;
}

// Demo data — in production this is GET /projects/:id/links, the
// project_links table joined with users for the "added by" name.
const initialLinks: ResourceLink[] = [
  {
    id: "1",
    label: "PKM Proposal Draft",
    url: "https://docs.google.com/document/d/1aBcD/edit",
    addedBy: "Maya Kartika",
    addedByInitials: "MK",
  },
  {
    id: "2",
    label: "Budget Tracker",
    url: "https://docs.google.com/spreadsheets/d/2eFgH/edit",
    addedBy: "Julian D.",
    addedByInitials: "JD",
  },
  {
    id: "3",
    label: "Reference Papers Folder",
    url: "https://drive.google.com/drive/folders/3iJkL",
    addedBy: "Maya Kartika",
    addedByInitials: "MK",
  },
];

export default function Recources() {
  const [links, setLinks] = useState<ResourceLink[]>(initialLinks);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const isEmpty = links.length === 0;

  function handleCreated(link: { id: string; label: string; url: string }) {
    setLinks((prev) => [
      {
        id: link.id,
        label: link.label,
        url: link.url,
        addedBy: "You",
        addedByInitials: "Y",
      },
      ...prev,
    ]);
    setIsModalOpen(false);
  }

  return (
    <Container>
      <div className="flex items-start justify-between mb-6 px-1">
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl font-bold text-text-primary">Resources</h1>
          <span className="text-sm text-text-secondary">
            Workspace Tools & References
          </span>
        </div>

        {!isEmpty && (
          <button
            type="button"
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 text-sm font-medium px-4 py-2 rounded-md bg-tertiary text-on-tertiary hover:opacity-90 transition-opacity duration-150 ease-in-out cursor-pointer"
          >
            <Plus className="size-4" aria-hidden="true" />
            Add link
          </button>
        )}
      </div>

      {isEmpty ? (
        <div className="flex flex-col items-center justify-center text-center gap-4 py-24 border border-dashed border-outline-subtle rounded-lg">
          <span className="flex items-center justify-center size-12 rounded-full bg-surface-container text-text-muted">
            <Link2 className="size-6" aria-hidden="true" />
          </span>
          <div className="flex flex-col gap-1">
            <p className="text-sm font-semibold text-text-primary">
              No links added yet
            </p>
            <p className="text-xs text-text-muted max-w-xs">
              Add links to your team&apos;s Figma, GitHub, or shared docs so
              everyone can find them in one place.
            </p>
          </div>
          <button
            type="button"
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 text-sm font-medium px-4 py-2 rounded-md bg-tertiary text-on-tertiary hover:opacity-90 transition-opacity duration-150 ease-in-out cursor-pointer"
          >
            <Plus className="size-4" aria-hidden="true" />
            Add link
          </button>
        </div>
      ) : (
        <div className="bg-surface border border-outline-subtle rounded-lg divide-y divide-outline-subtle px-4">
          {links.map((link) => (
            <ResourceLinkRow
              key={link.id}
              label={link.label}
              url={link.url}
              addedBy={link.addedBy}
              addedByInitials={link.addedByInitials}
              onOpen={() =>
                window.open(link.url, "_blank", "noopener,noreferrer")
              }
              onMenuClick={() => console.log("menu", link.id)}
            />
          ))}
        </div>
      )}

      <AddResourceLinkModal
        open={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onCreated={handleCreated}
      />
    </Container>
  );
}
