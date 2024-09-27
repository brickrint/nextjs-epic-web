import { ClockIcon, Pencil1Icon, TrashIcon } from "@radix-ui/react-icons";
import { type Metadata } from "next";
import Image from "next/image";
import Link from "next/link";

import { floatingToolbarClassName } from "@/app/_components/floating-toolbar";
import { Button } from "@/app/_components/ui/button";
import { StatusButton } from "@/app/_components/ui/status-button";
import { AuthenticityTokenInput } from "@/utils/csrf.client";
import { getNoteImgSrc } from "@/utils/misc.server";
import { userHasPermission } from "@/utils/permissions";
import { getUser } from "@/utils/session.server";

import { getNote } from "../../db";
import { type PageProps } from "../../page";
import { remove } from "../actions";

export default async function NotePage({ params }: Readonly<PageProps>) {
  const note = await getNote(params.id);

  const deleteNote = remove.bind(null, {
    noteId: params.id,
    username: params.username,
  });

  const user = await getUser();

  const isOwner = note.ownerId === user.id;

  const canDelete = userHasPermission(
    user,
    isOwner ? `delete:note:own` : `delete:note:any`,
  );
  const displayBar = canDelete || isOwner;

  return (
    <div className="absolute inset-0 flex flex-col px-10">
      <h2 className="mb-2 pt-12 text-h2 lg:mb-6">{note.title}</h2>
      <div className={`${displayBar ? "pb-24" : "pb-12"} overflow-y-auto`}>
        <ul className="flex flex-wrap gap-5 py-5">
          {note.images.map((image) => {
            const src = getNoteImgSrc(image.id);
            return (
              <li key={image.id}>
                <a href={src}>
                  <Image
                    src={src}
                    alt={image.altText ?? ""}
                    width={200}
                    height={200}
                    quality={100}
                    className="h-32 w-32 rounded-lg object-cover"
                  />
                </a>
              </li>
            );
          })}
        </ul>
      </div>
      <p className="whitespace-break-spaces text-sm md:text-lg">
        {note.content}
      </p>
      {displayBar ? (
        <div className={floatingToolbarClassName}>
          <span className="text-sm text-foreground/90 max-[524px]:hidden inline-flex items-center gap-1.5">
            <ClockIcon name="clock" className="scale-150" />
            {note.timeAgo} ago
          </span>
          <div className="grid flex-1 grid-cols-2 justify-end gap-2 min-[525px]:flex md:gap-4">
            {canDelete ? (
              <form action={deleteNote}>
                <AuthenticityTokenInput />
                <StatusButton
                  type="submit"
                  variant="destructive"
                  name="intent"
                  value="delete"
                  className="inline-flex items-center gap-1.5"
                >
                  <span className="inline-flex items-center gap-1.5">
                    <TrashIcon
                      name="trash"
                      className="scale-125 max-md:scale-150"
                    />
                    <span>Delete</span>
                  </span>
                </StatusButton>
              </form>
            ) : null}
            <Button asChild>
              <Link href={`${note.id}/edit`}>
                <span className="inline-flex items-center gap-1.5">
                  <Pencil1Icon
                    name="trash"
                    className="scale-125 max-md:scale-150"
                  />
                  <span>Edit</span>
                </span>
              </Link>
            </Button>
          </div>
        </div>
      ) : null}
    </div>
  );
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const note = await getNote(params.id);

  const displayName = note.owner.name ?? params.username;
  const noteTitle = note.title ?? "Note";
  const noteContentsSummary =
    note.content.length > 100
      ? note.content.slice(0, 97) + "..."
      : "No content";

  return {
    title: `${noteTitle} | ${displayName}'s Notes | Epic Notes`,
    description: noteContentsSummary,
  };
}
