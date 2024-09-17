"use server";

import { db } from "@/server/db";
import { parseWithZod as parse } from "@conform-to/zod";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { z } from "zod";

import { bcrypt } from "@/utils/auth.server";
import { checkHoneypot } from "@/utils/honeypot.server";
import { createCookie as createSessionCookie } from "@/utils/session.server";

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
      // 🐨 retrieve the password they entered from data here as well
      const { username, email, name, password } = data;

      const user = await db.user.create({
        select: { id: true },
        data: {
          email: email.toLowerCase(),
          username: username.toLowerCase(),
          name,
          // 🐨 create a password here using bcrypt.hash (the async version)
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

  const { user } = submission.value;

  await createSessionCookie(cookies(), {
    userId: user.id,
  });

  redirect("/");
}
