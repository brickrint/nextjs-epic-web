import Link from "next/link";
import type { Metadata } from "next";

import { NavLink } from "../_components/link";
import { type PageProps } from "../page";
import { getNotes } from "../db";

const navLinkDefaultClassName =
  "line-clamp-2 block rounded-l-full py-2 pl-8 pr-6 text-base lg:text-xl";

export default function NotesRoute({
  children,
  params,
}: Readonly<{ children: React.ReactNode } & PageProps>) {
  const { username } = params;

  const { owner, notes } = getNotes(username);
  const ownerDisplayName = owner.name ?? owner.username;

  return (
    <main className="container flex h-full min-h-[400px] px-0 pb-12 md:px-8">
      <div className="grid w-full grid-cols-4 bg-muted pl-2 md:container md:mx-2 md:rounded-3xl md:pr-0">
        <div className="relative col-span-1">
          <div className="absolute inset-0 flex flex-col">
            <Link href="." className="pb-4 pl-8 pr-4 pt-12">
              <h1 className="text-base font-bold md:text-lg lg:text-left lg:text-2xl">
                {ownerDisplayName}`s Notes
              </h1>
            </Link>
            <ul className="overflow-y-auto overflow-x-hidden pb-12">
              {notes.map((note) => (
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
  const { owner, notes } = getNotes(params.username);
  const displayName = owner.name ?? params.username;
  const noteCount = notes.length ?? 0;
  const notesText = noteCount === 1 ? "note" : "notes";

  return {
    title: `${displayName}'s Notes | Epic Notes`,
    description: `Checkout ${displayName}'s ${noteCount} ${notesText} on Epic Notes`,
  };
}
