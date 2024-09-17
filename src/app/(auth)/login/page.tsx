import type { Metadata } from "next";
import Link from "next/link";

import { Spacer } from "@/app/_components/spacer";

import { Form } from "./_components/form";

export default function LoginPage() {
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
          <div className="mx-auto w-full max-w-md px-8">
            <Form />
            <div className="flex items-center justify-center gap-2 pt-6">
              <span className="text-muted-foreground">New here?</span>
              <Link href="/signup">Create an account</Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export const metadata: Metadata = { title: "Login to Epic Notes" };
