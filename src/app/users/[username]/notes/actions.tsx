"use server";

import { invariantError } from "@/utils/misc.server";
import { redirect, RedirectType } from "next/navigation";
import { parseWithZod } from "@conform-to/zod";

import { updateNote } from "@/utils/db.server";
import { NoteEditorSchema } from "./schema";
import { deleteNote } from "../db";

type EditState = { noteId: string; username: string };

export async function edit(
  { noteId, username }: EditState,
  _: unknown,
  formData: FormData,
) {
  const submission = parseWithZod(formData, {
    schema: NoteEditorSchema,
  });

  if (submission.status !== "success") {
    return submission.reply();
  }

  const { title, content } = submission.value;

  await updateNote({
    id: noteId,
    title,
    content,
    images: [
      {
        // @ts-expect-error 🦺 we'll fix this in the next exercise
        id: formData.get("imageId"),
        // @ts-expect-error 🦺 we'll fix this in the next exercise
        file: formData.get("file"),
        // @ts-expect-error 🦺 we'll fix this in the next exercise
        altText: formData.get("altText"),
      },
    ],
  });

  redirect(`/users/${username}/notes`);
}

export async function remove(
  { noteId, username }: EditState,
  formData: FormData,
) {
  const intent = formData.get("intent");

  invariantError(intent === "delete", "Invalid intent");

  deleteNote(noteId);

  redirect(`/users/${username}/notes`, RedirectType.replace);
}
