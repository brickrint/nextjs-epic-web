"use client";

import cookies from "js-cookie";
import Link from "next/link";
import { usePathname } from "next/navigation";

import { THEME_COOKIE_NAME, type Theme } from "@/utils/theme.server";

import { Document } from "./_components/document";

export default function GlobalError() {
  const pathname = usePathname();

  const theme = (cookies.get(THEME_COOKIE_NAME) as Theme) ?? "light";

  return (
    <Document theme={theme}>
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
