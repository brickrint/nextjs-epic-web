"use client";

import { TRPCReactProvider } from "@/trpc/react";
import { HoneypotProvider } from "remix-utils/honeypot/react";
import { type HoneypotInputProps } from "remix-utils/honeypot/server";

import { AuthenticityTokenProvider, type CSRFToken } from "@/utils/csrf.client";

export function Provider({
  children,
  honeypotInputProps,
  csrfToken,
}: Readonly<{
  children: React.ReactNode;
  honeypotInputProps: HoneypotInputProps;
  csrfToken: CSRFToken;
}>) {
  return (
    <TRPCReactProvider>
      <AuthenticityTokenProvider token={csrfToken}>
        <HoneypotProvider {...honeypotInputProps}>{children}</HoneypotProvider>
      </AuthenticityTokenProvider>
    </TRPCReactProvider>
  );
}
