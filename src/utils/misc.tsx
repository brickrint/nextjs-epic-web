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
    } catch (e) {
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
