import { Router } from "express";
import { TaskAppealController } from "../controllers/task-appeal.controller";
import { requireProjectRole } from "../middlewares/projectRole.middleware";
import { validate } from "../middlewares/validate.middleware";
import { createTaskAppealSchema, resolveAppealSchema } from "../schemas/task-appeal.schema";

// mergeParams — needs :projectId and :taskId from task.routes.ts
const router = Router({ mergeParams: true });
const taskAppealController = new TaskAppealController();

router.get("/", requireProjectRole("leader", "member"), taskAppealController.getForTask);

router.post(
  "/",
  requireProjectRole("leader", "member"), // service enforces "must be the assignee"
  validate({ body: createTaskAppealSchema }),
  taskAppealController.create,
);

router.patch(
  "/:appealId/resolve",
  requireProjectRole("leader"),
  validate({ body: resolveAppealSchema }),
  taskAppealController.resolve,
);

export default router;
