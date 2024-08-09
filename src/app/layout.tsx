import "@/styles/globals.css";

import os from "node:os";
import { type Metadata } from "next";
import Link from "next/link";

import { TRPCReactProvider } from "@/trpc/react";

import { Document } from "./_components/document";

export const metadata: Metadata = {
  title: "Next Epic Notes",
  description: "Your own captain's log",
  icons: [{ rel: "icon", url: "/favicon.ico" }],
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const { username } = os.userInfo();

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
        <main className="flex-1">{children}</main>
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
