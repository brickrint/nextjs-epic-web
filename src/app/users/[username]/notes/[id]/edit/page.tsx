/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-return */
import { getNote } from "../../../db";
import { EditForm } from "./edit-form";

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
