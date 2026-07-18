"use client";

import { BrandMark } from "@/components/layout/sidebar/BrandMark";
import { PrimaryNav } from "@/components/layout/sidebar/PrimaryNav";
import { SecondaryNav } from "@/components/layout/sidebar/SecondaryNav";
import { InviteButton } from "@/components/layout/sidebar/InviteButton";
import { useInviteModal } from "@/hooks/useInviteModal";
import { useProject } from "@/hooks/useProject";
import { useUserProjects } from "@/hooks/useUserProjects";
import { InviteMemberModal } from "@/components/team/InviteMemberModal";

/** Icon-only collapsed rail shown between md and lg breakpoints. */
export function RailBody({
  pathname,
  projectId,
}: {
  pathname: string;
  projectId?: string;
}) {
  const { project } = useProject(projectId);
  const { projects: userProjects } = useUserProjects();
  const { inviteOpen, openInvite, closeInvite, currentProject } =
    useInviteModal(project);

  return (
    <div className="flex flex-col h-full min-h-0">
      <BrandMark expanded={false} />
      <PrimaryNav expanded={false} pathname={pathname} />

      <div className="flex-1" />

      <InviteButton compact onClick={openInvite} />
      <SecondaryNav compact />

      <InviteMemberModal
        open={inviteOpen}
        onClose={closeInvite}
        currentProject={currentProject}
        projects={userProjects}
      />
    </div>
  );
}
