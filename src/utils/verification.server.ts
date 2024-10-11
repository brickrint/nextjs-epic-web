import { addMinutes } from "date-fns";
import * as jose from "jose";
import { searchParams } from "next-extra/pathname";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import "server-only";

import { env } from "@/env";

const SESSION_EXPIRATION_TIME = 10;
function getSessionExpirationTime(date = new Date()) {
  return addMinutes(date, SESSION_EXPIRATION_TIME);
}

const secret = new TextEncoder().encode(env.SESSION_SECRET);

const cookieKey = "enVerificationKey";

type VerificationPayload = {
  email: string;
};

export async function createCookie(email: VerificationPayload["email"]) {
  const expires = getSessionExpirationTime();

  const value = await new jose.SignJWT({ email })
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
    return payload.email;
  } catch {
    redirect(redirectTo);
  }
}

export async function deleteCookie() {
  cookies().delete(cookieKey);
}
