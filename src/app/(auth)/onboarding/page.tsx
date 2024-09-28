import type { Metadata } from "next";

import { Spacer } from "@/app/_components/spacer";
import { requireAnonymous } from "@/utils/session.server";
import { getCookie as getVerificationEmail } from "@/utils/verification.server";

import { Form } from "./_components/form";

export default async function OnboardingPage() {
  await requireAnonymous();

  const email = await getVerificationEmail();

  return (
    <div className="container flex min-h-full flex-col justify-center pb-32 pt-20">
      <div className="mx-auto w-full max-w-lg">
        <div className="flex flex-col gap-3 text-center">
          <h1 className="text-h1">Welcome aboard {email}!</h1>
          <p className="text-body-md text-muted-foreground">
            Please enter your details.
          </p>
        </div>
        <Spacer size="xs" />
        <Form />
      </div>
    </div>
  );
}

export const metadata: Metadata = { title: "Setup Epic Notes Account" };
