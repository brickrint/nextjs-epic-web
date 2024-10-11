import { Spacer } from "@/app/_components/spacer";

import { Form } from "./_components/form";

export default async function VerifyPage() {
  return (
    <div className="container flex flex-col justify-center pb-32 pt-20">
      <div className="text-center">
        <h1 className="text-h1">Check your email</h1>
        <p className="mt-3 text-body-md text-muted-foreground">
          We`ve sent you a code to verify your email address.
        </p>
      </div>

      <Spacer size="xs" />

      <Form />
    </div>
  );
}
