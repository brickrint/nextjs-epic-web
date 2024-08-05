"use server";

import { db } from "@/utils/db.server";
import { invariantError } from "@/utils/misc";
import { redirect, RedirectType } from "next/navigation";
import { contentMaxLength, titleMaxLength } from "./[id]/edit/page";

type EditState = { noteId: string; username: string };

type ActionErrors = {
  formErrors: Array<string>;
  fieldErrors: {
    title: Array<string>;
    content: Array<string>;
  };
};

export async function edit(
  { noteId, username }: EditState,
  _prevState: unknown,
  formData: FormData,
) {
  const title = formData.get("title");
  const content = formData.get("content");

  invariantError(typeof title === "string", "Title is required");
  invariantError(typeof content === "string", "Content is required");

  const errors: ActionErrors = {
    formErrors: [],
    fieldErrors: {
      title: [],
      content: [],
    },
  };

  if (title === "") {
    errors.fieldErrors.title.push("Title is required");
  }

  if (title.length > titleMaxLength) {
    errors.fieldErrors.title.push(
      `Title must be at most ${titleMaxLength} characters`,
    );
  }

  if (content === "") {
    errors.fieldErrors.content.push("Content is required");
  }

  if (content.length > contentMaxLength) {
    errors.fieldErrors.content.push(
      `Content must be at most ${contentMaxLength} characters`,
    );
  }

  const hasErrors =
    errors.formErrors.length ||
    Object.values(errors.fieldErrors).some((fieldErrors) => fieldErrors.length);

  if (hasErrors) {
    return { status: "error", errors } as const;
  }

  db.note.update({
    where: { id: { equals: noteId } },
    data: { title, content },
  });

  redirect(`/users/${username}/notes`);
}

export async function remove(
  { noteId, username }: EditState,
  formData: FormData,
) {
  const intent = formData.get("intent");

  invariantError(intent === "delete", "Invalid intent");

  db.note.delete({ where: { id: { equals: noteId } } });

  redirect(`/users/${username}/notes`, RedirectType.replace);
}
