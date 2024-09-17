"use client";

import Link from "next/link";
import { useParams } from "next/navigation";

import { Button } from "@/app/_components/ui/button";

export default function NotFound() {
  const params = useParams<{ username: string }>();
  return (
    <div className="flex h-full flex-col place-content-center place-items-center gap-y-4 overflow-x-hidden bg-primary px-10 pb-28 pt-12 text-h2 text-primary-foreground">
      <h2 className="text-h2">
        No user with the username `{params.username}` exists
      </h2>
      <Button asChild variant="secondary">
        <Link href="/" replace>
          Return Home
        </Link>
      </Button>
    </div>
  );
}
