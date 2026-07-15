import { CommentRepository } from "../repositories/comment.repository";
import { TaskRepository } from "../repositories/task.repository";
import { ProjectMemberRepository } from "../repositories/project-member.repository";
import { NotFoundError, ForbiddenError } from "../shared/errors";
import { CreateCommentInput } from "../schemas/comment.schema";
import { NotificationService } from "./notification.service";

const notificationService = new NotificationService();
const commentRepository = new CommentRepository();
const taskRepository = new TaskRepository();
const projectMemberRepository = new ProjectMemberRepository();

export class TaskCommentService {
  async addComment(
    task_id: number,
    project_id: number,
    user_id: number,
    input: CreateCommentInput,
  ) {
    const task = await taskRepository.getTaskById(task_id, project_id);
    if (!task) throw new NotFoundError("Task");

    const membership = await projectMemberRepository.findByProjectAndUser(
      project_id,
      user_id,
    );
    if (!membership)
      throw new ForbiddenError("You are not a member of this project");

    if (membership.role !== "leader" && task.assignee_id !== user_id) {
      throw new ForbiddenError("You can only comment on tasks assigned to you");
    }

    const comment = await commentRepository.create({
      task_id,
      user_id,
      comment: input.comment,
    });

    // Notify whichever side of leader/assignee didn't write this comment.
    // If a member commented, tell the leader (task.created_by). If the
    // leader commented, tell the assignee (if the task even has one yet).
    const recipient = membership.role === "leader" ? task.assignee_id : task.created_by;
    if (recipient && recipient !== user_id) {
      await notificationService.notify(
        recipient,
        "comment_added",
        `New comment on "${task.title}"`,
        { reference_type: "task", reference_id: task_id },
      );
    }

    return comment;
  }

  async getCommentsForTask(
    task_id: number,
    project_id: number,
    user_id: number,
  ) {
    const task = await taskRepository.getTaskById(task_id, project_id);
    if (!task) throw new NotFoundError("Task");

    const membership = await projectMemberRepository.findByProjectAndUser(
      project_id,
      user_id,
    );
    if (!membership)
      throw new ForbiddenError("You are not a member of this project");

    return await commentRepository.getByTask(task_id);
  }

  async deleteComment(
    id: number,
    task_id: number,
    project_id: number,
    user_id: number,
  ) {
    const task = await taskRepository.getTaskById(task_id, project_id);
    if (!task) throw new NotFoundError("Task");

    const comment = await commentRepository.getById(id, task_id);
    if (!comment) throw new NotFoundError("Comment");

    const membership = await projectMemberRepository.findByProjectAndUser(
      project_id,
      user_id,
    );
    if (!membership)
      throw new ForbiddenError("You are not a member of this project");

    // Author can delete their own comment; leader can moderate any comment
    if (comment.user_id !== user_id && membership.role !== "leader") {
      throw new ForbiddenError("You can only delete your own comments");
    }

    return await commentRepository.delete(id, task_id);
  }
}