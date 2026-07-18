"use client";

import { useEffect, useState } from "react";
import { getProjects } from "@/service/project/project.service";
import type { ProjectOption } from "@/components/team/InviteMemberModal";

/** Fetches the current user's projects for the "Invite Member" modal's project dropdown. */
export function useUserProjects(): {
  projects: ProjectOption[];
  isLoading: boolean;
} {
  const [projects, setProjects] = useState<ProjectOption[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    getProjects()
      .then((data) => {
        if (!cancelled) {
          setProjects(data.map((p) => ({ id: p.id, title: p.title })));
        }
      })
      .catch(() => {
        if (!cancelled) setProjects([]);
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  return { projects, isLoading };
}
