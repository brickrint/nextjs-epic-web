import * as E from "@react-email/components";

export function EmailChangeEmail({ otp }: { otp: string }) {
  return (
    <E.Html lang="en" dir="ltr">
      <E.Container>
        <h1>
          <E.Text>Epic Notes Email Change</E.Text>
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

export function EmailChangeNoticeEmail({ userId }: { userId: string }) {
  return (
    <E.Html lang="en" dir="ltr">
      <E.Container>
        <h1>
          <E.Text>Your Epic Notes email has been changed</E.Text>
        </h1>
        <p>
          <E.Text>
            We`re writing to let you know that your Epic Notes email has been
            changed.
          </E.Text>
        </p>
        <p>
          <E.Text>
            If you changed your email address, then you can safely ignore this.
            But if you did not change your email address, then please contact
            support immediately.
          </E.Text>
        </p>
        <p>
          <E.Text>Your Account ID: {userId}</E.Text>
        </p>
      </E.Container>
    </E.Html>
  );
}
