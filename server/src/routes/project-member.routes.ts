import { Router } from "express";
import { ProjectMemberController } from "../controllers/project-member.controller";
import { requireProjectRole } from "../middlewares/projectRole.middleware";
import { validate } from "../middlewares/validate.middleware";
import { createProjectMemberSchema } from "../schemas/project-member.schema";

// mergeParams — needs :projectId from the parent project.routes.ts
const router = Router({ mergeParams: true });
const projectMemberController = new ProjectMemberController();

// requireAuth already applied by project.routes.ts before this is mounted
router.get(
  "/",
  requireProjectRole("leader", "member"),
  projectMemberController.listMembers,
);

router.get(
  "/lookup",
  requireProjectRole("leader"),
  projectMemberController.lookupMember,
);

router.post(
  "/",
  requireProjectRole("leader"),
  validate({ body: createProjectMemberSchema }),
  projectMemberController.addMember,
);

router.post(
  "/leave",
  requireProjectRole("leader", "member"),
  projectMemberController.leaveProject,
);

router.post(
  "/transfer-leader",
  requireProjectRole("leader"),
  projectMemberController.transferLeader,
);

router.delete(
  "/:userId",
  requireProjectRole("leader"),
  projectMemberController.removeMember,
);

export default router;
