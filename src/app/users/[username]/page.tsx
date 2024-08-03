import { db } from "@/utils/db.server";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

export function getUser(username: string) {
  const user = db.user.findFirst({
    where: { username: { equals: username } },
  });

  if (!user) {
    notFound();
  }

  return user;
}

export type PageProps = { params: { username: string; id: string } };

export default function UserPage({ params }: PageProps) {
  const user = getUser(params.username);

  return (
    <div className="container mb-48 mt-36">
      <h1 className="text-h1">{user.name ?? user.username}</h1>
      <Link href={`${params.username}/notes`} className="underline">
        Notes
      </Link>
    </div>
  );
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const user = getUser(params.username);
  const displayName = user.name ?? params.username;

  return {
    title: `${displayName} | Epic Notes`,
    description: `Profile of ${displayName} on Epic Notes`,
  };
}
