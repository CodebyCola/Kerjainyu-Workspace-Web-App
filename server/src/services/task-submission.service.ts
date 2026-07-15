import { db } from "../database";
import { TaskSubmissionRepository } from "../repositories/task-submission.repository";
import { SubmissionAttachmentRepository } from "../repositories/submission-attachment.repository";
import { TaskRepository } from "../repositories/task.repository";
import { ProjectMemberRepository } from "../repositories/project-member.repository";
import { NotFoundError, ConflictError, ForbiddenError } from "../shared/errors";
import { CreateTaskSubmissionInput, ReviewSubmissionInput } from "../schemas/task-submission.schema";
import { TaskStatus } from "../database/types";
import { NotificationService } from "./notification.service";

const taskSubmissionRepository = new TaskSubmissionRepository();
const submissionAttachmentRepository = new SubmissionAttachmentRepository();
const taskRepository = new TaskRepository();
const projectMemberRepository = new ProjectMemberRepository();
const notificationService = new NotificationService();

// Only these task states can accept a new submission — a fresh submit from
// "ongoing", or a resubmit after the leader sent it back for revision.
const SUBMITTABLE_STATUSES: TaskStatus[] = ["ongoing", "in_revision"];

// What a review_status maps to on the parent task
const TASK_STATUS_BY_REVIEW: Record<string, TaskStatus> = {
  approved: "approved",
  revision_requested: "in_revision",
  rejected: "rejected",
};

export class TaskSubmissionService {
  async submitTask(
    task_id: number,
    project_id: number,
    user_id: number,
    input: CreateTaskSubmissionInput
  ) {
    const task = await taskRepository.getTaskById(task_id, project_id);
    if (!task) throw new NotFoundError("Task");

    if (task.assignee_id !== user_id) {
      throw new ForbiddenError("Only the assignee can submit this task");
    }

    if (!SUBMITTABLE_STATUSES.includes(task.status)) {
      throw new ConflictError(`Cannot submit a task with status "${task.status}"`);
    }

    const result = await db.transaction().execute(async (trx) => {
      const submission = await taskSubmissionRepository.create(
        { task_id, submitted_by: user_id, note: input.note ?? null },
        trx
      );

      const attachments = await submissionAttachmentRepository.createMany(
        submission.id,
        input.attachments,
        trx
      );

      await taskRepository.updateTask(task_id, { status: "submitted" }, project_id, trx);

      return { ...submission, attachments };
    });

    // task.created_by is the leader who authored this task — notify them
    // a submission is waiting in the review queue.
    // NOTE: "submission_pending" is not yet in your NotificationType enum —
    // see the note below the code for the DB migration needed before this compiles.
    await notificationService.notify(
      task.created_by,
      "submission_pending",
      `"${task.title}" was submitted for review`,
      { reference_type: "submission", reference_id: result.id },
    );

    return result;
  }

  async reviewSubmission(
    submission_id: number,
    task_id: number,
    project_id: number,
    reviewer_id: number,
    input: ReviewSubmissionInput
  ) {
    const task = await taskRepository.getTaskById(task_id, project_id);
    if (!task) throw new NotFoundError("Task");

    const submission = await taskSubmissionRepository.getById(submission_id, task_id);
    if (!submission) throw new NotFoundError("Submission");

    if (submission.review_status !== "pending") {
      throw new ConflictError("This submission has already been reviewed");
    }

    const membership = await projectMemberRepository.findByProjectAndUser(project_id, reviewer_id);
    if (!membership || membership.role !== "leader") {
      throw new ForbiddenError("Only the leader can review submissions");
    }

    const updatedSubmission = await db.transaction().execute(async (trx) => {
      const updatedSubmission = await taskSubmissionRepository.review(
        submission_id,
        task_id,
        {
          review_status: input.review_status,
          review_note: input.review_note ?? null,
          reviewed_by: reviewer_id,
          reviewed_at: new Date(),
        },
        trx
      );

      await taskRepository.updateTask(
        task_id,
        { status: TASK_STATUS_BY_REVIEW[input.review_status] },
        project_id,
        trx
      );

      return updatedSubmission;
    });

    await notificationService.notify(
      submission.submitted_by,
      "submission_reviewed",
      `Your submission for "${task.title}" was ${input.review_status}`,
      { reference_type: "submission", reference_id: submission_id },
    );

    return updatedSubmission;
  }

  // Any active member can see the current submission — assignee tracking
  // their own status, or leader/others checking progress.
  async getLatestSubmission(task_id: number, project_id: number, user_id: number) {
    const task = await taskRepository.getTaskById(task_id, project_id);
    if (!task) throw new NotFoundError("Task");

    const membership = await projectMemberRepository.findByProjectAndUser(project_id, user_id);
    if (!membership) throw new ForbiddenError("You are not a member of this project");

    const submission = await taskSubmissionRepository.getLatestByTask(task_id);
    if (!submission) throw new NotFoundError("Submission");

    const attachments = await submissionAttachmentRepository.getBySubmission(submission.id);
    return { ...submission, attachments };
  }

  async getSubmissionHistory(task_id: number, project_id: number, user_id: number) {
    const task = await taskRepository.getTaskById(task_id, project_id);
    if (!task) throw new NotFoundError("Task");

    const membership = await projectMemberRepository.findByProjectAndUser(project_id, user_id);
    if (!membership) throw new ForbiddenError("You are not a member of this project");

    return await taskSubmissionRepository.getAllByTask(task_id);
  }

  // Leader's review queue — every submission across the project awaiting action
  async getPendingSubmissions(project_id: number, user_id: number) {
    const membership = await projectMemberRepository.findByProjectAndUser(project_id, user_id);
    if (!membership || membership.role !== "leader") {
      throw new ForbiddenError("Only the leader can view the review queue");
    }
    return await taskSubmissionRepository.getPendingByProject(project_id);
  }
}