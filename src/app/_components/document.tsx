import { GeistSans } from "geist/font/sans";

import { cn } from "@/utils/styles";
import type { Theme } from "@/utils/theme.server";

export function Document({
  children,
  theme,
}: Readonly<{ children: React.ReactNode; theme: Theme }>) {
  return (
    <html
      lang="en"
      className={cn(GeistSans.variable, theme, "h-full overflow-x-hidden")}
    >
      <body className="flex h-full flex-col justify-between bg-background text-foreground">
        {children}
      </body>
    </html>
  );
}
