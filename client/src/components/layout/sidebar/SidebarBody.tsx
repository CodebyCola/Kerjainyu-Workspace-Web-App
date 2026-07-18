"use client";

import { InviteMemberModal } from "@/components/team/InviteMemberModal";
import Container from "@/components/layout/Container";
import { BrandMark } from "@/components/layout/sidebar/BrandMark";
import { PrimaryNav } from "@/components/layout/sidebar/PrimaryNav";
import { ProjectNav } from "@/components/layout/sidebar/ProjectNav";
import { SecondaryNav } from "@/components/layout/sidebar/SecondaryNav";
import { InviteButton } from "@/components/layout/sidebar/InviteButton";
import { useInviteModal } from "@/hooks/useInviteModal";
import { useProject } from "@/hooks/useProject";
import { useUserProjects } from "@/hooks/useUserProjects";

/** Full labeled sidebar body — reused by the desktop sidebar and the mobile/tablet drawer. */
export function SidebarBody({
  pathname,
  projectId,
  onNavigate,
}: {
  pathname: string;
  projectId?: string;
  onNavigate?: () => void;
}) {
  const { project } = useProject(projectId);
  const { projects: userProjects } = useUserProjects();
  const { inviteOpen, openInvite, closeInvite, currentProject } =
    useInviteModal(project);

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
          projectTitle={project?.title ?? "Project"}
          pathname={pathname}
          onNavigate={onNavigate}
        />
      )}

      <div className="flex-1" />

      <InviteButton compact={false} onClick={openInvite} />

      <SecondaryNav onNavigate={onNavigate} />

      <InviteMemberModal
        open={inviteOpen}
        onClose={closeInvite}
        currentProject={currentProject}
        projects={userProjects}
      />
    </div>
  );
}
