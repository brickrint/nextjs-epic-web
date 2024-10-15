import { db } from "@/server/db";
import { generateTOTP, verifyTOTP } from "@epic-web/totp";
import { type Session } from "@prisma/client";
import { addMinutes } from "date-fns";
import * as jose from "jose";
import { searchParams } from "next-extra/pathname";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import "server-only";

import { env } from "@/env";

import {
  VerificationTypeSchema,
  type VerificationTypes,
  VerifySchema,
  type VerifySchemaType,
  codeQueryParam,
  redirectToQueryParam,
  targetQueryParam,
  twoFAVerificationType,
  twoFAVerifyVerificationType,
  typeQueryParam,
} from "./verification";

export function getRedirectToParams({
  type,
  target,
  redirectTo,
}: {
  type: VerificationTypes | typeof twoFAVerifyVerificationType;
  target: string;
  redirectTo?: string;
}) {
  const redirectToSearchParams = new URLSearchParams();

  if (redirectTo) {
    redirectToSearchParams.set(redirectToQueryParam, redirectTo);
  }

  redirectToSearchParams.set(typeQueryParam, type);
  redirectToSearchParams.set(targetQueryParam, target);

  return redirectToSearchParams;
}

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

    return payload[targetQueryParam];
  } catch {
    redirect(redirectTo);
  }
}

export function deleteCookie() {
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
  type: VerificationTypes | typeof twoFAVerifyVerificationType;
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

  const redirectToSearchParams = getRedirectToParams({
    target,
    type,
    redirectTo,
  });

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
  type: VerificationTypes | typeof twoFAVerifyVerificationType;
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

const unverifiedCookieKey = "unverified-session-id";
type UnverifiedCookie = {
  sessionId: Session["id"];
  rememberMe: boolean;
};
export async function setUnferifiedCookie(options: UnverifiedCookie) {
  cookies().set({
    name: unverifiedCookieKey,
    value: JSON.stringify(options),
    secure: env.NODE_ENV === "production",
    httpOnly: true,
    sameSite: "strict",
  });
}
export {
  redirectToQueryParam,
  targetQueryParam,
  typeQueryParam,
  twoFAVerificationType,
  VerificationTypeSchema,
  VerifySchema,
  type VerificationTypes,
  type VerifySchemaType,
  twoFAVerifyVerificationType,
  codeQueryParam,
};

export function getUnverifiedCookie() {
  const cookie = cookies().get(unverifiedCookieKey);
  if (!cookie) return null;
  return JSON.parse(cookie.value) as UnverifiedCookie;
}

export function deleteUnverifiedCookie() {
  cookies().delete(unverifiedCookieKey);
}
