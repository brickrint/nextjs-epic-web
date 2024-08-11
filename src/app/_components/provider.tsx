"use client";

import { HoneypotProvider } from "remix-utils/honeypot/react";

import { honeypot } from "@/utils/honeypot.server";

export function Provider({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const honeypotInputProps = honeypot.getInputProps();

  return (
    <HoneypotProvider {...honeypotInputProps}>{children}</HoneypotProvider>
  );
}
