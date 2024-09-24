import type { Metadata } from "next";

import { Spacer } from "@/app/_components/spacer";
import { requireAnonymous } from "@/utils/session.server";

import { Form } from "./_components/form";

export default async function LoginPage() {
  await requireAnonymous();

  return (
    <div className="flex min-h-full flex-col justify-center pb-32 pt-20">
      <div className="mx-auto w-full max-w-md">
        <div className="flex flex-col gap-3 text-center">
          <h1 className="text-h1">Welcome back!</h1>
          <p className="text-body-md text-muted-foreground">
            Please enter your details.
          </p>
        </div>
        <Spacer size="xs" />

        <div>
          <Form />
        </div>
      </div>
    </div>
  );
}

export const metadata: Metadata = { title: "Login to Epic Notes" };
