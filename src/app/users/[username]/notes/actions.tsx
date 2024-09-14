"use server";

import { db } from "@/server/db";
import { parseWithZod as parse } from "@conform-to/zod";
import { createId as cuid } from "@paralleldrive/cuid2";
import { cookies } from "next/headers";
import { RedirectType, redirect } from "next/navigation";

import { checkHoneypot } from "@/utils/honeypot.server";
import { invariantError } from "@/utils/misc.server";
import { ThemeFormSchema, setTheme } from "@/utils/theme.server";
import { createCookie as createToastCookie } from "@/utils/toast.server";

import { NoteEditorSchema, imageHasFile, imageHasId } from "./schema";

type EditState = { noteId: string; username: string };

export async function edit(
  { noteId, username }: EditState,
  _: unknown,
  formData: FormData,
) {
  invariantError(noteId || username, "Invalid note ID or username");

  checkHoneypot(formData);

  const submission = await parse(formData, {
    schema: NoteEditorSchema.transform(async ({ images = [], ...data }) => {
      return {
        ...data,
        images,
        imageUpdates: await Promise.all(
          images.filter(imageHasId).map(async (i) => {
            if (imageHasFile(i)) {
              return {
                id: i.id,
                altText: i.altText,
                contentType: i.file.type,
                blob: Buffer.from(await i.file.arrayBuffer()),
              };
            } else {
              return { id: i.id, altText: i.altText };
            }
          }),
        ),
        newImages: await Promise.all(
          images
            .filter(imageHasFile)
            .filter((i) => !i.id)
            .map(async (image) => {
              return {
                altText: image.altText,
                contentType: image.file.type,
                blob: Buffer.from(await image.file.arrayBuffer()),
              };
            }),
        ),
      };
    }),
    async: true,
  });

  if (submission.status !== "success") {
    return submission.reply();
  }

  const {
    title,
    content,
    imageUpdates = [],
    newImages = [],
  } = submission.value;

  await db.note.update({
    select: { id: true },
    where: { id: noteId },
    data: {
      title,
      content,
      images: {
        deleteMany: {
          id: { notIn: imageUpdates.map((i) => i.id) },
        },
        updateMany: imageUpdates.map((updates) => ({
          where: { id: updates.id },
          data: { ...updates, id: updates.blob ? cuid() : updates.id },
        })),
        create: newImages,
      },
    },
  });

  redirect(`/users/${username}/notes/${noteId}`);
}

export async function remove(
  { noteId, username }: EditState,
  formData: FormData,
) {
  const intent = formData.get("intent");

  invariantError(intent === "delete", "Invalid intent");

  await db.note.delete({
    where: {
      id: noteId,
    },
  });

  createToastCookie(cookies(), {
    type: "success",
    title: "Note deleted",
    description: "Your note has been deleted",
  });

  redirect(`/users/${username}/notes`, RedirectType.replace);
}

export async function toggleTheme(_: unknown, formData: FormData) {
  invariantError(formData.get("intent") === "update-theme", "Invalid intent");

  const submission = parse(formData, {
    schema: ThemeFormSchema,
  });

  if (submission.status !== "success") {
    return submission.reply();
  }

  setTheme(cookies(), submission.value.theme);
}
