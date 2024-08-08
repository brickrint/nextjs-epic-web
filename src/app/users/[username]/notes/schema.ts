import { z } from "zod";

const titleMaxLength = 100;
const contentMaxLength = 10000;

export const NoteEditorSchema = z.object({
  title: z.string().min(1).max(titleMaxLength),
  content: z.string().min(1).max(contentMaxLength),
});
