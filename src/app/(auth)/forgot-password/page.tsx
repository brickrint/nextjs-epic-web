import type { Metadata } from "next";

import { requireAnonymous } from "@/utils/session.server";

import { Form } from "./_components/form";

export default async function ForgotPasswordPage() {
  await requireAnonymous();

  return (
    <div className="container pb-32 pt-20">
      <div className="flex flex-col justify-center">
        <div className="text-center">
          <h1 className="text-h1">Forgot Password</h1>
          <p className="mt-3 text-body-md text-muted-foreground">
            No worries, we`ll send you reset instructions.
          </p>
        </div>
        <Form />
      </div>
    </div>
  );
}

export const metadata: Metadata = { title: "Password Recovery for Epic Notes" };
