import { redirect } from "next/navigation";

import { getUser } from "@/utils/session.server";

import { NoteEditor } from "../../_components/note-editor";
import { create } from "../actions";

export default async function NewNote({
  params,
}: {
  params: { username: string };
}) {
  const user = await getUser();

  if (user.username !== params.username) {
    redirect("/");
  }

  return <NoteEditor action={create} />;
}
