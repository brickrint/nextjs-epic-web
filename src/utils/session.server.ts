import { db } from "@/server/db";
import type { Session } from "@prisma/client";
import * as jose from "jose";
import { pathname } from "next-extra/pathname";
import type { ReadonlyRequestCookies } from "next/dist/server/web/spec-extension/adapters/request-cookies";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { cache } from "react";

import { env } from "@/env";

import { getSessionExpirationTime } from "./auth.server";

type SessionInfo = Pick<Session, "id" | "expirationDate">;

const tokenKey = "enSessionKey";

const secret = new TextEncoder().encode(env.SESSION_SECRET);

export async function createCookie(
  cookies: ReadonlyRequestCookies,
  sessionInfo: SessionInfo,
  remember = false,
) {
  const expires = getSessionExpirationTime();

  const value = await new jose.SignJWT(sessionInfo)
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

export async function getCookieSessionId() {
  const signedValue = cookies().get(tokenKey);

  if (!signedValue) {
    return null;
  }

  try {
    const { payload } = await jose.jwtVerify<SessionInfo>(
      signedValue?.value,
      secret,
    );
    return payload.id;
  } catch {
    redirect("/api/logout");
  }
}

export async function getSession() {
  const cookieValue = await getCookieSessionId();

  if (!cookieValue) {
    return null;
  }

  const session = await db.session.findUnique({
    select: {
      id: true,
      user: { select: { id: true } },
    },
    where: {
      id: cookieValue,
      expirationDate: { gt: new Date() },
    },
  });

  if (!session) {
    redirect("/api/logout");
  }

  return session;
}

export async function getSessionId() {
  const session = await getSession();

  if (!session) return null;

  return session.id;
}

export async function getUserId() {
  const session = await getSession();

  if (!session) return null;

  return session.user.id;
}

export async function requireUserId() {
  const userId = await getUserId();

  if (!userId) {
    redirect("/api/logout");
  }

  return userId;
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
      roles: {
        select: {
          permissions: { select: { action: true, access: true, entity: true } },
          name: true,
        },
      },
      _count: {
        select: {
          sessions: {
            where: {
              expirationDate: { gt: new Date() },
            },
          },
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
