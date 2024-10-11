import { env } from "./env";

export async function register() {
  if (process.env.NEXT_RUNTIME === "nodejs" && env.MOCKS) {
    await import("tests/mocks");
  }
}
