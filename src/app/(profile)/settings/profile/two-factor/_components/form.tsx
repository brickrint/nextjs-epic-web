import { enable2FA } from "@/app/(profile)/actions";
import { StatusButton } from "@/app/_components/ui/status-button";
import { AuthenticityTokenInput } from "@/utils/csrf.client";

export function Form() {
  return (
    <form action={enable2FA}>
      <AuthenticityTokenInput />
      <StatusButton
        type="submit"
        name="intent"
        value="enable"
        className="mx-auto"
      >
        Enable 2FA
      </StatusButton>
    </form>
  );
}
