"use client";

import { Button } from "@/app/_components/ui/button";
import { getErrorMessage } from "@/utils/misc";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="flex flex-col gap-y-4 overflow-x-hidden px-10 pb-28 pt-12">
      <h2>{getErrorMessage(error)}</h2>
      <Button onClick={reset} variant="ghost">
        Try again
      </Button>
    </div>
  );
}
