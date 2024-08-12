import { CsrfError } from "@edge-csrf/nextjs";
import { NextResponse } from "next/server";
import type { MiddlewareConfig, NextMiddleware } from "next/server";

import { csrfProtect } from "./utils/csrf.server";
import { invariantResponse } from "./utils/misc.server";

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

  return response;
};

export const config: MiddlewareConfig = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
