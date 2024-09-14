import type { ResponseCookies } from "next/dist/compiled/@edge-runtime/cookies";
import type { ReadonlyRequestCookies } from "next/dist/server/web/spec-extension/adapters/request-cookies";
import { z } from "zod";

export type Theme = "light" | "dark";

const ThemeSchema = z.enum(["light", "dark"]).default("light");

export const THEME_COOKIE_NAME = "_prefers-color-sheme";

export const ThemeFormSchema = z.object({
  theme: ThemeSchema,
});

export function getTheme(cookies: ReadonlyRequestCookies): Theme {
  const rawTheme = cookies.get(THEME_COOKIE_NAME);
  const theme = ThemeSchema.parse(rawTheme?.value);

  return theme;
}

export function setTheme(
  cookies: ReadonlyRequestCookies | ResponseCookies,
  newTheme: Theme,
) {
  cookies.set(THEME_COOKIE_NAME, newTheme, { sameSite: "strict" });
}
