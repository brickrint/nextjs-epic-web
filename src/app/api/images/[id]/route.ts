import { createReadableStreamFromReadable } from "@remix-run/node";
import { type NextRequest, NextResponse } from "next/server";
import fs from "node:fs";
import { PassThrough } from "node:stream";

import { db } from "@/utils/db.server";
import { invariantResponse } from "@/utils/misc.server";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } },
) {
  if (!params.id) return invariantResponse("Invalid image ID");
  const image = db.image.findFirst({
    where: { id: { equals: params.id } },
  });
  if (!image) return invariantResponse("Image not found", { status: 404 });

  const { filepath, contentType } = image;
  const fileStat = await fs.promises.stat(filepath);
  const body = new PassThrough();
  const stream = fs.createReadStream(filepath);
  stream.on("open", () => stream.pipe(body));
  stream.on("error", (err) => body.end(err));
  stream.on("end", () => body.end());

  return new NextResponse(createReadableStreamFromReadable(body), {
    status: 200,
    headers: {
      "content-type": contentType,
      "content-length": fileStat.size.toString(),
      "content-disposition": `inline; filename="${params.id}"`,
      "cache-control": "public, max-age=31536000, immutable",
    },
  });
}

export async function POST(
  request: NextRequest,
  params: { params: { id: string } },
) {
  console.log("request", request);
  console.log("params", params);

  return NextResponse.redirect(request.headers.get("referer")!);
}
