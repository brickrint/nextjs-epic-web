"use server";

import { db } from "@/server/db";
import { parseWithZod as parse } from "@conform-to/zod";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { z } from "zod";

import { bcrypt } from "@/utils/auth.server";
import { checkHoneypot } from "@/utils/honeypot.server";
import {
  createCookie as createSessionCookie,
  deleteCookie,
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

      const user = await db.user.create({
        select: { id: true },
        data: {
          email: email.toLowerCase(),
          username: username.toLowerCase(),
          name,
          password: {
            create: {
              hash: await bcrypt.hash(password, 10),
            },
          },
        },
      });

      return { ...data, user };
    }),
    async: true,
  });

  if (submission.status !== "success") {
    return submission.reply();
  }

  if (!submission.value?.user) {
    return submission.reply();
  }

  const { user, remember = false } = submission.value;

  await createSessionCookie(
    cookies(),
    {
      userId: user.id,
    },
    remember,
  );

  redirect("/");
}

export async function login(_prevState: unknown, formData: FormData) {
  checkHoneypot(formData);

  const submission = await parse(formData, {
    schema() {
      return LoginFormSchema.transform(async (data, ctx) => {
        const userWithPassword = await db.user.findUnique({
          select: { id: true, password: { select: { hash: true } } },
          where: { username: data.username },
        });
        if (!userWithPassword?.password) {
          ctx.addIssue({
            code: "custom",
            message: "Invalid username or password",
          });
          return z.NEVER;
        }

        const isVerified = await bcrypt.compare(
          data.password,
          userWithPassword.password.hash,
        );

        if (!isVerified) {
          ctx.addIssue({
            code: "custom",
            message: "Invalid username or password",
          });
          return z.NEVER;
        }

        return { ...data, user: { id: userWithPassword.id } };
      });
    },
    async: true,
  });
  // get the password off the payload that's sent back
  delete submission.payload.password;

  if (submission.status !== "success") {
    return submission.reply();
  }

  const { user, remember = false } = submission.value;

  await createSessionCookie(
    cookies(),
    {
      userId: user.id,
    },
    remember,
  );

  redirect("/");
}

export async function logout() {
  await deleteCookie(cookies());
  redirect("/");
}
