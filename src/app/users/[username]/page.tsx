import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";

import { Spacer } from "@/app/_components/spacer";
import { Button } from "@/app/_components/ui/button";
import { getUserImgSrc } from "@/utils/misc.server";

import { getUser } from "./db";

export type PageProps = { params: { username: string; id: string } };

export default async function UserPage({ params }: PageProps) {
  const user = await getUser(params.username);
  const userDisplayName = user.name ?? user.username;
  const userJoinedDisplay = user.createdAt.toLocaleDateString();

  return (
    <div className="container mb-48 mt-36 flex flex-col items-center justify-center">
      <Spacer size="4xs" />

      <div className="container flex flex-col items-center rounded-3xl bg-muted p-12">
        <div className="relative w-52">
          <div className="absolute -top-40">
            <div className="relative">
              <Image
                src={getUserImgSrc(user.image?.id)}
                alt={userDisplayName}
                width={208}
                height={208}
                className="h-52 w-52 rounded-full object-cover"
              />
            </div>
          </div>
        </div>

        <Spacer size="sm" />

        <div className="flex flex-col items-center">
          <div className="flex flex-wrap items-center justify-center gap-4">
            <h1 className="text-center text-h2">{userDisplayName}</h1>
          </div>
          <p className="mt-2 text-center text-muted-foreground">
            Joined {userJoinedDisplay}
          </p>
          <div className="mt-10 flex gap-4">
            <Button asChild>
              <Link href={`${params.username}/notes`}>
                {userDisplayName}`s notes
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const user = await getUser(params.username);
  const displayName = user.name ?? params.username;

  return {
    title: `${displayName} | Epic Notes`,
    description: `Profile of ${displayName} on Epic Notes`,
  };
}
