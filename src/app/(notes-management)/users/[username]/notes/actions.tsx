"use server";

import { db } from "@/server/db";
import { parseWithZod as parse } from "@conform-to/zod";
import { createId as cuid } from "@paralleldrive/cuid2";
import type { Note, User } from "@prisma/client";
import { cookies } from "next/headers";
import { RedirectType, redirect } from "next/navigation";

import { checkHoneypot } from "@/utils/honeypot.server";
import { invariantError } from "@/utils/misc.server";
import { requireUserWithPermission } from "@/utils/permissions";
import { getUser } from "@/utils/session.server";
import { ThemeFormSchema, setTheme } from "@/utils/theme.server";
import {
  createToastRedirect,
  invariantToastRedirect,
} from "@/utils/toast.server";

import { NoteEditorSchema, imageHasFile, imageHasId } from "./schema";

type NoteActionArgs = { noteId: Note["id"]; username: User["username"] };

async function createEdit(
  formData: FormData,
  { noteId }: Partial<NoteActionArgs> = {},
) {
  const user = await getUser();

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

  const updatedNote = await db.note.upsert({
    select: { id: true, owner: { select: { username: true } } },
    where: { id: noteId ?? "__new_note__" },
    create: {
      title,
      content,
      images: { create: newImages },
      owner: { connect: { id: user.id } },
    },
    update: {
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

  redirect(`/users/${updatedNote.owner.username}/notes/${updatedNote.id}`);
}

export async function edit(
  { noteId }: NoteActionArgs,
  _: unknown,
  formData: FormData,
) {
  invariantError(noteId, "Invalid note ID");
  checkHoneypot(formData);

  return createEdit(formData, { noteId });
}

export async function create(_: unknown, formData: FormData) {
  checkHoneypot(formData);

  return createEdit(formData);
}

export async function remove(
  { noteId, username }: NoteActionArgs,
  formData: FormData,
) {
  const intent = formData.get("intent");

  invariantError(intent === "delete", "Invalid intent");

  const note = await db.note.findFirst({
    select: { owner: { select: { username: true, id: true } } },
    where: { id: noteId },
  });

  invariantToastRedirect(
    note,
    {
      type: "error",
      title: "Note not found",
      description: "The note you are trying to delete does not exist",
    },
    `/users/${username}/notes`,
    RedirectType.replace,
  );

  const isOwner = note.owner.username === username;
  await requireUserWithPermission(
    isOwner ? `delete:note:own` : `delete:note:any`,
  );

  await db.note.delete({ where: { id: noteId } });

  createToastRedirect(
    {
      type: "success",
      title: "Note deleted",
      description: "Your note has been deleted",
    },
    `/users/${note.owner.username}/notes`,
    RedirectType.replace,
  );
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
