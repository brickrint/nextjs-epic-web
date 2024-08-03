"use server";

import { db } from "@/utils/db.server";
import { invariantError } from "@/utils/misc";
import { redirect } from "next/navigation";

type ActionResult<P = Record<string, unknown>> = { error?: string } & P;

type EditState = { noteId: string; username: string };
export async function edit(
  prevState: ActionResult<EditState>,
  formData: FormData,
): Promise<ActionResult<EditState>> | never {
  const title = formData.get("title");
  const content = formData.get("content");

  invariantError(typeof title === "string", "Title is required");

  invariantError(typeof content === "string", "Content is required");

  db.note.update({
    where: { id: { equals: prevState.noteId } },
    data: { title, content },
  });

  redirect(`/users/${prevState.username}/notes`);
}

export async function remove(
  { noteId, username }: EditState,
  formData: FormData,
) {
  const intent = formData.get("intent");

  invariantError(intent === "delete", "Invalid intent");

  db.note.delete({ where: { id: { equals: noteId } } });

  redirect(`/users/${username}/notes`);
}
