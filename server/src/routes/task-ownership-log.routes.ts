import { Router } from "express";
import { TaskOwnershipLogController } from "../controllers/task-ownership-log.controller";
import { requireProjectRole } from "../middlewares/projectRole.middleware";

// mergeParams — needs :projectId and :taskId from task.routes.ts
const router = Router({ mergeParams: true });
const taskOwnershipLogController = new TaskOwnershipLogController();

router.get("/", requireProjectRole("leader", "member"), taskOwnershipLogController.getForTask);

export default router;
