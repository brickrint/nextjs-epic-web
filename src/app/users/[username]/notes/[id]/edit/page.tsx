"use client";
import { useFormState } from "react-dom";
import { notFound } from "next/navigation";
import { floatingToolbarClassName } from "@/app/_components/floating-toolbar";
import { Textarea } from "@/app/_components/ui/textarea";
import { Button } from "@/app/_components/ui/button";
import { Input } from "@/app/_components/ui/input";
import { Label } from "@/app/_components/ui/label";
import { db } from "@/utils/db.server";
import { edit } from "@/app/users/[username]/notes/actions";
import { StatusButton } from "../../../_components/status-button";

export default function NoteEdit({
  params,
}: {
  params: { id: string; username: string };
}) {
  const [, updateNote] = useFormState(edit, {
    noteId: params.id,
    username: params.username,
  });

  const note = db.note.findFirst({
    where: {
      id: {
        equals: params.id,
      },
    },
  });

  if (!note) {
    notFound();
  }

  return (
    <form
      action={updateNote}
      className="flex h-full flex-col gap-y-4 overflow-x-hidden px-10 pb-28 pt-12"
    >
      <div className="flex flex-col gap-1">
        <div>
          {/* 🦉 NOTE: this is not an accessible label, we'll get to that in the accessibility exercises */}
          <Label>Title</Label>
          <Input name="title" defaultValue={note.title} />
        </div>
        <div>
          {/* 🦉 NOTE: this is not an accessible label, we'll get to that in the accessibility exercises */}
          <Label>Content</Label>
          <Textarea name="content" defaultValue={note.content} />
        </div>
      </div>

      <div className={floatingToolbarClassName}>
        <Button variant="destructive" type="reset">
          Reset
        </Button>

        <StatusButton type="submit">Submit</StatusButton>
      </div>
    </form>
  );
}
