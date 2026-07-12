"use client";

import { Eye, EyeOff, UserPlus } from "lucide-react";
import { useState } from "react";
import Container from "@/components/layout/Container";
import { InviteMemberModal } from "@/components/team/InviteMemberModal";
import { MemberCard, type MemberStatus } from "@/components/team/MemberCard";

// Demo project context. In production this comes from the active
// project route param, resolved the same way app/taskboard/page.tsx
// resolves its project.
const currentProject = { id: 1, title: "Website Redesign Sprint" };

// Demo data shaped like a real query result. In production this comes
// from project_members joined with users, ordered so the leader
// (projects.leader_id) is resolved separately from the member list.
const leader = {
  name: "Maya Kartika",
  initials: "MK",
  status: "active" as MemberStatus,
  activeTaskCount: 4,
};

const members: {
  name: string;
  initials: string;
  status: MemberStatus;
  activeTaskCount?: number;
}[] = [
  { name: "Julian D.", initials: "JD", status: "active", activeTaskCount: 3 },
  { name: "Adi L.", initials: "AL", status: "invited" },
  { name: "Siti K.", initials: "SK", status: "active", activeTaskCount: 2 },
];

const removedMembers: {
  name: string;
  initials: string;
  status: MemberStatus;
}[] = [{ name: "Budi S.", initials: "BS", status: "removed" }];

export default function Team() {
  const [showRemoved, setShowRemoved] = useState(false);
  const [inviteOpen, setInviteOpen] = useState(false);

  return (
    <Container>
      <div className="flex items-start justify-between mb-6 px-1">
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl font-bold text-text-primary">Team</h1>
          <div className="flex items-center gap-2 text-sm text-text-secondary">
            <span>Project Title</span>
            <span className="text-xs px-2 py-0.5 rounded-full bg-surface-container">
              members number
            </span>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setInviteOpen(true)}
          className="flex items-center gap-2 text-sm font-medium px-4 py-2 rounded-md bg-tertiary text-on-tertiary hover:opacity-90 transition-opacity duration-150 ease-in-out cursor-pointer"
        >
          <UserPlus className="size-4" aria-hidden="true" />
          Invite member
        </button>
      </div>

      {/*
        Opened from Team page → project context is already known, so
        the modal locks the project field instead of showing a picker.
      */}
      <InviteMemberModal
        open={inviteOpen}
        onClose={() => setInviteOpen(false)}
        currentProject={currentProject}
      />

      <div className="bg-surface border border-outline-subtle rounded-lg divide-y divide-outline-subtle px-4">
        <MemberCard
          name={leader.name}
          initials={leader.initials}
          status={leader.status}
          activeTaskCount={leader.activeTaskCount}
          isLeader
        />
        {members.map((member) => (
          <MemberCard
            key={member.name}
            name={member.name}
            initials={member.initials}
            status={member.status}
            activeTaskCount={member.activeTaskCount}
            onResendInvite={() => console.log("resend invite", member.name)}
          />
        ))}
      </div>

      {removedMembers.length > 0 && (
        <div className="mt-6">
          <button
            type="button"
            onClick={() => setShowRemoved((prev) => !prev)}
            aria-expanded={showRemoved}
            className="flex items-center gap-2 text-xs text-text-muted hover:text-text-secondary transition-colors duration-150 ease-in-out mx-auto cursor-pointer"
          >
            {showRemoved ? (
              <EyeOff className="size-3.5" aria-hidden="true" />
            ) : (
              <Eye className="size-3.5" aria-hidden="true" />
            )}
            {showRemoved ? "Hide removed members" : "Show removed members"}
          </button>

          {showRemoved && (
            <div className="mt-4 bg-surface border border-outline-subtle rounded-lg divide-y divide-outline-subtle px-4">
              {removedMembers.map((member) => (
                <MemberCard
                  key={member.name}
                  name={member.name}
                  initials={member.initials}
                  status={member.status}
                />
              ))}
            </div>
          )}
        </div>
      )}
    </Container>
  );
}
