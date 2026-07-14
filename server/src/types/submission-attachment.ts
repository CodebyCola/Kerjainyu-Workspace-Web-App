// types/submission-attachment.ts
import { AttachmentType } from "../database/types";

export type CreateSubmissionAttachmentData = {
  submission_id: number;
  type: AttachmentType;
  content: string;
};
