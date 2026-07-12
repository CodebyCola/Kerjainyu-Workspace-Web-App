import { z } from "zod"
import { ProjectRole } from "../database/types"
export const createProjectMemberSchema = z.object({ userId: z.number(), role: z.enum(["leader", "member"]) })

export type CreateProjectMemberSchema = z.infer<typeof createProjectMemberSchema>