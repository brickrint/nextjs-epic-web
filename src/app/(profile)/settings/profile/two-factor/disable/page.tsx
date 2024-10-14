import { requireUserId } from "@/utils/session.server";

import { Form } from "./_components/form";

export default async function DisableTwoFactorPage() {
  await requireUserId();

  return (
    <div className="mx-auto max-w-sm">
      <Form />
    </div>
  );
}
