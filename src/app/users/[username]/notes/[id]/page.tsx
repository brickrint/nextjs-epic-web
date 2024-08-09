import { type Metadata } from "next";
import Image from "next/image";
import Link from "next/link";

import { floatingToolbarClassName } from "@/app/_components/floating-toolbar";
import { Button } from "@/app/_components/ui/button";
import { SubmitButton } from "@/app/_components/ui/submit-button";

import { remove } from "../actions";
import { type PageProps } from "../../page";
import { getNote, getUser } from "../../db";

export default function SomeNoteId({ params }: Readonly<PageProps>) {
  const note = getNote(params.id);

  const deleteNote = remove.bind(null, {
    noteId: params.id,
    username: params.username,
  });

  return (
    <>
      <h2 className="mb-2 pt-12 text-h2 lg:mb-6">{note.title}</h2>
      <div className="overflow-y-auto pb-24">
        <ul className="flex flex-wrap gap-5 py-5">
          {note.images.map((image) => {
            const src = `/api/images/${image.id}`;
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
        <p className="whitespace-break-spaces text-sm md:text-lg">
          {note.content}
        </p>
        <div className={floatingToolbarClassName}>
          <form action={deleteNote}>
            <SubmitButton
              type="submit"
              variant="destructive"
              name="intent"
              value="delete"
            >
              Delete
            </SubmitButton>
          </form>
          <Button asChild>
            <Link href={`${note.id}/edit`}>Edit</Link>
          </Button>
        </div>
      </div>
    </>
  );
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const owner = getUser(params.username);
  const note = getNote(params.id);

  const displayName = owner.name ?? params.username;
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
