import type { AttachmentType } from "@/components/files/AttachmentRow";
export function displayNameForAttachment(attachment: {
  type: AttachmentType;
  content: string;
}): string | undefined {
  if (attachment.type === "text") return undefined;
  try {
    const url = new URL(attachment.content);
    const segments = url.pathname.split("/").filter(Boolean);
    return segments.at(-1) || url.hostname;
  } catch {
    return attachment.content;
  }
}
