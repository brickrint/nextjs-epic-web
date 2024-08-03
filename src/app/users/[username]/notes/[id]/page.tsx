import { floatingToolbarClassName } from "@/app/_components/floating-toolbar";
import { Button } from "@/app/_components/ui/button";
import { db } from "@/utils/db.server";
import Link from "next/link";
import { notFound } from "next/navigation";
import { SubmitButton } from "@/app/_components/ui/submit-button";
import { remove } from "../actions";

export default function SomeNoteId({
  params,
}: {
  params: { username: string; id: string };
}) {
  const note = db.note.findFirst({
    where: {
      id: { equals: params.id },
    },
  });

  const deleteNote = remove.bind(null, {
    noteId: params.id,
    username: params.username,
  });

  if (!note) {
    notFound();
  }

  return (
    <>
      <h2 className="text-h2 mb-2 pt-12 lg:mb-6">{note.title}</h2>
      <div className="overflow-y-auto pb-24">
        <p className="whitespace-break-spaces text-sm md:text-lg">
          {note.content}
        </p>
        <div className={floatingToolbarClassName}>
          <form action={deleteNote}>
            <SubmitButton
              type="submit"
              variant="destructive"
              name="intent"
              value="delete"
            >
              Delete
            </SubmitButton>
          </form>
          <Button asChild>
            <Link href={`${note.id}/edit`}>Edit</Link>
          </Button>
        </div>
      </div>
    </>
  );
}
