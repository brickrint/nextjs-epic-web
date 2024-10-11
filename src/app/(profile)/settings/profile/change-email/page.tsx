import { getUser } from "@/utils/session.server";

import { Form } from "./_components/form";

export default async function ChangeEmailPage() {
  const user = await getUser();

  return (
    <div>
      <h1 className="text-h1">Change Email</h1>
      <p>You will receive an email at the new email address to confirm.</p>
      <p>An email notice will also be sent to your old address {user.email}.</p>
      <Form />
    </div>
  );
}
