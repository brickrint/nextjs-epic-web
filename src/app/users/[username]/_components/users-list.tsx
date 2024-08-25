import Image from "next/image";
import Link from "next/link";

import { getUserImgSrc } from "@/utils/misc.server";
import { cn } from "@/utils/styles";

import { getUsersByUsername } from "../db";

export async function UsersList({
  searchTerm,
}: {
  searchTerm: string | undefined;
}) {
  const users = await getUsersByUsername(searchTerm);

  return (
    <ul
      className={cn(
        "flex w-full flex-wrap items-center justify-center gap-4 delay-200",
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
              src={getUserImgSrc(user.imageId)}
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
  );
}
