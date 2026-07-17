import { Router } from "express";
import { InviteController } from "../controllers/invite.controller";
import { requireAuth } from "../middlewares/auth.middleware";

const router = Router();
const inviteController = new InviteController();

router.use(requireAuth);

router.get("/", inviteController.list);
router.post("/:projectId/accept", inviteController.accept);
router.post("/:projectId/decline", inviteController.decline);

export default router;
