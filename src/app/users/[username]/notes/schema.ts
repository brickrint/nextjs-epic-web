import { z } from "zod";

const titleMaxLength = 100;
const contentMaxLength = 10000;
const FILE_MAX_SIZE = 1024 * 1024 * 3;

export const ImageFieldsetSchema = z.object({
  file: z
    .instanceof(File)
    .refine(
      (file) => file.size < FILE_MAX_SIZE,
      "File size must be less than 3MB",
    )
    .optional(),
  id: z.string().optional(),
  altText: z.string().optional(),
});

export const NoteEditorSchema = z.object({
  title: z.string().min(1).max(titleMaxLength),
  content: z.string().min(1).max(contentMaxLength),
  images: z.array(ImageFieldsetSchema),
});

export type NoteEditorSchema = z.infer<typeof NoteEditorSchema>;
export type ImageFieldsetSchema = z.infer<typeof ImageFieldsetSchema>;

type ImageFieldset = z.infer<typeof ImageFieldsetSchema>;

export function imageHasFile(
  image: ImageFieldset,
): image is ImageFieldset & { file: NonNullable<ImageFieldset["file"]> } {
  return Boolean(image.file?.size && image.file?.size > 0);
}

export function imageHasId(
  image: ImageFieldset,
): image is ImageFieldset & { id: NonNullable<ImageFieldset["id"]> } {
  return image.id != null;
}
