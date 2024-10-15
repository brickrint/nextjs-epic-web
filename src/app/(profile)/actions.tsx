"use server";

import { db } from "@/server/db";
import { parseWithZod as parse } from "@conform-to/zod";
import type { User } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";

import { sendEmail } from "@/utils/email.server";
import { checkHoneypot } from "@/utils/honeypot.server";
import { getCookieSessionId, requireUserId } from "@/utils/session.server";
import { createToastRedirect } from "@/utils/toast.server";
import {
  type VerifySchemaType,
  createCookie as createVerificationCookie,
  deleteCookie as deleteVerificationCookie,
  getCookie as getVerificationCookie,
  isCodeValid,
  prepareVerification,
  twoFAVerificationType,
  twoFAVerifyVerificationType,
} from "@/utils/verification.server";

import { logout } from "../(auth)/actions";
import { EmailChangeEmail, EmailChangeNoticeEmail } from "./emails";
import {
  ChangeEmailSchema,
  PhotoFormSchema,
  ProfileFormSchema,
  VerifySchema,
} from "./schema";

export async function updateProfile(_: unknown, formData: FormData) {
  checkHoneypot(formData);

  const userId = await requireUserId();

  const submission = await parse(formData, {
    async: true,
    schema: ProfileFormSchema.superRefine(async ({ username }, ctx) => {
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
    },
  });

  revalidatePath("/", "layout");

  return submission.reply();
}

export async function deleteData() {
  const userId = await requireUserId();

  await db.user.delete({ where: { id: userId } });

  await logout();
}

export async function updateProfilePhoto(_: unknown, formData: FormData) {
  checkHoneypot(formData);

  const userId = await requireUserId();

  const intent = formData.get("intent");

  if (intent === "delete") {
    await db.userImage.deleteMany({ where: { userId } });
    revalidatePath("/", "layout");
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

  revalidatePath("/", "layout");
  redirect("/settings/profile");
}

export async function signOutOfSessions(userId: User["id"]) {
  const sessionId = await getCookieSessionId();
  if (!sessionId) return null;
  await db.session.deleteMany({ where: { id: { not: sessionId }, userId } });
  revalidatePath("/", "layout");
}

export async function changeEmail(_: unknown, formData: FormData) {
  const userId = await requireUserId();

  checkHoneypot(formData);

  const submission = await parse(formData, {
    schema: ChangeEmailSchema.superRefine(async (data, ctx) => {
      const existingUser = await db.user.findUnique({
        where: { email: data.email },
      });
      if (existingUser) {
        ctx.addIssue({
          path: ["email"],
          code: "custom",
          message: "This email is already in use.",
        });
      }
    }),
    async: true,
  });

  if (submission.status !== "success") {
    return submission.reply();
  }

  const { email: newEmail } = submission.value;

  const { otp, redirectTo } = await prepareVerification({
    target: userId,
    type: "change-email",
  });

  const response = await sendEmail({
    to: submission.value.email,
    subject: `Epic Notes Email Change Verification`,
    react: <EmailChangeEmail otp={otp} />,
  });

  if (response.status !== "success") {
    return submission.reply({ formErrors: [response.error.message] });
  }

  await createVerificationCookie(newEmail);

  redirect(`/verify?${redirectTo}`);
}

export async function handleEmailChange(submission: VerifySchemaType) {
  const newEmail = await getVerificationCookie("/login");

  const preUpdateUser = await db.user.findFirstOrThrow({
    select: { email: true },
    where: { id: submission.target },
  });

  const user = await db.user.update({
    where: { id: submission.target },
    select: { id: true, email: true, username: true },
    data: { email: newEmail },
  });

  void sendEmail({
    to: preUpdateUser.email,
    subject: "Epic Stack email changed",
    react: <EmailChangeNoticeEmail userId={user.id} />,
  });

  deleteVerificationCookie();

  createToastRedirect(
    {
      title: "Email Changed",
      type: "success",
      description: `Your email has been changed to ${user.email}`,
    },
    "/settings/profile",
  );
}

export async function enable2FA() {
  const userId = await requireUserId();

  await prepareVerification({
    type: twoFAVerifyVerificationType,
    target: userId,
    algorithm: "SHA-1",
    period: 30,
    expiresIn: 100000,
  });

  revalidatePath("/settings/profile/two-factor/verify");
  redirect("/settings/profile/two-factor/verify");
}

export async function verify2FA(_: unknown, formData: FormData) {
  const userId = await requireUserId();

  if (formData.get("intent") === "cancel") {
    await db.verification.deleteMany({
      where: { type: twoFAVerifyVerificationType, target: userId },
    });

    redirect("/settings/profile/two-factor");
  }
  const submission = await parse(formData, {
    schema: () =>
      VerifySchema.superRefine(async (data, ctx) => {
        const codeIsValid = await isCodeValid({
          code: data.code,
          type: twoFAVerifyVerificationType,
          target: userId,
        });

        if (!codeIsValid) {
          ctx.addIssue({
            path: ["code"],
            code: z.ZodIssueCode.custom,
            message: `Invalid code`,
          });
          return z.NEVER;
        }
      }),

    async: true,
  });

  if (submission.status !== "success") {
    return submission.reply();
  }

  await db.verification.update({
    where: {
      type_target: { type: twoFAVerifyVerificationType, target: userId },
    },
    data: { type: twoFAVerificationType, expiresAt: null },
  });

  revalidatePath("/settings/profile/two-factor");
  createToastRedirect(
    {
      type: "success",
      title: "Enabled",
      description: "Two-factor authentication has been enabled.",
    },
    "/settings/profile/two-factor",
  );
}

export async function disable2FA() {
  await requireUserId();

  revalidatePath("/settings/profile/two-factor");
  createToastRedirect(
    {
      title: "2FA Disabled (jk)",
      description: "This has not yet been implemented",
      type: "error",
    },
    "/settings/profile/two-factor",
  );
}
