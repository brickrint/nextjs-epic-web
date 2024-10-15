import { z } from "zod";

export const codeQueryParam = "code";
export const targetQueryParam = "target";
export const redirectToQueryParam = "redirectTo";
export const typeQueryParam = "type";

export const twoFAVerifyVerificationType = "2fa-verify";
export const twoFAVerificationType = "2fa";

const verificationTypes = [
  "onboarding",
  "reset-password",
  "change-email",
  twoFAVerificationType,
] as const;

export const VerificationTypeSchema = z.enum(verificationTypes);
export type VerificationTypes = z.infer<typeof VerificationTypeSchema>;

export const VerifySchema = z.object({
  [codeQueryParam]: z.string().min(6).max(6),
  [targetQueryParam]: z.string(),
  [redirectToQueryParam]: z.string().optional(),
  [typeQueryParam]: VerificationTypeSchema,
});

export type VerifySchemaType = z.infer<typeof VerifySchema>;
