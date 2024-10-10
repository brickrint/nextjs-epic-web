import type { Metadata } from "next";

import { requireAnonymous } from "@/utils/session.server";
import { getCookie as getVerificationEmail } from "@/utils/verification.server";

import { Form } from "./_components/form";

export default async function ResetPasswordPage() {
  await requireAnonymous();

  const resetPasswordUsername = await getVerificationEmail("/login");

  return (
    <div className="container flex flex-col justify-center pb-32 pt-20">
      <div className="text-center">
        <h1 className="text-h1">Password Reset</h1>
        <p className="mt-3 text-body-md text-muted-foreground">
          Hi, {resetPasswordUsername}. No worries. It happens all the time.
        </p>
      </div>
      <Form />
    </div>
  );
}

export const metadata: Metadata = { title: "Reset Password | Epic Notes" };
