"use client";

import { Button } from "@/app/_components/ui/button";
import { getErrorMessage } from "@/utils/misc.server";

export default function Error({
  error,
  reset,
}: {
  error: Error;
  reset: () => void;
}) {
  const { message } = getErrorMessage(error);
  return (
    <div className="container mx-auto flex h-full w-full items-center justify-center bg-destructive p-20 text-h2 text-destructive-foreground">
      <p>{message}</p>
      <Button onClick={reset} variant="default">
        Try again
      </Button>
    </div>
  );
}
