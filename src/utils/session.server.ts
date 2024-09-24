import { db } from "@/server/db";
import * as jose from "jose";
import { pathname } from "next-extra/pathname";
import type { ReadonlyRequestCookies } from "next/dist/server/web/spec-extension/adapters/request-cookies";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
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

export function deleteCookie(cookies: ReadonlyRequestCookies) {
  cookies.delete(tokenKey);
}

async function verify() {
  const signedValue = cookies().get(tokenKey);

  if (!signedValue) {
    return null;
  }

  try {
    const { payload } = await jose.jwtVerify<UserInfo>(
      signedValue?.value,
      secret,
    );
    return payload.userId;
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
  } catch (_) {
    redirect("/api/logout");
  }
}

export async function getUserId() {
  const cookieValue = await verify();

  if (!cookieValue) {
    return null;
  }

  const user = await db.user.findUnique({
    where: {
      id: cookieValue,
    },
    select: {
      id: true,
    },
  });

  if (!user) {
    redirect("/api/logout");
  }

  return user.id;
}

async function getSignedinUser() {
  const userId = await getUserId();

  if (!userId) {
    return null;
  }

  const user = await db.user.findUnique({
    where: {
      id: userId,
    },
    select: {
      id: true,
      name: true,
      username: true,
      email: true,
      image: {
        select: {
          id: true,
        },
      },
    },
  });

  return user;
}

export const getOptionalUser = cache(getSignedinUser);

export const getUser = cache(async () => {
  const maybeUser = await getSignedinUser();

  if (!maybeUser) {
    const redirectPath = pathname();
    const seachParams = new URLSearchParams({ redirect: redirectPath });

    redirect(`/login?${seachParams.toString()}`);
  }

  return maybeUser;
});

export async function requireAnonymous() {
  const user = await getOptionalUser();

  if (user) {
    redirect("/");
  }
}
