import "@/styles/globals.css";
import { TRPCReactProvider } from "@/trpc/react";
import { type Metadata } from "next";
import { headers } from "next/headers";
import Link from "next/link";
import os from "node:os";

import { getCsrfToken } from "@/utils/csrf.server";
import { honeypot } from "@/utils/honeypot.server";

import { Document } from "./_components/document";
import { Provider } from "./_components/provider";

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
  const csrfToken = getCsrfToken(headersList);

  return (
    <Document>
      <header className="container mx-auto py-6">
        <nav className="flex justify-between">
          <Link href="/">
            <div className="font-light">epic</div>
            <div className="font-bold">notes</div>
          </Link>
          <Link className="underline" href="/signup">
            Signup
          </Link>
        </nav>
      </header>

      <TRPCReactProvider>
        <Provider
          honeypotInputProps={honeypot.getInputProps()}
          csrfToken={csrfToken}
        >
          <main className="flex-1">{children}</main>
        </Provider>
      </TRPCReactProvider>

      <div className="container mx-auto flex justify-between">
        <Link href="/">
          <div className="font-light">epic</div>
          <div className="font-bold">notes</div>
        </Link>
        <p>Built with ♥️ by {username}</p>
      </div>
    </Document>
  );
}
