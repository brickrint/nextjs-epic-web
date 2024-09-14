import { CsrfError } from "@edge-csrf/nextjs";
import { NextResponse } from "next/server";
import type { MiddlewareConfig, NextMiddleware } from "next/server";

import { csrfProtect } from "./utils/csrf.server";
import { invariantResponse } from "./utils/misc.server";
import { THEME_COOKIE_NAME, setTheme } from "./utils/theme.server";
import { middleware as toastMiddleware } from "./utils/toast.server";

export const middleware: NextMiddleware = async (request) => {
  const response = NextResponse.next();

  try {
    await csrfProtect(request, response);
  } catch (error) {
    if (error instanceof CsrfError) {
      return invariantResponse("Invalid CSRF token", { status: 403 });
    }

    throw error;
  }

  if (!request.cookies.has(THEME_COOKIE_NAME)) {
    setTheme(response.cookies, "light");
  }

  toastMiddleware(request, response);

  return response;
};

export const config: MiddlewareConfig = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
