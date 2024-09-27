"use server";

import { db } from "@/server/db";
import { parseWithZod as parse } from "@conform-to/zod";
import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { z } from "zod";

import {
  login as loginUser,
  logout as logoutUser,
  signup as signupUser,
} from "@/utils/auth.server";
import { checkHoneypot } from "@/utils/honeypot.server";
import {
  createCookie as createSessionCookie,
  deleteCookie,
  getCookieSessionId,
} from "@/utils/session.server";

import { LoginFormSchema } from "./schema";
import { SignupFormSchema } from "./schema";

export async function signup(_prevState: unknown, formData: FormData) {
  checkHoneypot(formData);
  const submission = await parse(formData, {
    schema: SignupFormSchema.superRefine(async (data, ctx) => {
      const existingUser = await db.user.findUnique({
        where: { username: data.username },
        select: { id: true },
      });
      if (existingUser) {
        ctx.addIssue({
          path: ["username"],
          code: z.ZodIssueCode.custom,
          message: "A user already exists with this username",
        });
        return;
      }
    }).transform(async (data) => {
      const { username, email, name, password } = data;

      const session = await signupUser({ username, email, name, password });

      return { ...data, session };
    }),
    async: true,
  });

  if (submission.status !== "success") {
    return submission.reply();
  }

  if (!submission.value?.session) {
    return submission.reply();
  }

  const { session, remember = false, redirectTo = "/" } = submission.value;

  await createSessionCookie(
    cookies(),
    {
      id: session.id,
      expirationDate: session.expirationDate,
    },
    remember,
  );

  revalidatePath("/");
  redirect(redirectTo);
}

export async function login(_prevState: unknown, formData: FormData) {
  checkHoneypot(formData);

  const submission = await parse(formData, {
    schema() {
      return LoginFormSchema.transform(async (data, ctx) => {
        const session = await loginUser({
          username: data.username,
          password: data.password,
        });

        if (!session) {
          ctx.addIssue({
            code: "custom",
            message: "Invalid username or password",
          });
          return z.NEVER;
        }

        return { ...data, session };
      });
    },
    async: true,
  });
  // get the password off the payload that's sent back
  delete submission.payload.password;

  if (submission.status !== "success") {
    return submission.reply();
  }

  const { session, remember = false, redirectTo = "/" } = submission.value;

  await createSessionCookie(
    cookies(),
    {
      id: session.id,
      expirationDate: session.expirationDate,
    },
    remember,
  );

  revalidatePath("/");
  redirect(redirectTo);
}

export async function logout() {
  const session = await getCookieSessionId();
  if (session) {
    void logoutUser(session);
  }
  deleteCookie(cookies());
  revalidatePath("/");
  redirect("/");
}
