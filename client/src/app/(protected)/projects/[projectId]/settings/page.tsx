"use client";

import Container from "@/components/layout/Container";
import {
  getProjectById,
  type Project,
} from "@/service/project/project.service";
import { use, useState, useCallback, useEffect } from "react";
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

  return (
    <>
      <Container>
        <div className="flex items-start justify-between mb-6 px-1">
          <div className="flex flex-col gap-1">
            <h1 className="text-2xl font-bold text-text-primary">Settings</h1>
            <span className="text-sm text-text-secondary">
              {project?.title}
            </span>
          </div>
        </div>
      </Container>
    </>
  );
}
