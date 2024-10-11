import { getUser } from "@/utils/session.server";

import { Form } from "./_components/form";

export default async function Page() {
  const user = await getUser();

  return <Form user={user} />;
}
