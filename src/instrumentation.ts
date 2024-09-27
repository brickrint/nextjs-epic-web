import { env } from "./env";

export async function register() {
  console.log("env.MOCKS", env.MOCKS);
  if (process.env.NEXT_RUNTIME === "nodejs" && env.MOCKS) {
    await import("tests/mocks");
  }
}
