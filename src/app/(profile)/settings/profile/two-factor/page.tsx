import { CheckIcon, LockOpen1Icon } from "@radix-ui/react-icons";
import Link from "next/link";

import { get2FAUser, requireUserId } from "@/utils/session.server";

import { Form } from "./_components/form";

export default async function TwoFactorRoute() {
  const userId = await requireUserId();

  const isTwoFAEnabled = Boolean(await get2FAUser(userId));

  return (
    <div className="flex flex-col gap-4">
      {isTwoFAEnabled ? (
        <>
          <p className="text-lg">
            <span className="flex items-center gap-1 5">
              <CheckIcon />
              You have enabled two-factor authentication.
            </span>
          </p>
          <Link
            href="/two-factor/disable"
            className="p-0 inline-flex items-center gap-1.5"
          >
            <LockOpen1Icon />
          </Link>
        </>
      ) : (
        <>
          <p>
            <span className="flex items-center gap-1.5">
              <LockOpen1Icon />
              You have not enabled two-factor authentication yet.
            </span>
          </p>
          <p className="text-sm">
            Two factor authentication adds an extra layer of security to your
            account. You will need to enter a code from an authenticator app
            like{" "}
            <a className="underline" href="https://1password.com/">
              1Password
            </a>{" "}
            to log in.
          </p>
          <Form />
        </>
      )}
    </div>
  );
}
