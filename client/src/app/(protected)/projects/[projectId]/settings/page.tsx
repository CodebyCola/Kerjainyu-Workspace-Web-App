"use client";

import { ShieldAlert } from "lucide-react";
import { use, useCallback, useEffect, useState } from "react";
import Container from "@/components/layout/Container";
import { ArchiveSection } from "@/components/settings/ArchiveSection";
import { DangerZone } from "@/components/settings/DangerZone";
import { GeneralSettingsForm } from "@/components/settings/GeneralSettingsForm";
import {
  getProjectById,
  type Project,
} from "@/service/project/project.service";
import { getErrorMessage } from "@/utils/Errors";

type LoadStatus = "loading" | "error" | "ready";

export default function SettingsPage({
  params,
}: {
  params: Promise<{ projectId: string }>;
}) {
  const { projectId } = use(params);

  const [project, setProject] = useState<Project | null>(null);
  const [status, setStatus] = useState<LoadStatus>("loading");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    setStatus("loading");
    setErrorMessage(null);
    try {
      const projectData = await getProjectById(projectId);
      setProject(projectData);
      setStatus("ready");
    } catch (err) {
      setErrorMessage(getErrorMessage(err));
      setStatus("error");
    }
  }, [projectId]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const isLeader = project?.role === "leader";

  return (
    <Container>
      <div className="flex flex-col gap-1 mb-6 px-1">
        <h1 className="text-2xl font-bold text-text-primary">Settings</h1>
        <span className="text-sm text-text-secondary">
          {project?.title ?? (status === "loading" ? "Loading..." : "")}
        </span>
      </div>

      {status === "loading" && (
        <p className="text-sm text-text-muted px-1">Loading settings...</p>
      )}

      {status === "error" && (
        <div className="flex flex-col items-start gap-2 px-1">
          <p className="text-sm text-danger">
            {errorMessage ?? "Could not load settings."}
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

      {status === "ready" && project && !isLeader && (
        <div className="flex flex-col items-center justify-center gap-3 text-center bg-surface border border-outline-subtle rounded-lg py-16 px-6">
          <div className="flex items-center justify-center size-12 rounded-full bg-surface-container text-text-secondary">
            <ShieldAlert className="size-6" aria-hidden="true" />
          </div>
          <div className="flex flex-col gap-1">
            <p className="text-sm font-medium text-text-primary">
              Only the project leader can change settings
            </p>
            <p className="text-sm text-text-secondary max-w-sm">
              You're a member of this project, not the leader — settings here
              are locked to keep things like the swap policy and archive state
              consistent for everyone.
            </p>
          </div>
        </div>
      )}

      {status === "ready" && project && isLeader && (
        <div className="flex flex-col gap-6 max-w-2xl">
          <GeneralSettingsForm project={project} onUpdated={setProject} />
          <ArchiveSection project={project} onUpdated={setProject} />
          <DangerZone project={project} />
        </div>
      )}
    </Container>
  );
}
