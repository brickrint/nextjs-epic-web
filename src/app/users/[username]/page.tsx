import { db } from "@/utils/db.server";
import Link from "next/link";
import { notFound } from "next/navigation";

export default function Page({ params }: { params: { username: string } }) {
  const user = db.user.findFirst({
    where: { username: { equals: params.username } },
  });

  if (!user) {
    notFound();
  }

  return (
    <div className="container mb-48 mt-36">
      <h1 className="text-h1">{user.name ?? user.username}</h1>
      <Link href={`${params.username}/notes`} className="underline">
        Notes
      </Link>
    </div>
  );
}
