import "@/styles/globals.css";
import { type Metadata } from "next";
import { cookies, headers } from "next/headers";
import Link from "next/link";
import os from "node:os";

import { getCsrfToken } from "@/utils/csrf.server";
import { honeypot } from "@/utils/honeypot.server";
import { ThemeSwitch } from "@/utils/theme.client";
import { getTheme } from "@/utils/theme.server";

import { Document } from "./_components/document";
import { Provider } from "./_components/provider";
import { SearchBar } from "./_components/search-bar";

export const metadata: Metadata = {
  title: "Next Epic Notes",
  description: "Your own captain's log",
  icons: [{ rel: "icon", url: "/favicon.ico" }],
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const { username } = os.userInfo();

  const headersList = headers();
  const cookiesList = cookies();
  const csrfToken = getCsrfToken(headersList);
  const theme = getTheme(cookiesList);

  return (
    <Document theme={theme}>
      <header className="container mx-auto py-6">
        <nav className="flex items-center justify-between gap-6">
          <Link href="/">
            <div className="font-light">epic</div>
            <div className="font-bold">notes</div>
          </Link>
          <div className="ml-auto max-w-sm flex-1">
            <SearchBar />
          </div>
          <Link className="underline" href="/users/kody/notes">
            Kody`s Notes
          </Link>
        </nav>
      </header>

      <Provider
        honeypotInputProps={honeypot.getInputProps()}
        csrfToken={csrfToken}
      >
        <main className="flex-1">{children}</main>

        <div className="container mx-auto flex justify-between">
          <Link href="/">
            <div className="font-light">epic</div>
            <div className="font-bold">notes</div>
          </Link>
          <div className="flex items-center gap-2">
            <p>Built with ♥️ by {username}</p>
            <ThemeSwitch userPreference={theme} />
          </div>
        </div>
      </Provider>
    </Document>
  );
}
