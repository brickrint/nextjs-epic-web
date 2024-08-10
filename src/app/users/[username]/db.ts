import { notFound } from "next/navigation";
import "server-only";

import { db } from "@/utils/db.server";

export type Note = {
  id: string;
  title: string;
  content: string;
};

export function getNote(id: Note["id"]) {
  const note = db.note.findFirst({
    where: {
      id: { equals: id },
    },
  });

  if (!note) {
    notFound();
  }

  return {
    id: note.id,
    title: note.title,
    content: note.content,
    images: note.images.map(({ id, altText }) => ({ id, altText })),
  };
}

export function deleteNote(id: Note["id"]) {
  db.note.delete({ where: { id: { equals: id } } });
}

export function updateNote({ id, title, content }: Note) {
  db.note.update({
    where: { id: { equals: id } },
    data: { title, content },
  });
}

export function getUser(username: string) {
  const user = db.user.findFirst({
    where: { username: { equals: username } },
  });

  if (!user) {
    notFound();
  }

  return user;
}

export function getNotes(username: string) {
  const owner = getUser(username);

  const notes = db.note
    .findMany({
      where: {
        owner: {
          id: { equals: owner.id },
        },
      },
    })
    .map(({ id, title }) => ({ id, title }));

  return {
    owner,
    notes,
  };
}
