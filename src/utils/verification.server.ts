import { db } from "@/server/db";
import { generateTOTP, verifyTOTP } from "@epic-web/totp";
import { addMinutes } from "date-fns";
import * as jose from "jose";
import { searchParams } from "next-extra/pathname";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import "server-only";
import { z } from "zod";

import { env } from "@/env";

const SESSION_EXPIRATION_TIME = 10;
function getSessionExpirationTime(date = new Date()) {
  return addMinutes(date, SESSION_EXPIRATION_TIME);
}

const secret = new TextEncoder().encode(env.SESSION_SECRET);

const cookieKey = "enVerificationKey";

type VerificationPayload = {
  [targetQueryParam]: string;
};

export async function createCookie(target: VerificationPayload["target"]) {
  const expires = getSessionExpirationTime();

  const value = await new jose.SignJWT({ target })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setIssuer("urn:example:issuer")
    .setAudience("urn:example:audience")
    .setExpirationTime(expires)
    .sign(secret);

  cookies().set({
    name: cookieKey,
    value,
    expires,
    secure: env.NODE_ENV === "production",
    httpOnly: true,
    sameSite: "lax",
  });
}

export async function getCookie(redirectToPath: string) {
  const signedValue = cookies().get(cookieKey);

  const params = searchParams();

  const redirectTo = params.size
    ? `${redirectToPath}?${params.toString()}`
    : `${redirectToPath}`;

  if (!signedValue) {
    redirect(redirectTo);
  }

  try {
    const { payload } = await jose.jwtVerify<VerificationPayload>(
      signedValue.value,
      secret,
    );
    console.log("first payload", payload);
    return payload[targetQueryParam];
  } catch {
    redirect(redirectTo);
  }
}

export async function deleteCookie() {
  cookies().delete(cookieKey);
}

export async function prepareVerification({
  period = 10 * 60,
  type,
  target,
  redirectTo,
  algorithm = "SHA-256",
  expiresIn = 1000,
}: {
  period?: number;
  type: VerificationTypes;
  target: string;
  redirectTo?: string;
  algorithm?: string;
  expiresIn?: number;
}) {
  const { otp, ...verificationConfig } = await generateTOTP({
    algorithm,
    period,
  });

  const verificationData = {
    type,
    target,
    ...verificationConfig,
    expiresAt: new Date(Date.now() + verificationConfig.period * expiresIn),
  };

  await db.verification.upsert({
    where: {
      type_target: {
        target,
        type,
      },
    },
    create: verificationData,
    update: verificationData,
  });

  const redirectToSearchParams = new URLSearchParams();

  if (redirectTo) {
    redirectToSearchParams.set(redirectToQueryParam, redirectTo);
  }
  redirectToSearchParams.set(typeQueryParam, type);
  redirectToSearchParams.set(targetQueryParam, target);

  return {
    otp,
    redirectTo: redirectToSearchParams.toString(),
  };
}

export async function isCodeValid({
  code,
  type,
  target,
}: {
  code: string;
  type: VerificationTypes;
  target: string;
}) {
  const verification = await db.verification.findUnique({
    where: {
      type_target: { target, type },
      OR: [{ expiresAt: { gt: new Date() } }, { expiresAt: null }],
    },
    select: { algorithm: true, secret: true, period: true, charSet: true },
  });
  if (!verification) return false;
  const result = await verifyTOTP({
    otp: code,
    secret: verification.secret,
    algorithm: verification.algorithm,
    period: verification.period,
    charSet: verification.charSet,
  });
  if (!result) return false;

  return true;
}

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
  twoFAVerifyVerificationType,
  twoFAVerificationType,
] as const;
const VerificationTypeSchema = z.enum(verificationTypes);
export type VerificationTypes = z.infer<typeof VerificationTypeSchema>;

export const VerifySchema = z.object({
  [codeQueryParam]: z.string().min(6).max(6),
  [targetQueryParam]: z.string(),
  [redirectToQueryParam]: z.string().optional(),
  [typeQueryParam]: VerificationTypeSchema,
});

export type VerifySchemaType = z.infer<typeof VerifySchema>;
