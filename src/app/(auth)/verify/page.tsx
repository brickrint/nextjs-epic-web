import { searchParams } from "next-extra/pathname";

import { Spacer } from "@/app/_components/spacer";
import {
  VerificationTypeSchema,
  type VerificationTypes,
  codeQueryParam,
  redirectToQueryParam,
  targetQueryParam,
  typeQueryParam,
} from "@/utils/verification.server";

import { Form } from "./_components/form";

const checkEmail = (
  <>
    <h1 className="text-h1">Check your email</h1>
    <p className="mt-3 text-body-md text-muted-foreground">
      We`ve sent you a code to verify your email address.
    </p>
  </>
);

const headings: Record<VerificationTypes, React.ReactNode> = {
  onboarding: checkEmail,
  "reset-password": checkEmail,
  "change-email": checkEmail,
  "2fa": (
    <>
      <h1 className="text-h1">Check your 2FA app</h1>
      <p className="mt-3 text-body-md text-muted-foreground">
        Please enter your 2FA code to verify your identity.
      </p>
    </>
  ),
};

export default async function VerifyPage() {
  const params = searchParams();

  const type = VerificationTypeSchema.parse(params.get(typeQueryParam));
  const target = params.get(targetQueryParam) ?? "";
  const redirectTo = params.get(redirectToQueryParam) ?? "";
  const code = params.get(codeQueryParam) ?? "";

  return (
    <div className="container flex flex-col justify-center pb-32 pt-20">
      <div className="text-center">{headings[type]}</div>

      <Spacer size="xs" />

      <Form code={code} redirectTo={redirectTo} target={target} type={type} />
    </div>
  );
}
