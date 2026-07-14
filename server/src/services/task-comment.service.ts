import { CommentRepository } from "../repositories/comment.repository";
import { TaskRepository } from "../repositories/task.repository";
import { ProjectMemberRepository } from "../repositories/project-member.repository";
import { NotFoundError, ForbiddenError } from "../shared/errors";
import { CreateCommentInput } from "../schemas/comment.schema";

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

    return await commentRepository.create({
      task_id,
      user_id,
      comment: input.comment,
    });
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
