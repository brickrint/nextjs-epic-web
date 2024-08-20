import { remember } from "@epic-web/remember";
import { PrismaClient } from "@prisma/client";
import chalk from "chalk";

import { env } from "@/env";

export const db = await remember("db", async () => {
  const logThreshold = 0;

  const client = new PrismaClient({
    log:
      env.NODE_ENV === "development"
        ? [
            { level: "query", emit: "event" },
            { level: "error", emit: "stdout" },
            { level: "info", emit: "stdout" },
            { level: "warn", emit: "stdout" },
          ]
        : [{ level: "error", emit: "stdout" }],
  });
  client.$on("query", (e) => {
    if (e.duration < logThreshold) return;
    const color =
      e.duration < logThreshold * 1.1
        ? "green"
        : e.duration < logThreshold * 1.2
          ? "blue"
          : e.duration < logThreshold * 1.3
            ? "yellow"
            : e.duration < logThreshold * 1.4
              ? "redBright"
              : "red";
    const dur = chalk[color](`${e.duration}ms`);
    console.info(`prisma:query - ${dur} - ${e.query}`);
  });
  await client.$connect();
  return client;
});
