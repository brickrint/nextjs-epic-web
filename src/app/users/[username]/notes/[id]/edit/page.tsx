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
import { useId } from "react";

export const titleMaxLength = 100;
export const contentMaxLength = 10000;

export default function NoteEdit({
  params,
}: {
  params: { id: string; username: string };
}) {
  const formId = useId();

  const editAction = edit.bind(null, {
    noteId: params.id,
    username: params.username,
  });
  const [actionState, updateNote] = useFormState(editAction, undefined);

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

  const fieldErrors =
    actionState?.status === "error" ? actionState.errors.fieldErrors : null;
  const formErrors =
    actionState?.status === "error" ? actionState.errors.formErrors : null;

  return (
    <div className="absolute inset-0">
      <form
        action={updateNote}
        id={formId}
        className="flex h-full flex-col gap-y-4 overflow-x-hidden px-10 pb-28 pt-12"
      >
        <div className="flex flex-col gap-1">
          <div>
            {/* 🦉 NOTE: this is not an accessible label, we'll get to that in the accessibility exercises */}
            <Label htmlFor="note-title">Title</Label>
            <Input
              id="note-title"
              name="title"
              defaultValue={note.title}
              required
              maxLength={titleMaxLength}
            />
            <div className="min-h-[32px] px-4 pb-3 pt-1">
              <ErrorList errors={fieldErrors?.title} />
            </div>
          </div>
          <div>
            {/* 🦉 NOTE: this is not an accessible label, we'll get to that in the accessibility exercises */}
            <Label htmlFor="note-content">Content</Label>
            <Textarea
              id="note-content"
              name="content"
              defaultValue={note.content}
              required
              maxLength={contentMaxLength}
            />
            <div className="min-h-[32px] px-4 pb-3 pt-1">
              <ErrorList errors={fieldErrors?.content} />
            </div>
          </div>
        </div>
        <ErrorList errors={formErrors} />
      </form>
      <div className={floatingToolbarClassName}>
        <Button form={formId} variant="destructive" type="reset">
          Reset
        </Button>

        <StatusButton form={formId} type="submit">
          Submit
        </StatusButton>
      </div>
    </div>
  );
}

function ErrorList({ errors }: { errors?: Array<string> | null }) {
  return errors?.length ? (
    <ul className="flex flex-col gap-1">
      {errors.map((error, i) => (
        <li key={i} className="text-[10px] text-foreground-destructive">
          {error}
        </li>
      ))}
    </ul>
  ) : null;
}
