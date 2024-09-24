import { db } from "@/server/db";
import { type NextRequest, NextResponse } from "next/server";

import {
  getDomainUrl,
  getNoteImgSrc,
  getUserImgSrc,
} from "@/utils/misc.server";
import { getUser } from "@/utils/session.server";

export async function GET(request: NextRequest) {
  const { id } = await getUser();

  const user = await db.user.findUniqueOrThrow({
    where: { id },
    include: {
      image: {
        select: {
          id: true,
          createdAt: true,
          updatedAt: true,
          contentType: true,
        },
      },
      notes: {
        include: {
          images: {
            select: {
              id: true,
              createdAt: true,
              updatedAt: true,
              contentType: true,
            },
          },
        },
      },
      password: false,
    },
  });

  const domain = getDomainUrl(request);

  return NextResponse.json({
    user: {
      ...user,
      image: user.image
        ? {
            ...user.image,
            url: `${domain}${getUserImgSrc(user.image.id)}`,
          }
        : null,
      notes: user.notes.map((note) => ({
        ...note,
        images: note.images.map((image) => ({
          ...image,
          url: `${domain}${getNoteImgSrc(image.id)}`,
        })),
      })),
    },
  });
}
