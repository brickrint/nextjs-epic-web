"use client";

import Link from "next/link";




import { usePathname } from "next/navigation";

export default function GlobalError() {
  const pathname = usePathname();

  return (
    <div className="flex h-full flex-col place-content-center place-items-center gap-6 bg-background text-foreground">
      <div className="flex items-baseline">
        <h2>We can`t find this page:</h2>
        <pre className="whitespace-pre-wrap break-all text-center text-body-lg">
          {pathname}
        </pre>
      </div>
      <Link href="/" className="text-body-md underline">
        Back to home
      </Link>
    </div>
  );
}
