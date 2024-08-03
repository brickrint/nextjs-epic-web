"use client";

import { getErrorMessage } from "@/utils/misc";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="flex h-full flex-col gap-y-4 overflow-x-hidden px-10 pb-28 pt-12">
      <h2>Something went wrong!</h2>
      <button onClick={reset}>Try again</button>

      <pre>{getErrorMessage(error)}</pre>
    </div>
  );
}
