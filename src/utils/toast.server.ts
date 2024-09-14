import type { ReadonlyHeaders } from "next/dist/server/web/spec-extension/adapters/headers";
import type { ReadonlyRequestCookies } from "next/dist/server/web/spec-extension/adapters/request-cookies";
import type { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

import { env } from "@/env";

const ToastSchema = z.object({
  id: z.string().optional(),
  type: z.enum(["success", "message"]),
  title: z.string(),
  description: z.string().optional(),
});

export type Toast = z.infer<typeof ToastSchema>;

export const cookieTokenKey = "one-time-token";
export const headerTokenKey = "x-toast-payload";

export function createCookie(cookies: ReadonlyRequestCookies, toast: Toast) {
  cookies.set({
    name: cookieTokenKey,
    value: JSON.stringify(toast),
    secure: env.NODE_ENV === "production",
    path: "/",
    sameSite: "lax",
    httpOnly: true,
  });
}

export function middleware(request: NextRequest, response: NextResponse) {
  const toast = request.cookies.get(cookieTokenKey);

  if (!toast) {
    return;
  }

  response.cookies.delete(cookieTokenKey);
  response.headers.set(headerTokenKey, toast.value);
}

export function parseHeaders(headers: ReadonlyHeaders) {
  const rawToast = headers.get(headerTokenKey);

  if (!rawToast) return null;

  const unsafeToast = JSON.parse(rawToast);

  const toast = ToastSchema.safeParse(unsafeToast);

  if (!toast.success) {
    return null;
  }

  return toast.data;
}
