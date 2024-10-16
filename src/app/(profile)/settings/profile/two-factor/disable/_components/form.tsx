"use client";

import { disable2FA } from "@/app/(profile)/actions";
import { StatusButton } from "@/app/_components/ui/status-button";
import { AuthenticityTokenInput } from "@/utils/csrf.client";
import { useDoubleCheck } from "@/utils/misc.client";

export async function Form() {
  const dc = useDoubleCheck();

  return (
    <form action={disable2FA}>
      <AuthenticityTokenInput />
      <p>
        Disabling two factor authentication is not recommended. However, if you
        would like to do so, click here:
      </p>
      <StatusButton
        variant="destructive"
        {...dc.getButtonProps({
          className: "mx-auto",
          name: "intent",
          value: "disable",
          type: "submit",
        })}
      >
        {dc.doubleCheck ? "Are you sure?" : "Disable 2FA"}
      </StatusButton>
    </form>
  );
}
