import { db } from "@/server/db";
import type { Note } from "@prisma/client";
import { formatDistanceToNow } from "date-fns";
import { notFound } from "next/navigation";
import "server-only";
import { type z } from "zod";

import { env } from "@/env";

import { UserSearchResultsSchema } from "./notes/schema";

export async function getNote(id: Note["id"]) {
  const note = await db.note.findFirst({
    where: {
      id: { equals: id },
    },
    select: {
      id: true,
      title: true,
      content: true,
      updatedAt: true,
      images: { select: { id: true, altText: true } },
      owner: { select: { name: true, username: true } },
      ownerId: true,
    },
  });

  if (!note) {
    notFound();
  }

  const date = new Date(note.updatedAt);
  const timeAgo = formatDistanceToNow(date);

  return {
    ...note,
    timeAgo,
  };
}

export async function getUser(username: string) {
  const user = await db.user.findFirst({
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
  const like = `%${searchTerm ?? ""}%`;
  const rawUsers = await db.$queryRaw`
    SELECT User.id, User.username, User.name, UserImage.id AS imageId
    FROM User
    LEFT JOIN UserImage ON UserImage.userId = User.id
    WHERE username LIKE ${like} OR name LIKE ${like}
    ORDER BY (
      SELECT Note.updatedAt
			FROM Note
			WHERE Note.ownerId = user.id
			ORDER BY Note.updatedAt DESC
			LIMIT 1
    ) DESC
    LIMIT 50
  `;

  const users =
    env.NODE_ENV === "production"
      ? ({
          success: true,
          data: rawUsers as z.infer<typeof UserSearchResultsSchema>,
        } as const)
      : UserSearchResultsSchema.safeParse(rawUsers);

  if (!users.success) {
    return [];
  }

  return users.data;
}

export async function getNotes(username: string) {
  const owner = await db.user.findUnique({
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
