"use client";

import { FolderPlus, Plus } from "lucide-react";
import { useState } from "react";
import Container from "@/components/layout/Container";
import { CreateProjectModal } from "@/Components/projects/CreateProjectModal";
import {
  ProjectCard,
  type ProjectStatus,
} from "@/Components/projects/ProjectCard";

interface ProjectListItem {
  id: number;
  title: string;
  role: "leader" | "member";
  status: ProjectStatus;
  memberCount: number;
  deadlineLabel?: string;
}

// Demo data — in production this comes from GET /projects?role=..., the
// same list endpoint ProjectController.list / ProjectService.getProjectsByUser
// already expose on the server.
const initialProjects: ProjectListItem[] = [
  {
    id: 1,
    title: "Website Redesign 2024",
    role: "leader",
    status: "ongoing",
    memberCount: 8,
    deadlineLabel: "Due Oct 20",
  },
  {
    id: 2,
    title: "Mobile App Beta Launch",
    role: "member",
    status: "ongoing",
    memberCount: 14,
    deadlineLabel: "Due Nov 01",
  },
];

export default function Projects() {
  const [projects, setProjects] = useState<ProjectListItem[]>(initialProjects);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const isEmpty = projects.length === 0;

  function handleCreated(project: { id: number; title: string }) {
    setProjects((prev) => [
      {
        id: project.id,
        title: project.title,
        role: "leader",
        status: "ongoing",
        memberCount: 1,
      },
      ...prev,
    ]);
    setIsModalOpen(false);
  }

  return (
    <Container>
      <div className="flex items-start justify-between mb-6 px-1">
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl font-bold text-text-primary">
            Your projects
          </h1>
          <span className="text-sm text-text-secondary">
            Projects you lead or collaborate on
          </span>
        </div>

        {!isEmpty && (
          <button
            type="button"
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 text-sm font-medium px-4 py-2 rounded-md bg-tertiary text-on-tertiary hover:opacity-90 transition-opacity duration-150 ease-in-out cursor-pointer"
          >
            <Plus className="size-4" aria-hidden="true" />
            New project
          </button>
        )}
      </div>

      {isEmpty ? (
        <div className="flex flex-col items-center justify-center text-center gap-4 py-24 border border-dashed border-outline-subtle rounded-lg">
          <span className="flex items-center justify-center size-12 rounded-full bg-surface-container text-text-muted">
            <FolderPlus className="size-6" aria-hidden="true" />
          </span>
          <div className="flex flex-col gap-1">
            <p className="text-sm font-semibold text-text-primary">
              No projects yet
            </p>
            <p className="text-xs text-text-muted max-w-xs">
              Create your first project to start assigning tasks and
              collaborating with your team.
            </p>
          </div>
          <button
            type="button"
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 text-sm font-medium px-4 py-2 rounded-md bg-tertiary text-on-tertiary hover:opacity-90 transition-opacity duration-150 ease-in-out cursor-pointer"
          >
            <Plus className="size-4" aria-hidden="true" />
            Create project
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {projects.map((project) => (
            <ProjectCard
              key={project.id}
              title={project.title}
              role={project.role}
              status={project.status}
              memberCount={project.memberCount}
              deadlineLabel={project.deadlineLabel}
              onClick={() => console.log("open project", project.id)}
            />
          ))}
        </div>
      )}

      <CreateProjectModal
        open={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onCreated={handleCreated}
      />
    </Container>
  );
}
