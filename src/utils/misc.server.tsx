import { NextResponse } from "next/server";

type Message = string;
type ErrorOptions = Omit<ResponseInit, "headers">;
/**
 * Does its best to get a string error message from an unknown error.
 */
export type Error = { message: Message } & ErrorOptions;
function isError(error: unknown): error is Error {
  if (
    error &&
    typeof error === "object" &&
    "message" in error &&
    typeof error.message === "string"
  ) {
    return true;
  }
  return false;
}
export function getErrorMessage(error: unknown): Error {
  if (isError(error)) {
    try {
      const possibleErrorObj = JSON.parse(error.message);

      if (isError(possibleErrorObj)) {
        return possibleErrorObj;
      }
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (_) {
      return error;
    }
  }
  console.error("Unable to get error message for error", error);
  return { message: "Unknown Error" };
}

export function invariantError(
  condition: unknown,
  message: Message | (() => Message),
  responseInit?: ErrorOptions,
): asserts condition {
  if (!condition) {
    throw new Error(
      JSON.stringify({
        message:
          typeof message === "function"
            ? message()
            : (message ??
              "An invariant failed, please provide a message to explain why."),
        ...responseInit,
      }),
    );
  }
}

/**
 * Provide a condition and if that condition is falsey, this throws a 400
 * Response with the given message.
 *
 * inspired by invariant from 'tiny-invariant'
 *
 * @example
 * invariantResponse(typeof value === 'string', `value must be a string`)
 *
 * @param condition The condition to check
 * @param message The message to throw
 * @param responseInit Additional response init options if a response is thrown
 *
 * @throws {Response} if condition is falsey
 */
export function invariantResponse(
  message?: string | (() => string),
  responseInit?: ResponseInit,
) {
  return new NextResponse(
    typeof message === "function"
      ? message()
      : (message ??
        "An invariant failed, please provide a message to explain why."),
    { status: 400, ...responseInit },
  );
}

export function getUserImgSrc(imageId?: string | null) {
  return imageId ? `/api/user-images/${imageId}` : "/assets/user.png";
}

export function getNoteImgSrc(imageId: string) {
  return `/api/note-images/${imageId}`;
}

export function getDomainUrl(request: Request) {
  const host =
    request.headers.get("X-Forwarded-Host") ??
    request.headers.get("host") ??
    new URL(request.url).host;
  const protocol = request.headers.get("X-Forwarded-Proto") ?? "http";
  return `${protocol}://${host}`;
}

export function getReferrerRoute(request: Request) {
  // spelling errors and whatever makes this annoyingly inconsistent
  // in my own testing, `referer` returned the right value, but 🤷‍♂️
  const referrer =
    request.headers.get("referer") ??
    request.headers.get("referrer") ??
    request.referrer;
  const domain = getDomainUrl(request);
  if (referrer?.startsWith(domain)) {
    return referrer.slice(domain.length);
  } else {
    return "/";
  }
}
