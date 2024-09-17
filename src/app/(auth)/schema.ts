import { z } from "zod";

import {
  EmailSchema,
  NameSchema,
  PasswordSchema,
  UsernameSchema,
} from "@/utils/user-validation";

export const LoginFormSchema = z.object({
  username: UsernameSchema,
  password: PasswordSchema,
});

export const SignupFormSchema = z
  .object({
    username: UsernameSchema,
    name: NameSchema,
    email: EmailSchema,
    password: PasswordSchema,
    confirmPassword: PasswordSchema,
    agreeToTermsOfServiceAndPrivacyPolicy: z.boolean({
      required_error:
        "You must agree to the terms of service and privacy policy",
    }),
  })
  .superRefine(({ confirmPassword, password }, ctx) => {
    if (confirmPassword !== password) {
      ctx.addIssue({
        path: ["confirmPassword"],
        code: "custom",
        message: "The passwords must match",
      });
    }
  });
