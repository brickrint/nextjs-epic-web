import * as E from "@react-email/components";

export function SignupEmail({ otp }: { otp: string }) {
  return (
    <E.Html lang="en" dir="ltr">
      <E.Container>
        <h1>
          <E.Text>Welcome to Epic Notes!</E.Text>
        </h1>
        <p>
          <E.Text>
            Here`s your verification code: <strong>{otp}</strong>
          </E.Text>
        </p>
        <p>
          <E.Text>Or click the link to get started:</E.Text>
        </p>
      </E.Container>
    </E.Html>
  );
}

export function ForgotPasswordEmail({ otp }: { otp: string }) {
  return (
    <E.Html lang="en" dir="ltr">
      <E.Container>
        <h1>
          <E.Text>Epic Notes Password Reset</E.Text>
        </h1>
        <p>
          <E.Text>
            Here`s your verification code: <strong>{otp}</strong>
          </E.Text>
        </p>
        <p>
          <E.Text>Or click the link:</E.Text>
        </p>
      </E.Container>
    </E.Html>
  );
}
