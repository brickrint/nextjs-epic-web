import { redirect } from "next/navigation";

import { getUser } from "@/utils/session.server";

import { NoteEditor } from "../../../_components/note-editor";
import { getNote } from "../../../db";
import { edit } from "../../actions";

export default async function NoteEdit({
  params,
}: {
  params: { id: string; username: string };
}) {
  const user = await getUser();

  if (user.username !== params.username) {
    redirect("/");
  }

  const note = await getNote(params.id);
  const editAction = edit.bind(null, {
    noteId: note.id,
    username: user.username,
  });

  return <NoteEditor note={note} action={editAction} />;
}
