import { db } from "@/server/db";
import * as jose from "jose";
import type { ReadonlyRequestCookies } from "next/dist/server/web/spec-extension/adapters/request-cookies";
import { cookies } from "next/headers";
import { cache } from "react";

import { env } from "@/env";

import { getSessionExpirationTime } from "./auth.server";

type UserInfo = {
  userId: string;
};

const tokenKey = "en_session";

const secret = new TextEncoder().encode(env.SESSION_SECRET);

export async function createCookie(
  cookies: ReadonlyRequestCookies,
  userInfo: UserInfo,
  remember = false,
) {
  const expires = getSessionExpirationTime();

  const value = await new jose.SignJWT(userInfo)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setIssuer("urn:example:issuer")
    .setAudience("urn:example:audience")
    .setExpirationTime(expires)
    .sign(secret);

  cookies.set({
    name: tokenKey,
    value,
    secure: env.NODE_ENV === "production",
    path: "/",
    sameSite: "lax",
    expires: remember ? expires : undefined,
    httpOnly: true,
  });
}

export async function deleteCookie(cookies: ReadonlyRequestCookies) {
  cookies.delete(tokenKey);
}

export async function getCookie(cookies: ReadonlyRequestCookies) {
  const signedValue = cookies.get(tokenKey);

  if (!signedValue) {
    return null;
  }

  try {
    const { payload } = await jose.jwtVerify<UserInfo>(
      signedValue?.value,
      secret,
    );
    return payload;
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
  } catch (_) {
    return null;
  }
}

async function getSignedinUser() {
  const userInfo = await getCookie(cookies());

  if (!userInfo?.userId) {
    return null;
  }

  return db.user.findUnique({
    where: {
      id: userInfo.userId,
    },
    select: {
      id: true,
      name: true,
      username: true,
      image: {
        select: {
          id: true,
        },
      },
    },
  });
}

export const getOptionalUser = cache(getSignedinUser);

export const getUser = cache(async () => {
  const maybeUser = await getSignedinUser();

  if (!maybeUser) {
    throw new Error(
      "No user found in root loader, but user is required by useUser. If user is optional, try useOptionalUser instead.",
    );
  }

  return maybeUser;
});
