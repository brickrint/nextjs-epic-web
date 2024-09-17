"use server";

import { db } from "@/server/db";
import { parseWithZod as parse } from "@conform-to/zod";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { z } from "zod";

import { bcrypt } from "@/utils/auth.server";
import { checkHoneypot } from "@/utils/honeypot.server";
import { createCookie as createSessionCookie } from "@/utils/session.server";

import { LoginFormSchema } from "./schema";

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
          // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-argument
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

  const { user } = submission.value;

  await createSessionCookie(cookies(), {
    userId: user.id,
  });

  redirect("/");
}
