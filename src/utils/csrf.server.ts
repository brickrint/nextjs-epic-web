import { createCsrfProtect } from "@edge-csrf/nextjs";
import "server-only";

import { env } from "@/env";

export const csrfProtect = createCsrfProtect({
  cookie: {
    secure: env.NODE_ENV === "production",
    sameSite: "lax",
    httpOnly: true,
  },
});

export function getCsrfToken(headers: Headers) {
  return headers.get("X-CSRF-Token") ?? "missing";
}
