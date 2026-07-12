import { ColumnType, Generated } from "kysely";

export type ProjectStatus = "ongoing" | "completed";
export type ProjectRole = "leader" | "member";
export type MemberStatus = "invited" | "active" | "removed";

export type TaskStatus =
  | "unclaimed"
  | "todo"
  | "ongoing"
  | "submitted"
  | "in_revision"
  | "approved"
  | "rejected";

export type OwnershipChangeReason =
  | "assigned"
  | "claimed"
  | "swap"
  | "reassigned";

export type SwapRequestStatus =
  | "pending"
  | "approved"
  | "rejected"
  | "cancelled";

export type ReviewStatus =
  | "pending"
  | "approved"
  | "revision_requested"
  | "rejected";

export type AttachmentType = "text" | "image" | "file" | "link";

export type ProjectLinkCategory = "design" | "development" | "docs" | "other";

export type AppealStatus = "pending" | "accepted" | "rejected";

export type NotificationType =
  | "deadline_reminder"
  | "task_assigned"
  | "task_swapped"
  | "swap_requested"
  | "submission_reviewed"
  | "comment_added"
  | "appeal_updated";

export interface UsersTable {
  id: Generated<number>;
  username: string;
  password: string;
  created_at: Generated<Date>;
}
export interface ProjectsTable {
  id: Generated<number>;
  title: string;
  status: ColumnType<ProjectStatus, ProjectStatus | undefined, ProjectStatus>;
  allow_free_swap: ColumnType<boolean, boolean | undefined, boolean>;
  deadline: Date | null;
  is_archived: ColumnType<boolean, boolean | undefined, boolean>;
  is_archived_at: ColumnType<Date | null, Date | null | undefined, Date | null>
  created_at: Generated<Date>;
}
export interface ProjectMembersTable {
  id: Generated<number>;
  project_id: number;
  user_id: number;
  role: ColumnType<ProjectRole, ProjectRole | undefined, ProjectRole>;
  joined_at: Generated<Date>;
  status: ColumnType<MemberStatus, MemberStatus | undefined, MemberStatus>;
}

export interface ProjectLinksTable {
  id: Generated<number>;
  project_id: number;
  label: string;
  url: string;
  category: ColumnType<
    ProjectLinkCategory,
    ProjectLinkCategory | undefined,
    ProjectLinkCategory
  >;
  added_by: number | null;
  created_at: Generated<Date>;
}
export interface TasksTable {
  id: Generated<number>;
  title: string;
  description: string | null;
  status: ColumnType<TaskStatus, TaskStatus | undefined, TaskStatus>;
  priority: number | null;
  display_order: ColumnType<number, number | undefined, number>;
  project_id: number;
  deadline: Date | null;
  owner_id: number | null;
  created_by: number;
  is_claimable: ColumnType<boolean, boolean | undefined, boolean>;
  created_at: Generated<Date>;
  updated_at: Date | null;
}
export interface TaskOwnershipLogTable {
  id: Generated<number>;
  task_id: number;
  from_user_id: number | null;
  to_user_id: number;
  reason: OwnershipChangeReason;
  changed_at: Generated<Date>;
}
export interface TaskSwapRequestsTable {
  id: Generated<number>;
  task_id: number;
  target_task_id: number | null;
  requested_by: number;
  requested_to: number;
  status: ColumnType<
    SwapRequestStatus,
    SwapRequestStatus | undefined,
    SwapRequestStatus
  >;
  resolved_by: number | null;
  resolved_at: Date | null;
  created_at: Generated<Date>;
}
export interface TaskSubmissionsTable {
  id: Generated<number>;
  task_id: number;
  submitted_by: number;
  note: string | null;
  review_status: ColumnType<
    ReviewStatus,
    ReviewStatus | undefined,
    ReviewStatus
  >;
  review_note: string | null;
  reviewed_by: number | null;
  reviewed_at: Date | null;
  submitted_at: Generated<Date>;
}

export interface SubmissionAttachmentsTable {
  id: Generated<number>;
  submission_id: number;
  type: AttachmentType;
  content: string;
  created_at: Generated<Date>;
}

export interface TaskAppealsTable {
  id: Generated<number>;
  task_id: number;
  submission_id: number | null;
  raised_by: number;
  reason: string;
  status: ColumnType<AppealStatus, AppealStatus | undefined, AppealStatus>;
  resolved_by: number | null;
  resolution_note: string | null;
  created_at: Generated<Date>;
  resolved_at: Date | null;
}

export interface CommentsTaskTable {
  id: Generated<number>;
  user_id: number;
  task_id: number;
  comment: string;
  created_at: Generated<Date>;
}

export interface NotificationsTable {
  id: Generated<number>;
  user_id: number;
  type: NotificationType;
  reference_type: string | null;
  reference_id: number | null;
  message: string;
  is_read: ColumnType<boolean, boolean | undefined, boolean>;
  created_at: Generated<Date>;
}

export interface Database {
  users: UsersTable;
  projects: ProjectsTable;
  project_members: ProjectMembersTable;
  project_links: ProjectLinksTable;
  tasks: TasksTable;
  task_ownership_log: TaskOwnershipLogTable;
  task_swap_requests: TaskSwapRequestsTable;
  task_submissions: TaskSubmissionsTable;
  submission_attachments: SubmissionAttachmentsTable;
  task_appeals: TaskAppealsTable;
  comments_task: CommentsTaskTable;
  notifications: NotificationsTable;
}
