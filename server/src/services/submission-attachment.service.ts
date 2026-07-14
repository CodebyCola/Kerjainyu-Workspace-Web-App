import { SubmissionAttachmentRepository } from "../repositories/submission-attachment.repository";
import { TaskSubmissionRepository } from "../repositories/task-submission.repository";
import { TaskRepository } from "../repositories/task.repository";
import { ProjectMemberRepository } from "../repositories/project-member.repository";
import { NotFoundError, ForbiddenError } from "../shared/errors";

const submissionAttachmentRepository = new SubmissionAttachmentRepository();
const taskSubmissionRepository = new TaskSubmissionRepository();
const taskRepository = new TaskRepository();
const projectMemberRepository = new ProjectMemberRepository();

// Note: attachments are always created/deleted as part of a submission
// (see TaskSubmissionService.submitTask), never standalone — so this
// service only exposes a read, for a dedicated "view attachments" endpoint
// if the frontend ever needs one separate from the full submission payload.
export class SubmissionAttachmentService {
  async getAttachmentsForSubmission(
    submission_id: number,
    task_id: number,
    project_id: number,
    user_id: number
  ) {
    const task = await taskRepository.getTaskById(task_id, project_id);
    if (!task) throw new NotFoundError("Task");

    const membership = await projectMemberRepository.findByProjectAndUser(project_id, user_id);
    if (!membership) throw new ForbiddenError("You are not a member of this project");

    const submission = await taskSubmissionRepository.getById(submission_id, task_id);
    if (!submission) throw new NotFoundError("Submission");

    return await submissionAttachmentRepository.getBySubmission(submission_id);
  }
}