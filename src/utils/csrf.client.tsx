"use client";

import { type PropsWithChildren, createContext, useContext } from "react";

export type CSRFToken = string | undefined;
export type AuthenticityTokenProviderProps = { token: CSRFToken };

const Context = createContext<string | undefined>(undefined);

export function AuthenticityTokenProvider({
  token,
  children,
}: PropsWithChildren<AuthenticityTokenProviderProps>) {
  return <Context.Provider value={token}>{children}</Context.Provider>;
}

function useAuthenticityToken() {
  const token = useContext(Context);

  if (!token) {
    throw new Error(
      "useAuthenticityToken must be used within a AuthenticityTokenProvider",
    );
  }

  return token;
}

export function AuthenticityTokenInput() {
  const token = useAuthenticityToken();

  return <input type="hidden" value={token} />;
}
