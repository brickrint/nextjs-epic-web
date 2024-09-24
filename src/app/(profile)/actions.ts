"use server";

import { db } from "@/server/db";
import { parseWithZod as parse } from "@conform-to/zod";
import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { z } from "zod";

import { checkHoneypot } from "@/utils/honeypot.server";
import { invariantError } from "@/utils/misc.server";
import { deleteCookie, getCookie } from "@/utils/session.server";

import { PhotoFormSchema, ProfileFormSchema } from "./schema";

export async function profileUpdateAction(_: unknown, formData: FormData) {
  checkHoneypot(formData);

  const userId = await getCookie(cookies());

  invariantError(userId, "Invalid user");

  const submission = await parse(formData, {
    async: true,
    schema: ProfileFormSchema.superRefine(async ({ email, username }, ctx) => {
      const existingUsername = await db.user.findUnique({
        where: { username },
        select: { id: true },
      });
      if (existingUsername && existingUsername.id !== userId) {
        ctx.addIssue({
          path: ["username"],
          code: "custom",
          message: "A user already exists with this username",
        });
      }
      const existingEmail = await db.user.findUnique({
        where: { email },
        select: { id: true },
      });
      if (existingEmail && existingEmail.id !== userId) {
        ctx.addIssue({
          path: ["email"],
          code: "custom",
          message: "A user already exists with this email",
        });
      }
    }),
  });

  if (submission.status !== "success") {
    return submission.reply();
  }

  const data = submission.value;

  await db.user.update({
    select: { username: true },
    where: { id: userId },
    data: {
      name: data.name,
      username: data.username,
      email: data.email,
    },
  });

  revalidatePath("/");

  return submission.reply();
}

export async function deleteDataAction() {
  const cookiesList = cookies();
  const userId = await getCookie(cookiesList);

  invariantError(userId, "Invalid user");

  await db.user.delete({ where: { id: userId } });

  deleteCookie(cookiesList);

  revalidatePath("/");
  redirect("/");
}

export async function updateProfilePhoto(_: unknown, formData: FormData) {
  checkHoneypot(formData);

  const userId = await getCookie(cookies());

  invariantError(userId, "Invalid user");

  const intent = formData.get("intent");

  if (intent === "delete") {
    await db.userImage.deleteMany({ where: { userId } });
    revalidatePath("/");
    redirect("/settings/profile");
  }

  const submission = await parse(formData, {
    schema: PhotoFormSchema.transform(async (data) => {
      if (data.photoFile.size <= 0) return z.NEVER;
      return {
        image: {
          contentType: data.photoFile.type,
          blob: Buffer.from(await data.photoFile.arrayBuffer()),
        },
      };
    }),
    async: true,
  });

  if (submission.status !== "success") {
    return submission.reply();
  }

  const { image } = submission.value;

  await db.$transaction(async ($prisma) => {
    await $prisma.userImage.deleteMany({ where: { userId } });
    await $prisma.user.update({
      where: { id: userId },
      data: { image: { create: image } },
    });
  });

  revalidatePath("/");
  redirect("/settings/profile");
}
