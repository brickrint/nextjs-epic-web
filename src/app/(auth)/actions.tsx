"use server";

import { db } from "@/server/db";
import { parseWithZod as parse } from "@conform-to/zod";
import { generateTOTP, verifyTOTP } from "@epic-web/totp";
import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { z } from "zod";

import {
  login as loginUser,
  logout as logoutUser,
  reserUserPassword,
  signup as signupUser,
} from "@/utils/auth.server";
import { sendEmail } from "@/utils/email.server";
import { checkHoneypot } from "@/utils/honeypot.server";
import {
  createCookie as createSessionCookie,
  deleteCookie,
  getCookieSessionId,
} from "@/utils/session.server";
import {
  createCookie as createVerificationCookie,
  deleteCookie as deleteVerificationCookie,
  getCookie as getVerificationEmail,
} from "@/utils/verification.server";

import { ForgotPasswordEmail, SignupEmail } from "./emails";
import {
  ForgotPasswordSchema,
  LoginFormSchema,
  ResetPasswordSchema,
  SignupSchema,
  type VerificationTypes,
  VerifySchema,
  codeQueryParam,
  redirectToQueryParam,
  targetQueryParam,
  typeQueryParam,
} from "./schema";
import { SignupFormSchema } from "./schema";

export async function signup(_: unknown, formData: FormData) {
  checkHoneypot(formData);

  const submission = await parse(formData, {
    schema: SignupSchema.superRefine(async (data, ctx) => {
      const existingUser = await db.user.findUnique({
        where: { email: data.email },
        select: { id: true },
      });
      if (existingUser) {
        ctx.addIssue({
          path: ["email"],
          code: z.ZodIssueCode.custom,
          message: "A user already exists with this email",
        });
        return;
      }
    }),

    async: true,
  });

  if (submission.status !== "success") {
    return submission.reply();
  }

  const { email, redirectTo = "" } = submission.value;

  const { otp, redirectTo: redirectToURL } = await prepareVerification({
    target: email,
    period: 10 * 60,
    type: "onboarding",
    redirectTo,
  });

  const response = await sendEmail({
    to: email,
    subject: `Welcome to Epic Notes!`,
    react: <SignupEmail otp={otp} />,
  });

  if (response.status !== "success") {
    return submission.reply();
  }

  redirect(`/verify?${redirectToURL}`);
}

export async function onboard(_: unknown, formData: FormData) {
  checkHoneypot(formData);

  const email = await getVerificationEmail("/signup");

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
      const { username, name, password } = data;
      const session = await signupUser({ username, name, password, email });

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

  await deleteVerificationCookie();

  revalidatePath("/");
  redirect(redirectTo);
}

export async function verify(_: unknown, formData: FormData) {
  checkHoneypot(formData);
  return validateRequest(formData);
}

async function validateRequest(body: FormData) {
  const submission = await parse(body, {
    schema() {
      return VerifySchema.superRefine(async (data, ctx) => {
        const verification = await db.verification.findUnique({
          select: {
            secret: true,
            period: true,
            digits: true,
            algorithm: true,
            charSet: true,
          },
          where: {
            type_target: {
              target: data[targetQueryParam],
              type: data[typeQueryParam],
            },
            OR: [{ expiresAt: { gt: new Date() } }, { expiresAt: null }],
          },
        });

        if (!verification) {
          ctx.addIssue({
            path: [codeQueryParam],
            code: z.ZodIssueCode.custom,
            message: `Invalid code`,
          });
          return z.NEVER;
        }

        const codeIsValid = await verifyTOTP({
          otp: data[codeQueryParam],
          ...verification,
        });
        if (!codeIsValid) {
          ctx.addIssue({
            path: [codeQueryParam],
            code: z.ZodIssueCode.custom,
            message: `Invalid code`,
          });
          return z.NEVER;
        }
      });
    },
    async: true,
  });

  if (submission.status !== "success") {
    return submission.reply();
  }

  const { value: submissionValue } = submission;

  const target = submissionValue[targetQueryParam];
  const type = submissionValue[typeQueryParam];
  const redirectTo = submissionValue[redirectToQueryParam];

  await db.verification.delete({
    where: {
      type_target: {
        target,
        type,
      },
    },
  });

  await createVerificationCookie(submissionValue[targetQueryParam]);

  redirect(`/${type}${redirectTo ? `?${redirectTo}` : ""}`);
}

export async function login(_: unknown, formData: FormData) {
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

async function prepareVerification({
  period = 10 * 60,
  type,
  target,
  redirectTo,
}: {
  period?: number;
  type: VerificationTypes;
  target: string;
  redirectTo?: string;
}) {
  const { otp, ...verificationConfig } = await generateTOTP({
    algorithm: "SHA-256",
    period,
  });

  const verificationData = {
    type,
    target,
    ...verificationConfig,
    expiresAt: new Date(Date.now() + verificationConfig.period * 1000),
  };

  await db.verification.upsert({
    where: {
      type_target: {
        target,
        type,
      },
    },
    create: verificationData,
    update: verificationData,
  });

  const redirectToSearchParams = new URLSearchParams();

  if (redirectTo) {
    redirectToSearchParams.set(redirectToQueryParam, redirectTo);
  }
  redirectToSearchParams.set(typeQueryParam, type);
  redirectToSearchParams.set(targetQueryParam, target);

  return {
    otp,
    redirectTo: redirectToSearchParams.toString(),
  };
}

export async function forgotPassword(_: unknown, formData: FormData) {
  checkHoneypot(formData);

  const submission = await parse(formData, {
    schema() {
      return ForgotPasswordSchema.transform(async (data, ctx) => {
        const user = await db.user.findFirst({
          where: {
            OR: [
              { email: data.usernameOrEmail },
              { username: data.usernameOrEmail },
            ],
          },
          select: { id: true, email: true, username: true },
        });

        if (!user) {
          ctx.addIssue({
            path: ["usernameOrEmail"],
            code: z.ZodIssueCode.custom,
            message: "No user exists with this username or email",
          });
          return z.NEVER;
        }

        return { user };
      });
    },
    async: true,
  });

  if (submission.status !== "success") {
    return submission.reply();
  }

  const { user } = submission.value;

  const { otp, redirectTo } = await prepareVerification({
    target: user.username,
    type: "reset-password",
  });

  const response = await sendEmail({
    to: user.email,
    subject: `Epic Notes Password Reset`,
    react: <ForgotPasswordEmail otp={otp} />,
  });

  if (response.status !== "success") {
    return submission.reply({ formErrors: [response.error.message] });
  }

  redirect(`/verify?${redirectTo}`);
}

export async function resetPassword(_: unknown, formData: FormData) {
  const resetPasswordUsername = await getVerificationEmail("/login");

  console.log("resetPasswordUsername", resetPasswordUsername);

  const submission = parse(formData, {
    schema: ResetPasswordSchema,
  });

  if (submission.status !== "success") {
    return submission.reply();
  }
  const { password } = submission.value;

  await reserUserPassword({
    username: resetPasswordUsername,
    password,
  });

  await deleteVerificationCookie();

  console.log(
    "### resetPasswordUsername, password",
    resetPasswordUsername,
    password,
  );

  revalidatePath("/");
  redirect("/login");
}
