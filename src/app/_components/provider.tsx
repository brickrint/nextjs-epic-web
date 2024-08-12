"use client";

import { HoneypotProvider } from "remix-utils/honeypot/react";
import { type HoneypotInputProps } from "remix-utils/honeypot/server";

export function Provider({
  children,
  honeypotInputProps,
}: Readonly<{
  children: React.ReactNode;
  honeypotInputProps: HoneypotInputProps;
}>) {
  return (
    <HoneypotProvider {...honeypotInputProps}>{children}</HoneypotProvider>
  );
}
