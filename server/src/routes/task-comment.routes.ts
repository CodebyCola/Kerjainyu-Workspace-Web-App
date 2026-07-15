import { Router } from "express";
import { TaskCommentController } from "../controllers/task-comment.controller";
import { requireProjectRole } from "../middlewares/projectRole.middleware";
import { validate } from "../middlewares/validate.middleware";
import { createCommentSchema } from "../schemas/comment.schema";

// mergeParams — needs :projectId and :taskId from task.routes.ts
const router = Router({ mergeParams: true });
const taskCommentController = new TaskCommentController();

router.get("/", requireProjectRole("leader", "member"), taskCommentController.list);

router.post(
  "/",
  requireProjectRole("leader", "member"), // service enforces "own task only" for members
  validate({ body: createCommentSchema }),
  taskCommentController.create,
);

router.delete("/:commentId", requireProjectRole("leader", "member"), taskCommentController.remove);

export default router;
