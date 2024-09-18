import { NoteEditor } from "../../../_components/note-editor";
import { getNote } from "../../../db";
import { edit } from "../../actions";

export default async function NoteEdit({
  params,
}: {
  params: { id: string; username: string };
}) {
  const note = await getNote(params.id);
  const editAction = edit.bind(null, { noteId: note.id });

  return <NoteEditor note={note} action={editAction} />;
}
