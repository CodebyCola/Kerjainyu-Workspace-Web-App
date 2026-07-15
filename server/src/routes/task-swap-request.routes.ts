import { Router } from "express";
import { TaskSwapRequestController } from "../controllers/task-swap-request.controller";
import { requireProjectRole } from "../middlewares/projectRole.middleware";
import { validate } from "../middlewares/validate.middleware";
import { createSwapRequestSchema, resolveSwapRequestSchema } from "../schemas/task-swap.schema";

// mergeParams — needs :projectId from project.routes.ts. Mounted at the
// project level (not nested under a single task) since a swap request
// references its task_id in the body, and a two-way swap touches TWO tasks.
const router = Router({ mergeParams: true });
const taskSwapRequestController = new TaskSwapRequestController();

router.get("/", requireProjectRole("leader", "member"), taskSwapRequestController.listByProject);

router.get(
  "/task/:taskId/pending",
  requireProjectRole("leader", "member"),
  taskSwapRequestController.getPendingForTask,
);

router.post(
  "/",
  requireProjectRole("leader", "member"), // service enforces "must own the offered task"
  validate({ body: createSwapRequestSchema }),
  taskSwapRequestController.create,
);

router.patch(
  "/:swapRequestId/resolve",
  requireProjectRole("leader", "member"), // service branches on allow_free_swap internally
  validate({ body: resolveSwapRequestSchema }),
  taskSwapRequestController.resolve,
);

router.delete(
  "/:swapRequestId",
  requireProjectRole("leader", "member"), // service enforces "only the requester"
  taskSwapRequestController.cancel,
);

export default router;
