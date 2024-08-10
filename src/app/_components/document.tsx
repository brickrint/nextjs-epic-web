import { GeistSans } from "geist/font/sans";

import { cn } from "@/utils/styles";

export function Document({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="en"
      className={cn(GeistSans.variable, "h-full overflow-x-hidden")}
    >
      <body className="flex h-full flex-col justify-between bg-background text-foreground">
        {children}
      </body>
    </html>
  );
}
