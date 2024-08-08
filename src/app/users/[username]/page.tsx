import type { Metadata } from "next";
import Link from "next/link";
import { getUser } from "./db";

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
