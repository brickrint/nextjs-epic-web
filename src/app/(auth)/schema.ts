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
  remember: z.boolean().optional(),
  redirectTo: z.string().optional(),
});

export const SignupFormSchema = z
  .object({
    username: UsernameSchema,
    name: NameSchema,
    password: PasswordSchema,
    confirmPassword: PasswordSchema,
    agreeToTermsOfServiceAndPrivacyPolicy: z.boolean({
      required_error:
        "You must agree to the terms of service and privacy policy",
    }),
    remember: z.boolean().optional(),
    redirectTo: z.string().optional(),
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

export const SignupSchema = z.object({
  email: EmailSchema,
  redirectTo: z.string().optional(),
});

export const ForgotPasswordSchema = z.object({
  usernameOrEmail: z.union([EmailSchema, UsernameSchema]),
});

export const ResetPasswordSchema = z
  .object({
    password: PasswordSchema,
    confirmPassword: PasswordSchema,
  })
  .refine(({ confirmPassword, password }) => password === confirmPassword, {
    message: "The passwords did not match",
    path: ["confirmPassword"],
  });
