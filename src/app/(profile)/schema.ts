import { z } from "zod";

import { NameSchema, UsernameSchema } from "@/utils/user-validation";

export const ProfileFormSchema = z.object({
  name: NameSchema.optional(),
  username: UsernameSchema,
});

const MAX_SIZE = 1024 * 1024 * 3; // 3MB

export const PhotoFormSchema = z.object({
  photoFile: z
    .instanceof(File)
    .refine((file) => file.size > 0, "Image is required")
    .refine(
      (file) => file.size <= MAX_SIZE,
      "Image size must be less than 3MB",
    ),
});
