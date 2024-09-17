import { z } from "zod";

import { PasswordSchema, UsernameSchema } from "@/utils/user-validation";

export const LoginFormSchema = z.object({
  username: UsernameSchema,
  password: PasswordSchema,
});
