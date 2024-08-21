import { db as prisma } from "@/server/db";
import type { Note } from "@prisma/client";
import { notFound } from "next/navigation";
import "server-only";

import { db } from "@/utils/db.server";

export async function getNote(id: Note["id"]) {
  const note = await prisma.note.findFirst({
    where: {
      id: { equals: id },
    },
    select: {
      id: true,
      title: true,
      content: true,
      images: { select: { id: true, altText: true } },
      owner: { select: { name: true, username: true } },
    },
  });

  if (!note) {
    notFound();
  }

  return note;
}

export function updateNote({ id, title, content }: Note) {
  db.note.update({
    where: { id: { equals: id } },
    data: { title, content },
  });
}

export async function getUser(username: string) {
  const user = await prisma.user.findFirst({
    where: { username: { equals: username } },
    select: {
      id: true,
      name: true,
      username: true,
      email: true,
      createdAt: true,
      notes: {
        select: {
          id: true,
          title: true,
          content: true,
          images: { select: { altText: true, id: true } },
        },
      },
      image: { select: { id: true } },
    },
  });

  if (!user) {
    notFound();
  }

  return user;
}

export async function getUsersByUsername(searchTerm = "") {
  const users = await prisma.user.findMany({
    where: {
      username: {
        contains: searchTerm,
      },
    },
    select: {
      id: true,
      username: true,
      name: true,
      image: { select: { id: true } },
    },
  });

  return users;
}

export async function getNotes(username: string) {
  const owner = await prisma.user.findUnique({
    where: { username },
    select: {
      name: true,
      username: true,
      notes: {
        select: {
          id: true,
          title: true,
        },
      },
      image: { select: { id: true } },
    },
  });

  if (!owner) {
    notFound();
  }

  return {
    owner,
    notes: owner.notes,
  };
}
