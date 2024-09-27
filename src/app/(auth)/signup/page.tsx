import type { Metadata } from "next";

import { Spacer } from "@/app/_components/spacer";
// import { sendEmail } from "@/utils/email.server";
import { requireAnonymous } from "@/utils/session.server";

import { Form } from "./_components/form";

export default async function SignupPage() {
  await requireAnonymous();

  // 🐨 uncomment this to test it out:
  // const response = await sendEmail({
  //   to: "kody@kcd.dev",
  //   subject: "Hello World",
  //   text: "This is the plain text version",
  //   html: "<p>This is the HTML version</p>",
  // });
  // console.log("⚛️ response", response);
  // you should get a log with an error

  return (
    <div className="container flex min-h-full flex-col justify-center pb-32 pt-20">
      <div className="mx-auto w-full max-w-lg">
        <div className="flex flex-col gap-3 text-center">
          <h1 className="text-h1">Welcome aboard!</h1>
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
