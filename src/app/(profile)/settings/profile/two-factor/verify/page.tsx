import { db } from "@/server/db";
import { getTOTPAuthUri } from "@epic-web/totp";
import Image from "next/image";
import { redirect } from "next/navigation";
import * as QRCode from "qrcode";

import { getUser } from "@/utils/session.server";
import { twoFAVerifyVerificationType } from "@/utils/verification.server";

import { Form } from "./_components/form";

export default async function VerifyPage() {
  const user = await getUser();

  const verification = await db.verification.findUnique({
    where: {
      type_target: { type: twoFAVerifyVerificationType, target: user.id },
      expiresAt: { gt: new Date() },
    },
    select: {
      id: true,
      algorithm: true,
      secret: true,
      period: true,
      digits: true,
    },
  });

  if (!verification) {
    redirect("/settings/profile/two-factor");
  }

  const otpUri = getTOTPAuthUri({
    ...verification,
    accountName: user.email,
    issuer: "localhost:3000",
  });

  const qrCode = await QRCode.toDataURL(otpUri);

  return (
    <div>
      <div className="flex flex-col items-center gap-4">
        <Image
          alt="qr code"
          src={qrCode}
          className="h-56 w-56"
          width="224"
          height="224"
        />
        <p>Scan this QR code with your authenticator app.</p>
        <p className="text-sm">
          If you cannot scan the QR code, you can manually add this account to
          your authenticator app using this code:
        </p>
        <div className="p-3">
          <pre
            className="whitespace-pre-wrap break-all text-sm"
            aria-label="One-time Password URI"
          >
            {otpUri}
          </pre>
        </div>
        <p className="text-sm">
          Once you`ve added the account, enter the code from your authenticator
          app below. Once you enable 2FA, you will need to enter a code from
          your authenticator app every time you log in or perform important
          actions. Do not lose access to your authenticator app, or you will
          lose access to your account.
        </p>
        <div className="flex w-full max-w-xs flex-col justify-center gap-4">
          <Form />
        </div>
      </div>
    </div>
  );
}
