"use server";

import { db as prisma } from "@/server/db";
import { parseWithZod as parse } from "@conform-to/zod";
import { createId as cuid } from "@paralleldrive/cuid2";
import { RedirectType, redirect } from "next/navigation";

import { checkHoneypot } from "@/utils/honeypot.server";
import { invariantError } from "@/utils/misc.server";

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

  await prisma.note.update({
    select: { id: true },
    where: { id: noteId },
    data: {
      title,
      content,
    },
  });

  await prisma.noteImage.deleteMany({
    where: {
      id: { notIn: imageUpdates.map((i) => i.id) },
      noteId,
    },
  });

  for (const updates of imageUpdates) {
    await prisma.noteImage.update({
      select: { id: true },
      where: { id: updates.id },
      data: { ...updates, id: updates.blob ? cuid() : updates.id },
    });
  }

  for (const newImage of newImages) {
    await prisma.noteImage.create({
      select: { id: true },
      data: { ...newImage, noteId },
    });
  }

  redirect(`/users/${username}/notes/${noteId}`);
}

export async function remove(
  { noteId, username }: EditState,
  formData: FormData,
) {
  const intent = formData.get("intent");

  invariantError(intent === "delete", "Invalid intent");

  await prisma.note.delete({
    where: {
      id: noteId,
    },
  });

  redirect(`/users/${username}/notes`, RedirectType.replace);
}
