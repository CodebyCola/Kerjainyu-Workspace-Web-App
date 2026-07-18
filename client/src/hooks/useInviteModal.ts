"use client";

import { useState } from "react";
import type { Project } from "@/service/project/project.service";

export function useInviteModal(project?: Project | null) {
  const [inviteOpen, setInviteOpen] = useState(false);

  const currentProject = project
    ? { id: project.id, title: project.title }
    : undefined;

  return {
    inviteOpen,
    openInvite: () => setInviteOpen(true),
    closeInvite: () => setInviteOpen(false),
    currentProject,
  };
}
