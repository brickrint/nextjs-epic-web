import { EditForm } from "./edit-form";
import { getNote } from "../../../db";

export default function NoteEdit({
  params,
}: {
  params: { id: string; username: string };
}) {
  const note = getNote(params.id);

  return (
    <div className="absolute inset-0">
      <EditForm noteId={params.id} username={params.username} note={note} />
    </div>
  );
}

export const dynamic = "force-dynamic";
