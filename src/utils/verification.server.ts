import { db } from "@/server/db";
import { generateTOTP } from "@epic-web/totp";
import { addMinutes } from "date-fns";
import * as jose from "jose";
import { searchParams } from "next-extra/pathname";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import "server-only";

import { env } from "@/env";

import {
  type VerificationTypes,
  redirectToQueryParam,
  targetQueryParam,
  typeQueryParam,
} from "@/app/(auth)/schema";

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
}: {
  period?: number;
  type: VerificationTypes;
  target: string;
  redirectTo?: string;
}) {
  const { otp, ...verificationConfig } = await generateTOTP({
    algorithm: "SHA-256",
    period,
  });

  const verificationData = {
    type,
    target,
    ...verificationConfig,
    expiresAt: new Date(Date.now() + verificationConfig.period * 1000),
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
