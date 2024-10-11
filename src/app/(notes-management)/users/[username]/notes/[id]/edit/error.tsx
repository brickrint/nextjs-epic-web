"use client";

import { Button } from "@/app/_components/ui/button";
import { getErrorMessage } from "@/utils/misc.server";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const { message } = getErrorMessage(error);
  return (
    <div className="flex h-full flex-col place-content-center place-items-center gap-y-4 overflow-x-hidden bg-primary px-10 pb-28 pt-12 text-h2 text-primary-foreground">
      <h2>Something went wrong!</h2>
      <p>{message}</p>
      <Button onClick={reset} variant="secondary">
        Try again
      </Button>
    </div>
  );
}
