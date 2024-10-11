"use client";

import { usePathname } from "next/navigation";

import { cn } from "@/utils/styles";

export function Breadcrumbs({ ignorePath = "" }: { ignorePath?: string }) {
  const pathname = usePathname();

  const relativePath = pathname.replace(ignorePath, "");
  const breadcrumbs = relativePath.split("/").filter(Boolean);

  return breadcrumbs.map((breadcrumb, i, arr) => (
    <li
      key={i}
      className={cn("flex items-center gap-3", {
        "text-muted-foreground": i < arr.length - 1,
      })}
    >
      ▶️ {breadcrumb}
    </li>
  ));
}
