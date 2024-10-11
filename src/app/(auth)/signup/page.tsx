import type { Metadata } from "next";

import { requireAnonymous } from "@/utils/session.server";

import { Form } from "./_components/form";

export default async function SignupPage() {
  await requireAnonymous();

  return (
    <div className="container flex flex-col justify-center pb-32 pt-20">
      <div className="text-center">
        <h1 className="text-h1">Let`s start your journey!</h1>
        <p className="mt-3 text-body-md text-muted-foreground">
          Please enter your email.
        </p>
      </div>

      <div className="mx-auto mt-16 min-w-[368px] max-w-sm">
        <Form />
      </div>
    </div>
  );
}

export const metadata: Metadata = { title: "Setup Epic Notes Account" };
