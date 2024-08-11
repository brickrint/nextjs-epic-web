"use server";

import { parseWithZod } from "@conform-to/zod";
import { RedirectType, redirect } from "next/navigation";

import { updateNote } from "@/utils/db.server";
import { checkHoneypot } from "@/utils/honeypot.server";
import { invariantError } from "@/utils/misc.server";

import { deleteNote } from "../db";
import { NoteEditorSchema } from "./schema";

type EditState = { noteId: string; username: string };

export async function edit(
  { noteId, username }: EditState,
  _: unknown,
  formData: FormData,
) {
  invariantError(noteId || username, "Invalid note ID or username");

  checkHoneypot(formData);

  const submission = parseWithZod(formData, {
    schema: NoteEditorSchema,
  });

  if (submission.status !== "success") {
    return submission.reply();
  }

  const { title, content, images } = submission.value;

  await updateNote({
    id: noteId,
    title,
    content,
    images,
  });

  redirect(`/users/${username}/notes/${noteId}`);
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
