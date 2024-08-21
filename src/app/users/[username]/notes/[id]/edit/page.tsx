import { getNote } from "../../../db";
import { EditForm } from "./edit-form";

export default async function NoteEdit({
  params,
}: {
  params: { id: string; username: string };
}) {
  const note = await getNote(params.id);

  return (
    <div className="absolute inset-0">
      <EditForm note={note} />
    </div>
  );
}

export const dynamic = "force-dynamic";
