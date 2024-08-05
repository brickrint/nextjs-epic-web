"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Document } from "./_components/document";

export default function GlobalError() {
  const pathname = usePathname();

  return (
    <Document>
      <div className="flex flex-col gap-6">
        <div className="flex flex-col gap-3">
          <h1>We can`t find this page:</h1>
          <pre className="whitespace-pre-wrap break-all text-body-lg">
            {pathname}
          </pre>
        </div>
        <Link href="/" className="text-body-md underline">
          Back to home
        </Link>
      </div>
    </Document>
  );
}
