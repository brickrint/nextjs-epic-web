import "@/styles/globals.css";
import { BackpackIcon } from "@radix-ui/react-icons";
import { type Metadata } from "next";
import { cookies, headersList } from "next/headers";
import Image from "next/image";
import Link from "next/link";
import os from "node:os";
import { Toaster } from "sonner";

import { getCsrfToken } from "@/utils/csrf.server";
import { honeypot } from "@/utils/honeypot.server";
import { getUserImgSrc } from "@/utils/misc.server";
import { userHasRole } from "@/utils/permissions";
import { LogoutTimer } from "@/utils/session.client";
import { getOptionalUser } from "@/utils/session.server";
import { ThemeSwitch } from "@/utils/theme.client";
import { getTheme } from "@/utils/theme.server";
import { ShowToast } from "@/utils/toast.client";
import { parseHeaders as parseToastHeaders } from "@/utils/toast.server";

import { Document } from "./_components/document";
import { Provider } from "./_components/provider";
import { SearchBar } from "./_components/search-bar";
import { Button } from "./_components/ui/button";

export const metadata: Metadata = {
  title: "Next Epic Notes",
  description: "Your own captain's log",
  icons: [{ rel: "icon", url: "/favicon.ico" }],
};

export default async function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const { username } = os.userInfo();

  const headers = headersList();
  const cookiesList = cookies();
  const user = await getOptionalUser();
  const csrfToken = getCsrfToken(headers);
  const theme = getTheme(cookiesList);
  const toast = parseToastHeaders(headers);
  const userIsAdmin = userHasRole(user, "admin");

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
          <div className="flex items-center gap-10">
            {user ? (
              <div className="flex items-center gap-2">
                <Button asChild variant="secondary">
                  <Link
                    href={`/users/${user.username}`}
                    className="flex items-center gap-2"
                  >
                    <Image
                      className="h-8 w-8 rounded-full object-cover"
                      alt={user.name ?? user.username}
                      width={32}
                      height={32}
                      quality={100}
                      src={getUserImgSrc(user.image?.id)}
                    />
                    <span className="hidden text-body-sm font-bold sm:block">
                      {user.name ?? user.username}
                    </span>
                  </Link>
                </Button>
                {userIsAdmin ? (
                  <Button asChild variant="secondary">
                    <Link
                      href="/admin"
                      className="flex place-items-center gap-2"
                    >
                      <BackpackIcon name="backpack" />
                      <span className="hidden sm:block">Admin</span>
                    </Link>
                  </Button>
                ) : null}
              </div>
            ) : (
              <Button asChild variant="default" size="sm">
                <Link href="/login">Log In</Link>
              </Button>
            )}
          </div>
        </nav>
      </header>

      <Provider
        honeypotInputProps={honeypot.getInputProps()}
        csrfToken={csrfToken}
      >
        <main className="flex-1">
          {children}

          {toast && <ShowToast toast={toast} />}
        </main>

        <div className="container mx-auto flex justify-between">
          <Link href="/">
            <div className="font-light">epic</div>
            <div className="font-bold">notes</div>
          </Link>
          <div className="flex items-center gap-2">
            <p>Built with ❤️ by {username}</p>
            <ThemeSwitch userPreference={theme} />
          </div>
        </div>
        {user ? <LogoutTimer /> : null}
      </Provider>

      <Toaster closeButton position="top-center" />
    </Document>
  );
}
