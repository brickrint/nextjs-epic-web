import { db } from "@/server/db";
import { type NextRequest, NextResponse } from "next/server";

import { invariantResponse } from "@/utils/misc.server";

export async function GET(
  _request: NextRequest,
  { params }: { params: { id: string } },
) {
  if (!params.id) return invariantResponse("Invalid image ID");

  const image = await db.userImage.findFirst({
    where: { id: { equals: params.id } },
    select: { contentType: true, blob: true },
  });
  if (!image) return invariantResponse("Image not found", { status: 404 });

  const { contentType, blob } = image;

  return new NextResponse(blob, {
    status: 200,
    headers: {
      "content-type": contentType,
      "content-length": Buffer.byteLength(blob).toString(),
      "content-disposition": `inline; filename="${params.id}"`,
      "cache-control": "public, max-age=31536000, immutable",
    },
  });
}
