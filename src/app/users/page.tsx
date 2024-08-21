import Image from "next/image";
import Link from "next/link";

import { getUserImgSrc } from "@/utils/misc.server";
import { cn } from "@/utils/styles";

import { SharedSearchBar as SearchBar } from "../_components/search-bar";
import { getUsersByUsername } from "./[username]/db";

export default async function UsersPage({
  searchParams,
}: Readonly<{ searchParams: { search: string | undefined } }>) {
  const { search: searchTerm } = searchParams;

  const users = await getUsersByUsername(searchTerm);

  return (
    <div className="container mb-48 mt-36 flex flex-col items-center justify-center gap-6">
      <h1 className="text-h1">Epic Notes Users</h1>
      <div className="w-full max-w-[700px] ">
        <SearchBar autoFocus autoSubmit />
      </div>
      <main>
        {users.length ? (
          <ul
            className={cn(
              "flex w-full flex-wrap items-center justify-center gap-4 delay-200",
              // { "opacity-50": isPending },
            )}
          >
            {users.map((user) => (
              <li key={user.id}>
                <Link
                  href={`/users/${user.username}`}
                  className="flex h-36 w-44 flex-col items-center justify-center rounded-lg bg-muted px-5 py-3"
                >
                  <Image
                    alt={user.name ?? user.username}
                    src={getUserImgSrc(user.image?.id)}
                    className="h-16 w-16 rounded-full"
                    quality={100}
                    width="64"
                    height="64"
                  />
                  {user.name ? (
                    <span className="w-full overflow-hidden text-ellipsis whitespace-nowrap text-center text-body-md">
                      {user.name}
                    </span>
                  ) : null}
                  <span className="w-full overflow-hidden text-ellipsis text-center text-body-sm text-muted-foreground">
                    {user.username}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        ) : (
          <p>No users found</p>
        )}
      </main>
    </div>
  );
}
