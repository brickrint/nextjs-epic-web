"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { cn } from "@/utils/styles";

export function NavLink({
  href,
  className,
  activeClassName,
  ...props
}: Omit<React.ComponentProps<typeof Link>, "href"> & {
  href: string;
  activeClassName: string;
}) {
  const pathname = usePathname();
  const isActive = pathname.includes(href);

  return (
    <Link
      href={href}
      className={cn(className, isActive && activeClassName)}
      {...props}
    />
  );
}
