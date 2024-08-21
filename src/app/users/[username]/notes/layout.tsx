import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";

import { getUserImgSrc } from "@/utils/misc.server";

import { NavLink } from "../_components/link";
import { getUser } from "../db";
import { type PageProps } from "../page";

const navLinkDefaultClassName =
  "line-clamp-2 block rounded-l-full py-2 pl-8 pr-6 text-base lg:text-xl";

export default async function NotesRoute({
  children,
  params,
}: Readonly<{ children: React.ReactNode } & PageProps>) {
  const { username } = params;

  const user = await getUser(username);
  const ownerDisplayName = user.name ?? user.username;

  return (
    <main className="container flex h-full min-h-[400px] px-0 pb-12 md:px-8">
      <div className="grid w-full grid-cols-4 bg-muted pl-2 md:container md:mx-2 md:rounded-3xl md:pr-0">
        <div className="relative col-span-1">
          <div className="absolute inset-0 flex flex-col">
            <Link
              href={`/users/${username}`}
              className="flex flex-col items-center justify-center gap-2 bg-muted pb-4 pl-8 pr-4 pt-12 lg:flex-row lg:justify-start lg:gap-4"
            >
              <Image
                src={getUserImgSrc(user.image?.id)}
                alt={ownerDisplayName}
                width={64}
                height={64}
                quality={100}
                className="h-16 w-16 rounded-full object-cover lg:h-24 lg:w-24"
              />
              <h1 className="text-base font-bold md:text-lg lg:text-left lg:text-2xl">
                {ownerDisplayName}`s Notes
              </h1>
            </Link>
            <ul className="overflow-y-auto overflow-x-hidden pb-12">
              {user.notes.map((note) => (
                <li key={note.id} className="p-1 pr-0">
                  <NavLink
                    scroll={false}
                    href={`/users/${username}/notes/${note.id}`}
                    className={navLinkDefaultClassName}
                    activeClassName="bg-accent"
                  >
                    {note.title}
                  </NavLink>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="relative col-span-3 bg-accent md:rounded-r-3xl">
          {children}
        </div>
      </div>
    </main>
  );
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const user = await getUser(params.username);
  const displayName = user.name ?? params.username;
  const noteCount = user.notes.length ?? 0;
  const notesText = noteCount === 1 ? "note" : "notes";

  return {
    title: `${displayName}'s Notes | Epic Notes`,
    description: `Checkout ${displayName}'s ${noteCount} ${notesText} on Epic Notes`,
  };
}
