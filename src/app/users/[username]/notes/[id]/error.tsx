"use client";

import { Button } from "@/app/_components/ui/button";
import { getErrorMessage } from "@/utils/misc";

export default function Error({
  error,
  reset,
}: {
  error: Error;
  reset: () => void;
}) {
  const { message } = getErrorMessage(error);
  return (
    <div className="flex h-full flex-col place-content-center place-items-center gap-y-4 overflow-x-hidden bg-primary px-10 pb-28 pt-12 text-h2 text-primary-foreground">
      <h2>{message}</h2>
      <Button onClick={reset} variant="default">
        Try again
      </Button>
    </div>
  );
}
