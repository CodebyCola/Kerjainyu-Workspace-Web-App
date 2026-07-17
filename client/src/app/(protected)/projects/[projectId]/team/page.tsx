"use client";

import { UserPlus } from "lucide-react";
import { useRouter } from "next/navigation";
import { use, useCallback, useEffect, useMemo, useState } from "react";
import Container from "@/components/layout/Container";
import {
  type InviteByUsernameValues,
  InviteMemberModal,
} from "@/components/team/InviteMemberModal";
import { MemberCard } from "@/components/team/MemberCard";
import { TransferLeaderModal } from "@/components/team/TransferLeaderModal";
import { useToast } from "@/components/toast/ToastContext";
import { useAuth } from "@/hooks/useAuth";
import { ROUTES } from "@/routes/route";
import {
  getProjectById,
  type Project,
} from "@/service/project/project.service";
import {
  addProjectMember,
  getProjectMembers,
  leaveProject,
  type ProjectMember,
  removeProjectMember,
  transferLeader,
} from "@/service/team/team.service";
import { getInitials } from "@/utils/Avatar";
import { getErrorMessage } from "@/utils/Errors";

type LoadStatus = "loading" | "error" | "ready";

export default function Team({
  params,
}: {
  params: Promise<{ projectId: string }>;
}) {
  const { projectId } = use(params);
  const { user } = useAuth();
  const toast = useToast();
  const router = useRouter();

  const [project, setProject] = useState<Project | null>(null);
  const [members, setMembers] = useState<ProjectMember[]>([]);
  const [status, setStatus] = useState<LoadStatus>("loading");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const [inviteOpen, setInviteOpen] = useState(false);
  const [transferOpen, setTransferOpen] = useState(false);
  const [pendingAction, setPendingAction] = useState<number | "leave" | null>(
    null,
  );

  const loadData = useCallback(async () => {
    setStatus("loading");
    setErrorMessage(null);
    try {
      const [projectData, membersData] = await Promise.all([
        getProjectById(projectId),
        getProjectMembers(projectId),
      ]);
      setProject(projectData);
      setMembers(membersData);
      setStatus("ready");
    } catch (err) {
      setErrorMessage(getErrorMessage(err));
      setStatus("error");
    }
  }, [projectId]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const leader = useMemo(
    () => members.find((m) => m.role === "leader"),
    [members],
  );
  const regularMembers = useMemo(
    () => members.filter((m) => m.role !== "leader"),
    [members],
  );
  const isLeader = project?.role === "leader";
  const currentUserId = user?.userId;

  async function handleRemove(member: ProjectMember) {
    if (
      !window.confirm(
        `Remove ${member.username} from this project? They'll lose access immediately.`,
      )
    ) {
      return;
    }
    setPendingAction(member.id);
    try {
      await removeProjectMember(projectId, member.id);
      setMembers((prev) => prev.filter((m) => m.id !== member.id));
      toast.success(`${member.username} was removed from the project.`);
    } catch (err) {
      toast.error({
        title: "Couldn't remove member",
        description: getErrorMessage(err),
      });
    } finally {
      setPendingAction(null);
    }
  }

  async function handleLeave() {
    if (
      !window.confirm("Leave this project? You'll need a new invite to rejoin.")
    ) {
      return;
    }
    setPendingAction("leave");
    try {
      await leaveProject(projectId);
      toast.info("You left the project.");
      router.push(ROUTES.PROJECTS);
    } catch (err) {
      toast.error({
        title: "Couldn't leave the project",
        description: getErrorMessage(err),
      });
      setPendingAction(null);
    }
  }

  async function handleTransferConfirm(newLeaderId: number) {
    await transferLeader(projectId, newLeaderId);
    setTransferOpen(false);
    toast.success("Leadership transferred.");
    await loadData();
  }

  async function handleInviteByUsername({
    username,
    role,
  }: InviteByUsernameValues): Promise<
    { ok: true } | { ok: false; error: string }
  > {
    try {
      await addProjectMember(projectId, username, role);
      toast.success(`Invite sent to ${username}.`);
      return { ok: true };
    } catch (err) {
      return { ok: false, error: getErrorMessage(err) };
    }
  }

  return (
    <Container>
      <div className="flex items-start justify-between mb-6 px-1">
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl font-bold text-text-primary">Team</h1>
          <div className="flex items-center gap-2 text-sm text-text-secondary">
            <span>
              {project?.title ?? (status === "loading" ? "Loading..." : "")}
            </span>
            {status === "ready" && (
              <span className="text-xs px-2 py-0.5 rounded-full bg-surface-container">
                {members.length} {members.length === 1 ? "member" : "members"}
              </span>
            )}
          </div>
        </div>

        {isLeader && (
          <button
            type="button"
            onClick={() => setInviteOpen(true)}
            className="flex items-center gap-2 text-sm font-medium px-4 py-2 rounded-md bg-tertiary text-on-tertiary hover:opacity-90 transition-opacity duration-150 ease-in-out cursor-pointer shrink-0"
          >
            <UserPlus className="size-4" aria-hidden="true" />
            Invite member
          </button>
        )}
      </div>

      {status === "loading" && (
        <p className="text-sm text-text-muted px-1">Loading team...</p>
      )}

      {status === "error" && (
        <div className="flex flex-col items-start gap-2 px-1">
          <p className="text-sm text-danger">
            {errorMessage ?? "Could not load the team."}
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
        <div className="bg-surface border border-outline-subtle rounded-lg divide-y divide-outline-subtle px-4">
          {leader && (
            <MemberCard
              name={leader.username}
              initials={getInitials(leader.username)}
              status="active"
              isLeader
              isCurrentUser={leader.id === currentUserId}
              onTransferLeader={
                isLeader ? () => setTransferOpen(true) : undefined
              }
            />
          )}
          {regularMembers.map((member) => (
            <MemberCard
              key={member.id}
              name={member.username}
              initials={getInitials(member.username)}
              status="active"
              isCurrentUser={member.id === currentUserId}
              onRemove={
                isLeader && pendingAction !== member.id
                  ? () => handleRemove(member)
                  : undefined
              }
              onLeave={
                !isLeader && member.id === currentUserId
                  ? handleLeave
                  : undefined
              }
            />
          ))}
        </div>
      )}

      <InviteMemberModal
        open={inviteOpen}
        onClose={() => setInviteOpen(false)}
        currentProject={
          project ? { id: Number(projectId), title: project.title } : undefined
        }
        onInviteByUsername={handleInviteByUsername}
      />

      <TransferLeaderModal
        open={transferOpen}
        onClose={() => setTransferOpen(false)}
        candidates={regularMembers}
        onConfirm={handleTransferConfirm}
      />
    </Container>
  );
}
